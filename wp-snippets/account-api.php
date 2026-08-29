<?php
/**
 * Beauty Wishlist
 * Headless Account API — register, login, profile, and order history
 * for the native Next.js My Account experience (no iframe).
 *
 * IMPORTANT: replace the placeholder secret below with a long random
 * string (e.g. generate one at https://api.wordpress.org/secret-key/1.1/salt/
 * and use just one of the lines' value between the quotes).
 *
 * API:
 * POST /wp-json/custom/v1/register
 * POST /wp-json/custom/v1/login
 * GET  /wp-json/custom/v1/me
 * POST /wp-json/custom/v1/me
 * GET  /wp-json/custom/v1/orders
 * GET  /wp-json/custom/v1/orders/{id}
 */

if (!defined('ABSPATH')) {
    exit;
}

const BW_TOKEN_SECRET = 'CHANGE-THIS-TO-A-LONG-RANDOM-SECRET-STRING';
const BW_TOKEN_TTL = 30 * DAY_IN_SECONDS;


/**
 * Token helpers (stateless, HMAC-signed, no plugin required).
 */
function bw_generate_token($user_id) {

    $payload = base64_encode(json_encode([
        'uid' => $user_id,
        'exp' => time() + BW_TOKEN_TTL,
    ]));

    $signature = hash_hmac('sha256', $payload, BW_TOKEN_SECRET);

    return $payload . '.' . $signature;
}

function bw_verify_token($token) {

    if (!$token || strpos($token, '.') === false) {
        return false;
    }

    [$payload, $signature] = explode('.', $token, 2);

    $expected = hash_hmac('sha256', $payload, BW_TOKEN_SECRET);

    if (!hash_equals($expected, $signature)) {
        return false;
    }

    $data = json_decode(base64_decode($payload), true);

    if (!$data || !isset($data['uid'], $data['exp'])) {
        return false;
    }

    if (time() > $data['exp']) {
        return false;
    }

    return (int) $data['uid'];
}

function bw_get_authenticated_user($request) {

    $auth = $request->get_header('authorization');

    if (!$auth || stripos($auth, 'Bearer ') !== 0) {
        return null;
    }

    $token = trim(substr($auth, 7));
    $user_id = bw_verify_token($token);

    if (!$user_id) {
        return null;
    }

    $user = get_user_by('id', $user_id);

    return $user ?: null;
}

function bw_require_auth($request) {

    $user = bw_get_authenticated_user($request);

    if (!$user) {
        return new WP_Error('not_authenticated', 'Please log in to continue.', ['status' => 401]);
    }

    return $user;
}


/**
 * Build a user + address payload shared by register/login/me responses.
 */
function bw_build_user_payload($user) {

    $customer = new WC_Customer($user->ID);

    return [
        'id'         => $user->ID,
        'email'      => $user->user_email,
        'first_name' => $customer->get_first_name(),
        'last_name'  => $customer->get_last_name(),
        'billing'    => [
            'first_name' => $customer->get_billing_first_name(),
            'last_name'  => $customer->get_billing_last_name(),
            'address_1'  => $customer->get_billing_address_1(),
            'address_2'  => $customer->get_billing_address_2(),
            'city'       => $customer->get_billing_city(),
            'state'      => $customer->get_billing_state(),
            'postcode'   => $customer->get_billing_postcode(),
            'country'    => $customer->get_billing_country(),
            'phone'      => $customer->get_billing_phone(),
        ],
    ];
}


/**
 * Register.
 */
function bw_handle_register($request) {

    $email      = sanitize_email($request->get_param('email'));
    $password   = (string) $request->get_param('password');
    $first_name = sanitize_text_field($request->get_param('first_name'));
    $last_name  = sanitize_text_field($request->get_param('last_name'));

    if (!$email || !is_email($email) || !$password) {
        return new WP_Error('invalid_request', 'A valid email and password are required.', ['status' => 400]);
    }

    if (email_exists($email)) {
        return new WP_Error('email_exists', 'An account with this email already exists.', ['status' => 409]);
    }

    if (strlen($password) < 6) {
        return new WP_Error('weak_password', 'Password must be at least 6 characters.', ['status' => 400]);
    }

    $customer_id = wc_create_new_customer($email, '', $password, [
        'first_name' => $first_name,
        'last_name'  => $last_name,
    ]);

    if (is_wp_error($customer_id)) {
        return new WP_Error('registration_failed', $customer_id->get_error_message(), ['status' => 400]);
    }

    $user = get_user_by('id', $customer_id);

    return rest_ensure_response([
        'success' => true,
        'token'   => bw_generate_token($customer_id),
        'user'    => bw_build_user_payload($user),
    ]);
}


/**
 * Login.
 */
function bw_handle_login($request) {

    $email    = sanitize_email($request->get_param('email'));
    $password = (string) $request->get_param('password');

    if (!$email || !$password) {
        return new WP_Error('invalid_request', 'Email and password are required.', ['status' => 400]);
    }

    $user = get_user_by('email', $email);

    if (!$user) {
        return new WP_Error('invalid_credentials', 'Incorrect email or password.', ['status' => 401]);
    }

    $check = wp_authenticate($user->user_login, $password);

    if (is_wp_error($check)) {
        return new WP_Error('invalid_credentials', 'Incorrect email or password.', ['status' => 401]);
    }

    return rest_ensure_response([
        'success' => true,
        'token'   => bw_generate_token($user->ID),
        'user'    => bw_build_user_payload($user),
    ]);
}


/**
 * Get / update profile.
 */
