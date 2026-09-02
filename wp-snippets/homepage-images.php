<?php
/**
 * Beauty Wishlist
 * Homepage Images Settings + Safe Homepage Data Snapshot Sync
 *
 * The Next.js homepage reads a stored snapshot instead of querying
 * WooCommerce for every visitor. This file keeps that snapshot in a single
 * WordPress option and only replaces it after every required WooCommerce
 * request succeeds.
 */

if (!defined('ABSPATH')) {
    exit;
}

define('BW_FRONTEND_URL', 'https://beautywishlistbyhs.shop');
define('BW_REVALIDATION_SECRET', 'change-this-to-match-your-env-var');
define('BW_WC_STORE_API_BASE_URL', 'https://new.beautywishlistbyhs.shop/wp-json/wc/store/v1');
define('BW_HOMEPAGE_SNAPSHOT_OPTION', 'bw_homepage_snapshot');
define('BW_HOMEPAGE_SYNC_LOCK', 'bw_homepage_sync_lock');
define('BW_HOMEPAGE_SYNC_LOCK_SECONDS', 180);

add_action('admin_menu', function () {
    add_options_page('Homepage Images', 'Homepage Images', 'manage_options', 'bw-homepage-images', 'bw_render_homepage_images_page');
});

add_action('admin_enqueue_scripts', function ($hook) {
    if ($hook === 'settings_page_bw-homepage-images') {
        wp_enqueue_media();
    }
});

