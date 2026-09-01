<?php
/**
 * Beauty Wishlist
 * REST/API cache control for headless WooCommerce.
 *
 * IMPORTANT:
 * - Keep public product/catalog GET requests cacheable.
 * - Never cache authenticated account/order responses.
 * - Never cache POST/PUT/PATCH/DELETE REST requests.
 * - Do not add restrictive security headers to REST responses.
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Detect requests that must never be cached.
 */
function bw_rest_request_must_not_cache($request) {
    $method = strtoupper($request->get_method());
    $route  = (string) $request->get_route();

    // Any state-changing REST request must stay dynamic.
    if (!in_array($method, ['GET', 'HEAD'], true)) {
        return true;
    }

    // All custom account endpoints can contain private customer data.
    if (strpos($route, '/custom/v1/me') === 0) {
        return true;
    }

    if (strpos($route, '/custom/v1/orders') === 0) {
        return true;
    }

    // Login/register/revoke endpoints must never be cached.
    if (
        strpos($route, '/custom/v1/login') === 0 ||
        strpos($route, '/custom/v1/register') === 0 ||
        strpos($route, '/custom/v1/revoke') === 0
    ) {
        return true;
    }

    return false;
}

/**
 * Prevent WordPress/LiteSpeed from storing private API responses.
 */
add_filter('rest_pre_serve_request', function ($served, $result, $request, $server) {

    if (!bw_rest_request_must_not_cache($request)) {
        return $served;
    }

    if (!defined('DONOTCACHEPAGE')) {
        define('DONOTCACHEPAGE', true);
    }

    if (function_exists('do_action')) {
        do_action('litespeed_control_set_nocache');
    }

    header('Cache-Control: private, no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    return $served;

}, 10, 4);

/**
 * Public headless endpoints can safely advertise short browser/proxy cache.
 * Product Store API remains controlled by LiteSpeed itself.
 */
add_filter('rest_post_dispatch', function ($response, $server, $request) {

    if (strtoupper($request->get_method()) !== 'GET') {
        return $response;
    }

    $route = (string) $request->get_route();

    $public_routes = [
        '/custom/v1/menu/main-menu',
        '/custom/v1/homepage-images',
        '/custom/v1/payment-methods',
    ];

    if (in_array($route, $public_routes, true)) {
        $response->header(
            'Cache-Control',
            'public, max-age=300, s-maxage=300, stale-while-revalidate=60'
        );
    }

    return $response;

}, 10, 3);