function bw_handle_get_me($request) {

    $user = bw_require_auth($request);

    if (is_wp_error($user)) {
        return $user;
    }

    return rest_ensure_response([
        'success' => true,
        'user'    => bw_build_user_payload($user),
    ]);
}

function bw_handle_update_me($request) {

    $user = bw_require_auth($request);

    if (is_wp_error($user)) {
        return $user;
    }

    $customer = new WC_Customer($user->ID);

    $billing = $request->get_param('billing');

    if (is_array($billing)) {

        $map = [
            'first_name' => 'set_billing_first_name',
            'last_name'  => 'set_billing_last_name',
            'address_1'  => 'set_billing_address_1',
            'address_2'  => 'set_billing_address_2',
            'city'       => 'set_billing_city',
            'state'      => 'set_billing_state',
            'postcode'   => 'set_billing_postcode',
            'country'    => 'set_billing_country',
            'phone'      => 'set_billing_phone',
        ];

        foreach ($map as $key => $setter) {
            if (isset($billing[$key])) {
                $customer->{$setter}(sanitize_text_field($billing[$key]));
            }
        }
    }

    $first_name = $request->get_param('first_name');
    $last_name  = $request->get_param('last_name');

    if ($first_name !== null) {
        $customer->set_first_name(sanitize_text_field($first_name));
    }

    if ($last_name !== null) {
        $customer->set_last_name(sanitize_text_field($last_name));
    }

    $customer->save();

    return rest_ensure_response([
        'success' => true,
        'user'    => bw_build_user_payload($user),
    ]);
}


/**
 * Orders — matched by account AND by billing email, so guest-checkout
 * orders placed under the same email also show up.
 */
function bw_handle_get_orders($request) {

    $user = bw_require_auth($request);

    if (is_wp_error($user)) {
        return $user;
    }

    $orders_by_customer = wc_get_orders([
        'customer' => $user->ID,
        'limit'    => -1,
    ]);

    $orders_by_email = wc_get_orders([
        'billing_email' => $user->user_email,
        'limit'         => -1,
    ]);

    $all_orders = [];

    foreach (array_merge($orders_by_customer, $orders_by_email) as $order) {
        $all_orders[$order->get_id()] = $order;
    }

    usort($all_orders, function ($a, $b) {
        return $b->get_date_created()->getTimestamp() - $a->get_date_created()->getTimestamp();
    });

    $result = array_map(function ($order) {
        return [
            'id'           => $order->get_id(),
            'order_number' => $order->get_order_number(),
            'date'         => $order->get_date_created()->date('c'),
            'status'       => $order->get_status(),
            'total'        => $order->get_total(),
            'currency'     => $order->get_currency(),
            'item_count'   => $order->get_item_count(),
        ];
    }, array_values($all_orders));

    return rest_ensure_response([
        'success' => true,
        'orders'  => $result,
    ]);
}

function bw_handle_get_order($request) {

    $user = bw_require_auth($request);

    if (is_wp_error($user)) {
        return $user;
    }

    $order_id = (int) $request->get_param('id');
    $order    = wc_get_order($order_id);

    if (!$order) {
        return new WP_Error('order_not_found', 'Order not found.', ['status' => 404]);
    }

    $owns_by_customer = (int) $order->get_customer_id() === (int) $user->ID;
    $owns_by_email    = strtolower($order->get_billing_email()) === strtolower($user->user_email);

    if (!$owns_by_customer && !$owns_by_email) {
        return new WP_Error('forbidden', 'You do not have access to this order.', ['status' => 403]);
    }

    $items = [];

    foreach ($order->get_items() as $item) {

        $product   = $item->get_product();
        $thumbnail = null;

        if ($product) {
            $image_id = $product->get_image_id();
            if ($image_id) {
                $thumbnail = wp_get_attachment_image_url($image_id, 'thumbnail');
            }
        }

        $items[] = [
            'name'      => $item->get_name(),
            'quantity'  => $item->get_quantity(),
            'total'     => $item->get_total(),
            'thumbnail' => $thumbnail,
        ];
    }

    return rest_ensure_response([
        'success' => true,
        'order'   => [
            'id'               => $order->get_id(),
            'order_number'     => $order->get_order_number(),
            'date'             => $order->get_date_created()->date('c'),
            'status'           => $order->get_status(),
            'currency'         => $order->get_currency(),
            'total'            => $order->get_total(),
            'subtotal'         => $order->get_subtotal(),
            'shipping_total'   => $order->get_shipping_total(),
            'tax_total'        => $order->get_total_tax(),
            'payment_method'   => $order->get_payment_method_title(),
            'shipping_address' => $order->get_formatted_shipping_address() ?: $order->get_formatted_billing_address(),
            'billing_address'  => $order->get_formatted_billing_address(),
            'customer_note'    => $order->get_customer_note(),
            'items'            => $items,
        ],
    ]);
}


add_action('rest_api_init', function () {

    register_rest_route('custom/v1', '/register', [
        'methods'             => 'POST',
        'callback'            => 'bw_handle_register',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('custom/v1', '/login', [
        'methods'             => 'POST',
        'callback'            => 'bw_handle_login',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('custom/v1', '/me', [
        'methods'             => 'GET',
        'callback'            => 'bw_handle_get_me',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('custom/v1', '/me', [
        'methods'             => 'POST',
        'callback'            => 'bw_handle_update_me',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('custom/v1', '/orders', [
        'methods'             => 'GET',
        'callback'            => 'bw_handle_get_orders',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('custom/v1', '/orders/(?P<id>\d+)', [
        'methods'             => 'GET',
        'callback'            => 'bw_handle_get_order',
        'permission_callback' => '__return_true',
    ]);
});