function bw_render_homepage_images_page() {
    if (isset($_POST['bw_homepage_images_nonce']) && wp_verify_nonce($_POST['bw_homepage_images_nonce'], 'bw_save_homepage_images')) {
        update_option('bw_hero_image_1', esc_url_raw($_POST['bw_hero_image_1'] ?? ''));
        update_option('bw_hero_image_2', esc_url_raw($_POST['bw_hero_image_2'] ?? ''));
        update_option('bw_banner_image', esc_url_raw($_POST['bw_banner_image'] ?? ''));
        echo '<div class="notice notice-success"><p>Saved.</p></div>';
    }

    if (isset($_POST['bw_refresh_nonce']) && wp_verify_nonce($_POST['bw_refresh_nonce'], 'bw_refresh_homepage')) {
        $response = wp_remote_post(BW_FRONTEND_URL . '/api/revalidate', [
            'timeout' => 120,
            'headers' => [
                'X-BW-Sync-Secret' => BW_REVALIDATION_SECRET,
                'Accept' => 'application/json',
            ],
        ]);

        if (is_wp_error($response)) {
            echo '<div class="notice notice-error"><p>Refresh failed: ' . esc_html($response->get_error_message()) . '</p></div>';
        } else {
            $code = wp_remote_retrieve_response_code($response);
            $body = json_decode(wp_remote_retrieve_body($response), true);
            if ($code === 200 && !empty($body['success'])) {
                $updated = !empty($body['snapshot']['updated_at']) ? $body['snapshot']['updated_at'] : '';
                $warmed = !empty($body['warmed']);
                $message = 'Homepage data refreshed successfully.';
                if ($updated) $message .= ' Snapshot updated at ' . esc_html($updated) . '.';
                if ($warmed) $message .= ' Homepage cache prewarmed.';
                echo '<div class="notice notice-success"><p>' . $message . '</p></div>';
            } else {
                $message = !empty($body['message']) ? $body['message'] : 'Unexpected response from frontend.';
                echo '<div class="notice notice-error"><p>Refresh failed (HTTP ' . esc_html($code) . '): ' . esc_html($message) . '</p></div>';
            }
        }
    }

    $hero1 = get_option('bw_hero_image_1', '');
    $hero2 = get_option('bw_hero_image_2', '');
    $banner = get_option('bw_banner_image', '');
    $snapshot = get_option(BW_HOMEPAGE_SNAPSHOT_OPTION, []);
    $last_updated = is_array($snapshot) ? ($snapshot['updated_at'] ?? '') : '';
    ?>
    <div class="wrap">
        <h1>Homepage Images &amp; Data</h1>
        <div class="notice notice-info" style="padding:12px 16px;margin:20px 0;">
            <p><strong>Homepage product data is snapshot-based.</strong> Visitors read the latest published snapshot and do not wait for WooCommerce.</p>
            <?php if ($last_updated): ?>
                <p><strong>Last snapshot:</strong> <?php echo esc_html($last_updated); ?></p>
            <?php else: ?>
                <p><strong>No homepage snapshot exists yet.</strong> Run the refresh once after installing this snippet.</p>
            <?php endif; ?>
            <form method="post" style="margin-top:10px;">
                <?php wp_nonce_field('bw_refresh_homepage', 'bw_refresh_nonce'); ?>
                <?php submit_button('Refresh Homepage Data', 'primary', 'submit', false); ?>
            </form>
        </div>
        <hr style="margin:30px 0;">
        <p><em>The image fields below are retained for compatibility. The current Next.js homepage uses local frontend images.</em></p>
        <form method="post">
            <?php wp_nonce_field('bw_save_homepage_images', 'bw_homepage_images_nonce'); ?>
            <table class="form-table">
                <tr><th scope="row">Hero Image 1 (large)</th><td><input type="text" id="bw_hero_image_1" name="bw_hero_image_1" value="<?php echo esc_attr($hero1); ?>" class="regular-text"><button type="button" class="button bw-upload-btn" data-target="bw_hero_image_1">Choose Image</button><div class="bw-preview" id="bw_hero_image_1_preview"><?php if ($hero1): ?><img src="<?php echo esc_url($hero1); ?>" style="max-width:220px;margin-top:10px;display:block;"><?php endif; ?></div></td></tr>
                <tr><th scope="row">Hero Image 2 (small, overlapping)</th><td><input type="text" id="bw_hero_image_2" name="bw_hero_image_2" value="<?php echo esc_attr($hero2); ?>" class="regular-text"><button type="button" class="button bw-upload-btn" data-target="bw_hero_image_2">Choose Image</button><div class="bw-preview" id="bw_hero_image_2_preview"><?php if ($hero2): ?><img src="<?php echo esc_url($hero2); ?>" style="max-width:220px;margin-top:10px;display:block;"><?php endif; ?></div></td></tr>
                <tr><th scope="row">Full-Width Banner Background</th><td><input type="text" id="bw_banner_image" name="bw_banner_image" value="<?php echo esc_attr($banner); ?>" class="regular-text"><button type="button" class="button bw-upload-btn" data-target="bw_banner_image">Choose Image</button><div class="bw-preview" id="bw_banner_image_preview"><?php if ($banner): ?><img src="<?php echo esc_url($banner); ?>" style="max-width:220px;margin-top:10px;display:block;"><?php endif; ?></div></td></tr>
            </table>
            <?php submit_button('Save Images'); ?>
        </form>
    </div>
    <script>
    jQuery(document).ready(function ($) {
        $('.bw-upload-btn').on('click', function (e) {
            e.preventDefault();
            var target = $(this).data('target');
            var frame = wp.media({title:'Select Image',button:{text:'Use this image'},multiple:false});
            frame.on('select', function () {
                var attachment = frame.state().get('selection').first().toJSON();
                $('#' + target).val(attachment.url);
                $('#' + target + '_preview').html('<img src="' + attachment.url + '" style="max-width:220px;margin-top:10px;display:block;">');
            });
            frame.open();
        });
    });
    </script>
    <?php
}

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/homepage-images', ['methods'=>'GET','callback'=>'bw_get_homepage_images','permission_callback'=>'__return_true']);
    register_rest_route('custom/v1', '/homepage-snapshot', ['methods'=>'GET','callback'=>'bw_get_homepage_snapshot','permission_callback'=>'__return_true']);
    register_rest_route('custom/v1', '/homepage-sync', ['methods'=>'POST','callback'=>'bw_sync_homepage_snapshot','permission_callback'=>'bw_homepage_sync_permission']);
});

function bw_get_homepage_images() {
    return rest_ensure_response(['success'=>true,'hero_image_1'=>get_option('bw_hero_image_1',''),'hero_image_2'=>get_option('bw_hero_image_2',''),'banner_image'=>get_option('bw_banner_image','')]);
}

function bw_get_homepage_snapshot() {
    $snapshot = get_option(BW_HOMEPAGE_SNAPSHOT_OPTION, null);
    if (!is_array($snapshot) || empty($snapshot['categories'])) {
        return new WP_Error('homepage_snapshot_missing','Homepage snapshot has not been created yet.',['status'=>404]);
    }
    return rest_ensure_response(['success'=>true,'snapshot'=>$snapshot]);
}

