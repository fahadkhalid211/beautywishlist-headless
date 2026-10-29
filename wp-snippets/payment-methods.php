<?php
/**
 * Beauty Wishlist
 * Headless Payment Methods API + Payment-Method-Based Discount & Tax
 *
 * Exposes payment method info (description, bank account details, discount info).
 *
 * Discount & Tax rule:
 * - Direct Bank Transfer (paid online via BACS): 4% discount on the subtotal.
 *   Zero tax applied.
 * - Cash on Delivery (COD): Flat 4% tax on the subtotal.
 *
 * API:
 * https://new.beautywishlistbyhs.shop/wp-json/custom/v1/payment-methods
 */

if (!defined('ABSPATH')) {
    exit;
}


/**
 * Apply the payment-method-based discount or tax rule to real orders placed through
 * the Store API (headless checkout). Official Store API extensibility
 * hook for modifying an order based on the incoming checkout request.
 */
add_action('woocommerce_store_api_checkout_update_order_from_request', function ($order, $request) {

    $payment_method = $request->get_param('payment_method');

    if ($payment_method === 'bacs') {

        // Paid online — wipe out 4% tax. Force every line item to the built-in
        // "Zero rate" tax class so any configured tax rates don't apply.
        // Shipping is added normally with no additional tax or fee.
        foreach ($order->get_items() as $item) {
            $item->set_tax_class('zero-rate');
            $item->save();
        }

        $order->calculate_totals();
        $order->save();

    } elseif ($payment_method === 'cod') {

        // Cash on Delivery — flat 4% tax on the subtotal.
        $subtotal = (float) $order->get_subtotal();
        $tax      = round($subtotal * 0.04);

        if ($tax > 0) {

            $item = new WC_Order_Item_Fee();
            $item->set_name('Tax (4%)');
            $item->set_amount($tax);
            $item->set_total($tax);
            $item->set_tax_status('none');
            $item->set_order_id($order->get_id());
            $item->save();

            $order->add_item($item);
            $order->calculate_totals();
            $order->save();

            if (!$order->get_fees()) {
                error_log('Beauty Wishlist: COD tax fee failed to persist on order #' . $order->get_id());
            }
        }
    }

}, 10, 2);


/**
 * Register Payment Methods API.
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

        $method = [
            'id'          => $id,
            'title'       => $gateway->get_title(),
            'description' => $gateway->get_description(),
        ];

        if ($id === 'bacs') {

            $method['discount_percent'] = 4;
            $method['discount_label']   = '4% Off';

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
