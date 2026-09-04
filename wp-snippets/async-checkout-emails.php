<?php
/**
 * Beauty Wishlist
 * Async Order Emails During Checkout
 *
 * WooCommerce sends order confirmation/notification emails synchronously
 * during checkout by default -- if the mail server is slow or unreachable
 * (as diagnosed here via a hanging SMTP connection), this blocks the
 * customer's entire checkout request until PHP's execution limit is hit.
 *
 * This defers ONLY emails triggered during an active headless checkout
 * request to a background task (via Action Scheduler, which WooCommerce
 * already depends on), so checkout completes immediately regardless of
 * mail server health. Every other email -- password resets, manual admin
 * resends, anything outside of an active checkout request -- is
 * completely unaffected and continues sending immediately as normal.
 *
 * After adding this, place a test order and check WooCommerce -> Status ->
 * Scheduled Actions for a "bw_send_deferred_email" entry to confirm the
 * email was queued (and check it actually arrives once SMTP is fixed).
 */

if (!defined('ABSPATH')) {
    exit;
}

$GLOBALS['bw_in_checkout_request'] = false;

/**
 * Mark the rest of this request as "inside an active checkout" the
 * moment our existing checkout hook fires -- this always fires early in
 * the headless checkout flow, before WooCommerce triggers order emails.
 */
add_action('woocommerce_store_api_checkout_update_order_from_request', function ($order, $request) {
    $GLOBALS['bw_in_checkout_request'] = true;
}, 1, 2);

/**
 * Intercept outgoing mail only while that flag is set, and reschedule it
 * to send via Action Scheduler instead of immediately.
 */
add_filter('pre_wp_mail', function ($return, $atts) {

    if (empty($GLOBALS['bw_in_checkout_request'])) {
        return $return; // not during checkout -- let it send normally
    }

    if (!function_exists('as_schedule_single_action')) {
        return $return; // Action Scheduler unavailable -- fall back to normal sending
    }

    as_schedule_single_action(
        time(),
        'bw_send_deferred_email',
        ['atts' => $atts],
        'beauty-wishlist-emails'
    );

    // Non-null short-circuits wp_mail()'s own sending -- tells it this
    // email has been "handled" without actually sending it yet.
    return true;

}, 10, 2);

/**
 * Actually send the email later, in the background.
 */
add_action('bw_send_deferred_email', function ($atts) {

    // Ensure this background send doesn't get deferred again.
    $GLOBALS['bw_in_checkout_request'] = false;

    wp_mail(
        $atts['to'],
        $atts['subject'],
        $atts['message'],
        $atts['headers'],
        $atts['attachments']
    );
});
