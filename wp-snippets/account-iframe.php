<?php
/**
 * Beauty Wishlist
 * Allow My Account to be embedded in the headless frontend's iframe.
 *
 * IMPORTANT: replace the placeholder domain(s) below with your actual
 * Next.js frontend URL(s) — e.g. https://beautywishlist.vercel.app and/or
 * your custom domain. You can list more than one, space-separated.
 */

if (!defined('ABSPATH')) {
    exit;
}

const BW_ALLOWED_FRAME_ANCESTORS = "https://YOUR-NEXTJS-DOMAIN.com http://localhost:3000";


/**
 * 1. Remove any X-Frame-Options header (WordPress core, a theme, or a
 *    security plugin like Wordfence/iThemes/Sucuri often sets this to
 *    SAMEORIGIN or DENY, which blocks ALL cross-origin framing) and
 *    replace it with a CSP that explicitly allows your frontend domain.
 *
 *    Scoped to only the My Account page so the rest of the site keeps
 *    its normal clickjacking protection.
 */
add_action('send_headers', function () {

    if (function_exists('is_account_page') && is_account_page()) {

        header_remove('X-Frame-Options');

        header("Content-Security-Policy: frame-ancestors 'self' " . BW_ALLOWED_FRAME_ANCESTORS . ";");
    }

}, PHP_INT_MAX);


/**
 * 2. Best-effort: mark WordPress auth/session cookies as SameSite=None
 *    so browsers are willing to send them inside a cross-site iframe.
 *
 *    Caveat: this does NOT guarantee login will persist inside the
 *    iframe on every browser. Safari's tracking prevention and Chrome's
 *    ongoing third-party cookie restrictions can still block this
 *    regardless of the SameSite attribute. If login still doesn't
 *    stick inside the iframe after this, that's a browser-level
 *    limitation, not a config issue — the reliable fallback is a
 *    same-tab redirect to My Account instead of an iframe.
 */
add_action('send_headers', function () {

    if (!function_exists('is_account_page') || !is_account_page()) {
        return;
    }

    if (headers_sent()) {
        return;
    }

    header_register_callback(function () {

        $headers = headers_list();
        header_remove('Set-Cookie');

        foreach ($headers as $header) {

            $is_wp_auth_cookie = stripos($header, 'Set-Cookie:') === 0 && (
                stripos($header, 'wordpress_logged_in_') !== false ||
                stripos($header, 'wordpress_sec_') !== false ||
                stripos($header, 'wp-settings-') !== false
            );

            if ($is_wp_auth_cookie && stripos($header, 'SameSite') === false) {
                $header .= '; SameSite=None; Secure';
            }

            header($header, false);
        }
    });

}, PHP_INT_MAX);