function bw_homepage_sync_permission(WP_REST_Request $request) {
    $provided = (string) $request->get_header('X-BW-Sync-Secret');
    if (!$provided || !hash_equals((string) BW_REVALIDATION_SECRET, $provided)) {
        return new WP_Error('homepage_sync_forbidden','Invalid sync secret.',['status'=>401]);
    }
    return true;
}

function bw_fetch_store_api_json($path, $label) {
    $url = trailingslashit(BW_WC_STORE_API_BASE_URL) . ltrim($path, '/');
    $response = wp_remote_get($url, [
        'timeout' => 20,
        'redirection' => 3,
        'headers' => ['Accept'=>'application/json'],
        'user-agent' => 'BeautyWishlist-HomepageSync/1.0',
    ]);

    if (is_wp_error($response)) {
        return new WP_Error('homepage_sync_request_error','WooCommerce request failed for ' . $label . ': ' . $response->get_error_message(),['status'=>502]);
    }

    $status = (int) wp_remote_retrieve_response_code($response);
    $body = wp_remote_retrieve_body($response);

    if ($status !== 200) {
        $snippet = trim(wp_strip_all_tags($body));
        if (strlen($snippet) > 300) $snippet = substr($snippet, 0, 300) . '...';
        return new WP_Error('homepage_sync_http_error','WooCommerce Store API returned HTTP ' . $status . ' for ' . $label . '. URL: ' . $url . ($snippet ? ' Response: ' . $snippet : ''),['status'=>502,'upstreamStatus'=>$status]);
    }

    $data = json_decode($body, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
        return new WP_Error('homepage_sync_invalid_json','WooCommerce Store API returned invalid JSON for ' . $label . '.',['status'=>502]);
    }

    return $data;
}

function bw_sync_homepage_snapshot() {
    if (get_transient(BW_HOMEPAGE_SYNC_LOCK)) {
        return new WP_Error('homepage_sync_in_progress','A homepage sync is already running. The existing snapshot is still safe.',['status'=>409]);
    }

    set_transient(BW_HOMEPAGE_SYNC_LOCK, time(), BW_HOMEPAGE_SYNC_LOCK_SECONDS);

    try {
        $categories = bw_fetch_store_api_json('products/categories?per_page=100', 'categories');
        if (is_wp_error($categories)) return $categories;

        $sale_products = bw_fetch_store_api_json('products?on_sale=true&per_page=8', 'sale products');
        if (is_wp_error($sale_products)) return $sale_products;

        $best_sellers = bw_fetch_store_api_json('products?orderby=popularity&order=desc&per_page=8', 'best sellers');
        if (is_wp_error($best_sellers)) return $best_sellers;

        $new_products = bw_fetch_store_api_json('products?orderby=date&order=desc&per_page=8', 'new products');
        if (is_wp_error($new_products)) return $new_products;

        $snapshot = [
            'categories' => array_values(array_filter($categories, 'is_array')),
            'sale' => array_values(array_filter($sale_products, 'is_array')),
            'best_sellers' => array_values(array_filter($best_sellers, 'is_array')),
            'new_products' => array_values(array_filter($new_products, 'is_array')),
            'updated_at' => current_time('c'),
            'version' => wp_generate_uuid4(),
        ];

        if (empty($snapshot['categories']) || (empty($snapshot['sale']) && empty($snapshot['best_sellers']) && empty($snapshot['new_products']))) {
            return new WP_Error('homepage_sync_empty_snapshot','WooCommerce returned an empty homepage snapshot. Existing data was kept.',['status'=>502]);
        }

        update_option(BW_HOMEPAGE_SNAPSHOT_OPTION, $snapshot, false);

        return rest_ensure_response([
            'success'=>true,
            'snapshot'=>[
                'version'=>$snapshot['version'],
                'updated_at'=>$snapshot['updated_at'],
                'counts'=>[
                    'categories'=>count($snapshot['categories']),
                    'sale'=>count($snapshot['sale']),
                    'best_sellers'=>count($snapshot['best_sellers']),
                    'new_products'=>count($snapshot['new_products']),
                ],
            ],
        ]);
    } finally {
        delete_transient(BW_HOMEPAGE_SYNC_LOCK);
    }
}
