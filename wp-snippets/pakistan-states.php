<?php
/**
 * Beauty Wishlist
 * Pakistan States
 *
 * The headless checkout's province dropdown sends full names (Punjab,
 * Sindh, KPK, Balochistan, Islamabad, AJK). If WooCommerce doesn't have a
 * matching registered states list for Pakistan (or has one using
 * different codes than what's sent), the Store API rejects the whole
 * address as invalid -- this is a very plausible cause of the
 * intermittent "Invalid parameters: billing_address, shipping_address"
 * checkout error.
 *
 * This explicitly defines Pakistan's states to exactly match what the
 * frontend sends, so validation can never reject them for this reason.
 */

if (!defined('ABSPATH')) {
    exit;
}

add_filter('woocommerce_states', function ($states) {

    $states['PK'] = [
        'Punjab'      => 'Punjab',
        'Sindh'       => 'Sindh',
        'KPK'         => 'KPK',
        'Balochistan' => 'Balochistan',
        'Islamabad'   => 'Islamabad',
        'AJK'         => 'AJK',
    ];

    return $states;
});
