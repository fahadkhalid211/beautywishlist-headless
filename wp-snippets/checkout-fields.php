<?php
/**
 * Beauty Wishlist
 * Checkout Field Adjustments
 *
 * The headless checkout doesn't collect a postcode/zip field, so it must
 * not be required by WooCommerce either, or address validation fails on
 * every order with "Postcode is required."
 */

if (!defined('ABSPATH')) {
    exit;
}

add_filter('woocommerce_billing_fields', function ($fields) {

    if (isset($fields['billing_postcode'])) {
        $fields['billing_postcode']['required'] = false;
    }

    return $fields;
});

add_filter('woocommerce_shipping_fields', function ($fields) {

    if (isset($fields['shipping_postcode'])) {
        $fields['shipping_postcode']['required'] = false;
    }

    return $fields;
});

add_filter('woocommerce_default_address_fields', function ($fields) {

    if (isset($fields['postcode'])) {
        $fields['postcode']['required'] = false;
    }

    return $fields;
});
