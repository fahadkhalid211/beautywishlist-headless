<?php
/**
 * Beauty Wishlist
 * REST/API cache control for headless WooCommerce.
 *
 * Public catalog GET requests may be cached by a browser/CDN.
 * Authenticated, cart, account, and state-changing requests never cache.
 */

if (!defined('ABSPATH')) {
    exit;
}

function bw_rest_request_must_not_cache($request) {
    $method = strtoupper($request->get_method());
    $route = (string) $request->get_route();

    if (!in_array($method, ['GET', 'HEAD'], true)) {
        return true;
    }

    $private_routes = [
        '/custom/v1/me',
        '/custom/v1/orders',
        '/custom/v1/login',
        '/custom/v1/register',
        '/custom/v1/revoke',
        '/wc/store/v1/cart',
        '/wc/store/v1/checkout',
    ];

    foreach ($private_routes as $private_route) {
        if (strpos($route, $private_route) === 0) {
            return true;
        }
    }

    return false;
}

function bw_rest_is_public_catalog_request($request) {
    if (strtoupper($request->get_method()) !== 'GET') {
        return false;
    }

    $route = (string) $request->get_route();

    // WooCommerce product catalog, plus our own public, non-personalized
    // custom endpoints (menu, payment method info, homepage images). These
    // are fetched on nearly every page load and rarely change, so they're
    // safe to cache the same way as products/categories.
    $cacheable_prefixes = [
        '/wc/store/v1/products',
        '/custom/v1/menu',
        '/custom/v1/payment-methods',
        '/custom/v1/homepage-images',
    ];

    $matches_cacheable_prefix = false;

    foreach ($cacheable_prefixes as $prefix) {
        if (strpos($route, $prefix) === 0) {
            $matches_cacheable_prefix = true;
            break;
        }
    }

    if (!$matches_cacheable_prefix) {
        return false;
    }

    // A catalog response for an authenticated or cart-bearing request can be
    // personalized, so only anonymous requests may be stored publicly.
    if (is_user_logged_in()) {
        return false;
    }

    return !$request->get_header('authorization')
        && !$request->get_header('cart-token')
        && !$request->get_header('nonce');
}

/**
 * Keep LiteSpeed's server-side product cache aligned with the five-minute
 * shared-cache lifetime. This runs before LiteSpeed writes its cache metadata.
 */
add_filter('rest_post_dispatch', function ($response, $server, $request) {
    if (bw_rest_is_public_catalog_request($request)) {
        do_action('litespeed_control_set_ttl', 300);
    }

    return $response;
}, 10, 3);

/**
 * Send headers immediately before WordPress writes the REST response.
 *
 * Using rest_pre_serve_request is deliberate: response-object headers can be
 * replaced by cache plugins later in the request lifecycle.
 */
add_filter('rest_pre_serve_request', function ($served, $result, $request, $server) {
    if (bw_rest_request_must_not_cache($request)) {
        if (!defined('DONOTCACHEPAGE')) {
            define('DONOTCACHEPAGE', true);
        }

        do_action('litespeed_control_set_nocache');

        header('Cache-Control: private, no-store, no-cache, must-revalidate, max-age=0', true);
        header('Pragma: no-cache', true);
        header('Expires: 0', true);

        return $served;
    }

    if (bw_rest_is_public_catalog_request($request)) {
        // Browser: 60 seconds. Shared caches/CDNs: five minutes.
        header(
            'Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=60',
            true
        );

        // Helpful for CDNs that honor Surrogate-Control over Cache-Control.
        header('Surrogate-Control: max-age=300, stale-while-revalidate=60', true);
    }

    return $served;
}, 100, 4);
