<?php
/**
 * Beauty Wishlist
 * Dynamic Payment Method Fees + Headless Payment Methods API
 *
 * Adds an "Extra Fee" setting field to Cash on Delivery and Bank Transfer
 * gateway settings screens (WooCommerce → Settings → Payments → [gateway]),
 * applies that fee to real orders placed via the Store API, and exposes the
 * current fee amounts publicly so the headless frontend can display them.
 *
 * API:
 * https://new.beautywishlistbyhs.shop/wp-json/custom/v1/payment-methods
 */

if (!defined('ABSPATH')) {
    exit;
}


/**
 * Add "Extra Fee" field to COD gateway settings.
 */
add_filter('woocommerce_settings_api_form_fields_cod', function ($fields) {

    $fields['extra_fee'] = [
        'title'       => 'Extra Fee (PKR)',
        'type'        => 'number',
        'description' => 'Additional fee charged when Cash on Delivery is selected. Leave as 0 for no fee.',
        'default'     => '0',
        'desc_tip'    => true,
    ];

    return $fields;
});


/**
 * Add "Extra Fee" field to Bank Transfer (BACS) gateway settings.
 */
add_filter('woocommerce_settings_api_form_fields_bacs', function ($fields) {

    $fields['extra_fee'] = [
        'title'       => 'Extra Fee (PKR)',
        'type'        => 'number',
        'description' => 'Additional fee charged when Direct Bank Transfer is selected. Leave as 0 for no fee.',
        'default'     => '0',
        'desc_tip'    => true,
    ];

    return $fields;
});


/**
 * Apply the configured fee to real orders placed through the Store API
 * (headless checkout). This is the official Store API extensibility hook
 * for modifying an order based on the incoming checkout request.
 */
add_action('woocommerce_store_api_checkout_update_order_from_request', function ($order, $request) {

    $payment_method = $request->get_param('payment_method');

    $fee   = 0;
    $label = '';

    if ($payment_method === 'cod') {

        $settings = get_option('woocommerce_cod_settings');
        $fee      = isset($settings['extra_fee']) ? floatval($settings['extra_fee']) : 0;
        $label    = 'Cash on Delivery Fee';

    } elseif ($payment_method === 'bacs') {

        $settings = get_option('woocommerce_bacs_settings');
        $fee      = isset($settings['extra_fee']) ? floatval($settings['extra_fee']) : 0;
        $label    = 'Bank Transfer Fee';
    }

    if ($fee > 0) {

        $item = new WC_Order_Item_Fee();
        $item->set_name($label);
        $item->set_amount($fee);
        $item->set_total($fee);
        $item->set_tax_status('none');

        $order->add_item($item);
        $order->calculate_totals();
    }

}, 10, 2);


/**
 * Register Payment Methods API.
 *
 * Returns the enabled COD / Bank Transfer gateways along with their
 * currently configured fee, so the frontend never has to hardcode amounts.
 */
add_action('rest_api_init', function () {

    register_rest_route('custom/v1', '/payment-methods', [
        'methods'             => 'GET',
        'callback'            => 'bw_get_payment_methods',
        'permission_callback' => '__return_true',
    ]);

});


function bw_get_payment_methods() {

    $gateways = WC()->payment_gateways()->get_available_payment_gateways();
    $methods  = [];

    foreach (['cod', 'bacs'] as $id) {

        if (!isset($gateways[$id])) {
            continue;
        }

        $gateway  = $gateways[$id];
        $settings = get_option('woocommerce_' . $id . '_settings', []);
        $fee      = isset($settings['extra_fee']) ? floatval($settings['extra_fee']) : 0;

        $methods[] = [
            'id'          => $id,
            'title'       => $gateway->get_title(),
            'description' => $gateway->get_description(),
            'fee'         => $fee,
        ];
    }

    return rest_ensure_response([
        'success' => true,
        'methods' => $methods,
    ]);
}
