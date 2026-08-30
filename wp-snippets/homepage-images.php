<?php
/**
 * Beauty Wishlist
 * Homepage Images Settings
 *
 * Adds a "Homepage Images" settings page (Settings → Homepage Images) with
 * a media uploader for the two hero section images and the full-width
 * banner background image. Exposes them via REST so the headless frontend
 * can use whatever is set here.
 *
 * API:
 * https://beautywishlistbyhs-shop-774165.hostingersite.com/wp-json/custom/v1/homepage-images
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('admin_menu', function () {

    add_options_page(
        'Homepage Images',
        'Homepage Images',
        'manage_options',
        'bw-homepage-images',
        'bw_render_homepage_images_page'
    );
});

add_action('admin_enqueue_scripts', function ($hook) {

    if ($hook !== 'settings_page_bw-homepage-images') {
        return;
    }

    wp_enqueue_media();
});

function bw_render_homepage_images_page() {

    if (
        isset($_POST['bw_homepage_images_nonce']) &&
        wp_verify_nonce($_POST['bw_homepage_images_nonce'], 'bw_save_homepage_images')
    ) {
        update_option('bw_hero_image_1', esc_url_raw($_POST['bw_hero_image_1'] ?? ''));
        update_option('bw_hero_image_2', esc_url_raw($_POST['bw_hero_image_2'] ?? ''));
        update_option('bw_banner_image', esc_url_raw($_POST['bw_banner_image'] ?? ''));

        echo '<div class="notice notice-success"><p>Saved.</p></div>';
    }

    $hero1  = get_option('bw_hero_image_1', '');
    $hero2  = get_option('bw_hero_image_2', '');
    $banner = get_option('bw_banner_image', '');

    ?>
    <div class="wrap">
        <h1>Homepage Images</h1>
        <p>Leave any field blank to fall back to your WooCommerce featured products automatically.</p>
        <form method="post">
            <?php wp_nonce_field('bw_save_homepage_images', 'bw_homepage_images_nonce'); ?>
            <table class="form-table">
                <tr>
                    <th scope="row">Hero Image 1 (large)</th>
                    <td>
                        <input type="text" id="bw_hero_image_1" name="bw_hero_image_1" value="<?php echo esc_attr($hero1); ?>" class="regular-text">
                        <button type="button" class="button bw-upload-btn" data-target="bw_hero_image_1">Choose Image</button>
                        <div class="bw-preview" id="bw_hero_image_1_preview">
                            <?php if ($hero1): ?>
                                <img src="<?php echo esc_url($hero1); ?>" style="max-width:220px;margin-top:10px;display:block;">
                            <?php endif; ?>
                        </div>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Hero Image 2 (small, overlapping)</th>
                    <td>
                        <input type="text" id="bw_hero_image_2" name="bw_hero_image_2" value="<?php echo esc_attr($hero2); ?>" class="regular-text">
                        <button type="button" class="button bw-upload-btn" data-target="bw_hero_image_2">Choose Image</button>
                        <div class="bw-preview" id="bw_hero_image_2_preview">
                            <?php if ($hero2): ?>
                                <img src="<?php echo esc_url($hero2); ?>" style="max-width:220px;margin-top:10px;display:block;">
                            <?php endif; ?>
                        </div>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Full-Width Banner Background</th>
                    <td>
                        <input type="text" id="bw_banner_image" name="bw_banner_image" value="<?php echo esc_attr($banner); ?>" class="regular-text">
                        <button type="button" class="button bw-upload-btn" data-target="bw_banner_image">Choose Image</button>
                        <div class="bw-preview" id="bw_banner_image_preview">
                            <?php if ($banner): ?>
                                <img src="<?php echo esc_url($banner); ?>" style="max-width:220px;margin-top:10px;display:block;">
                            <?php endif; ?>
                        </div>
                    </td>
                </tr>
            </table>
            <?php submit_button('Save Images'); ?>
        </form>
    </div>
    <script>
    jQuery(document).ready(function ($) {
        $('.bw-upload-btn').on('click', function (e) {
            e.preventDefault();
            var target = $(this).data('target');
            var frame = wp.media({
                title: 'Select Image',
                button: { text: 'Use this image' },
                multiple: false,
            });
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

    register_rest_route('custom/v1', '/homepage-images', [
        'methods'             => 'GET',
        'callback'            => 'bw_get_homepage_images',
        'permission_callback' => '__return_true',
    ]);
});

function bw_get_homepage_images() {

    return rest_ensure_response([
        'success'      => true,
        'hero_image_1' => get_option('bw_hero_image_1', ''),
        'hero_image_2' => get_option('bw_hero_image_2', ''),
        'banner_image' => get_option('bw_banner_image', ''),
    ]);
}
