<?php
/**
 * Beauty Wishlist
 * Headless Payment Methods API
 *
 * Exposes payment method info (description, bank account details) and the
 * store's Free Shipping threshold. Actual delivery cost now comes entirely
 * from real WooCommerce shipping rates, auto-matched by the frontend based
 * on the selected payment method — no separate fee mechanism.
 *
 * API:
 * https://new.beautywishlistbyhs.shop/wp-json/custom/v1/payment-methods
 */

if (!defined('ABSPATH')) {
    exit;
}


/**
 * Free Shipping Threshold — shared helper.
 *
 * Scans all shipping zones for an enabled "Free Shipping" method that
 * requires a minimum order amount, and returns the lowest such threshold
 * found. Used by the frontend's free-shipping progress widget.
 */
function bw_calculate_free_shipping_threshold() {

    $lowest = null;

    $zones   = WC_Shipping_Zones::get_zones();
    $zones[] = ['zone_id' => 0]; // include "Locations not covered by your other zones"

    foreach ($zones as $zone_data) {

        $zone = new WC_Shipping_Zone($zone_data['zone_id']);

        foreach ($zone->get_shipping_methods(true) as $method) {

            if ($method->id !== 'free_shipping' || $method->enabled !== 'yes') {
                continue;
            }

            $min_amount = isset($method->min_amount) ? floatval($method->min_amount) : 0;

            if ($min_amount > 0 && ($lowest === null || $min_amount < $lowest)) {
                $lowest = $min_amount;
            }
        }
    }

    return $lowest;
}


/**
 * Register Payment Methods API.
 */
add_action('rest_api_init', function () {

    register_rest_route('custom/v1', '/payment-methods', [
        'methods'             => 'GET',
        'callback'            => 'bw_get_payment_methods',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('custom/v1', '/free-shipping-threshold', [
        'methods'             => 'GET',
        'callback'            => 'bw_get_free_shipping_threshold',
        'permission_callback' => '__return_true',
    ]);

});


function bw_get_free_shipping_threshold() {

    return rest_ensure_response([
        'success'   => true,
        'threshold' => bw_calculate_free_shipping_threshold(),
        'currency'  => get_woocommerce_currency(),
    ]);
}


function bw_get_payment_methods() {

    $gateways = WC()->payment_gateways()->get_available_payment_gateways();
    $methods  = [];

    foreach (['cod', 'bacs'] as $id) {

        if (!isset($gateways[$id])) {
            continue;
        }

        $gateway  = $gateways[$id];
        $settings = get_option('woocommerce_' . $id . '_settings', []);

        $method = [
            'id'          => $id,
            'title'       => $gateway->get_title(),
            'description' => $gateway->get_description(),
        ];

        if ($id === 'bacs') {

            $accounts = get_option('woocommerce_bacs_accounts', []);

            $method['instructions'] = isset($settings['instructions']) ? $settings['instructions'] : '';

            $method['accounts'] = array_map(function ($account) {
                return [
                    'account_name'   => $account['account_name'] ?? '',
                    'account_number' => $account['account_number'] ?? '',
                    'bank_name'      => $account['bank_name'] ?? '',
                    'sort_code'      => $account['sort_code'] ?? '',
                    'iban'           => $account['iban'] ?? '',
                    'bic'            => $account['bic'] ?? '',
                ];
            }, is_array($accounts) ? $accounts : []);
        }

        $methods[] = $method;
    }

    return rest_ensure_response([
        'success' => true,
        'methods' => $methods,
    ]);
}
