<?php
/**
 * Beauty Wishlist
 * Pakistan States
 *
 * Confirmed reproduction: the checkout error happens specifically when
 * city and state are both "Islamabad" -- a real, valid combination
 * (Islamabad is both a city and its own federal territory), but
 * apparently rejected by whatever state validation is active. Rather
 * than guess at another specific code/list that might have its own edge
 * case, this removes Pakistan from enum-style state validation entirely
 * -- the "state" field becomes free text for PK, with no fixed list to
 * validate against, so no value (including "Islamabad") can ever be
 * rejected by this mechanism again.
 */

if (!defined('ABSPATH')) {
    exit;
}

add_filter('woocommerce_states', function ($states) {

    $states['PK'] = [];

    return $states;
}, 999);
