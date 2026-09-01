<?php
/**
 * Beauty Wishlist
 * REST/API cache control for headless WooCommerce.
 *
 * Public catalog GET requests remain cacheable.
 * Authenticated/account/state-changing requests never cache.
 */

if (!defined('ABSPATH')) {
    exit;
}

function bw_rest_request_must_not_cache($request) {
    $method = strtoupper($request->get_method());
    $route  = (string) $request->get_route();

    if (!in_array($method, ['GET', 'HEAD'], true)) {
        return true;
    }

    if (strpos($route, '/custom/v1/me') === 0) {
        return true;
    }

    if (strpos($route, '/custom/v1/orders') === 0) {
        return true;
    }

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
 * Never cache private/state-changing REST responses.
 */
add_filter('rest_pre_serve_request', function ($served, $result, $request, $server) {

    if (!bw_rest_request_must_not_cache($request)) {
        return $served;
    }

    if (!defined('DONOTCACHEPAGE')) {
        define('DONOTCACHEPAGE', true);
    }

    do_action('litespeed_control_set_nocache');

    header('Cache-Control: private, no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    return $served;

}, 10, 4);

/**
 * Add explicit public caching for anonymous WooCommerce catalog requests.
 *
 * This lets CDN/proxy layers cache catalog responses instead of forwarding
 * every request to WordPress. Cart/account endpoints remain untouched.
 */
add_filter('rest_post_dispatch', function ($response, $server, $request) {

    if (strtoupper($request->get_method()) !== 'GET') {
        return $response;
    }

    $route = (string) $request->get_route();

    // WooCommerce Store API product catalog.
    if (strpos($route, '/wc/store/v1/products') === 0) {
        $has_auth = (string) $request->get_header('authorization');
        $has_cart = (string) $request->get_header('cart-token');

        if (!$has_auth && !$has_cart) {
            $response->header(
                'Cache-Control',
                'public, max-age=60, s-maxage=300, stale-while-revalidate=60'
            );
        }

        return $response;
    }

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
