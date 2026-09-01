<?php
/**
 * Beauty Wishlist
 * Client-Side Error Logging
 *
 * Receives error reports from the headless frontend (React error
 * boundaries + a global window error listener) and writes them to the
 * PHP error log, prefixed so they're easy to find/grep. Captures the
 * user agent specifically so browser-specific issues (e.g. Instagram's
 * in-app browser) can be identified from real affected visitors instead
 * of guessing.
 *
 * View these in Hostinger hPanel → Advanced → PHP Configuration → Error
 * Log, or wherever your PHP error log is accessible.
 *
 * API:
 * POST https://new.beautywishlistbyhs.shop/wp-json/custom/v1/log-error
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', function () {

    register_rest_route('custom/v1', '/log-error', [
        'methods'             => 'POST',
        'callback'            => 'bw_handle_log_error',
        'permission_callback' => '__return_true',
    ]);
});

function bw_handle_log_error($request) {

    // Basic per-IP throttle so this can't be used to flood the error log.
    $ip           = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown';
    $throttle_key = 'bw_log_error_' . md5($ip);
    $count        = (int) get_transient($throttle_key);

    if ($count >= 20) {
        return rest_ensure_response(['success' => true, 'throttled' => true]);
    }

    set_transient($throttle_key, $count + 1, 10 * MINUTE_IN_SECONDS);

    $body = $request->get_json_params();

    $message   = isset($body['message']) ? sanitize_text_field(mb_substr((string) $body['message'], 0, 500)) : '';
    $stack     = isset($body['stack']) ? sanitize_textarea_field(mb_substr((string) $body['stack'], 0, 2000)) : '';
    $url       = isset($body['url']) ? esc_url_raw(mb_substr((string) $body['url'], 0, 500)) : '';
    $type      = isset($body['type']) ? sanitize_text_field(mb_substr((string) $body['type'], 0, 50)) : 'unknown';
    $userAgent = isset($_SERVER['HTTP_USER_AGENT']) ? sanitize_text_field(mb_substr((string) $_SERVER['HTTP_USER_AGENT'], 0, 300)) : '';

    if (!$message) {
        return new WP_Error('missing_message', 'Error message is required.', ['status' => 400]);
    }

    $log_line = sprintf(
        'BW_CLIENT_ERROR | type=%s | url=%s | ua=%s | message=%s | stack=%s',
        $type,
        $url,
        $userAgent,
        $message,
        str_replace("\n", ' \\n ', $stack)
    );

    error_log($log_line);

    return rest_ensure_response(['success' => true]);
}
