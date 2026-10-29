<?php
/**
 * Beauty Wishlist
 * Homepage Images Settings + Safe Homepage Data Snapshot Sync
 */

if (!defined('ABSPATH')) { exit; }

define('BW_FRONTEND_URL', 'https://beautywishlistbyhs.shop');
define('BW_REVALIDATION_SECRET', 'change-this-to-match-your-env-var');
define('BW_WC_STORE_API_BASE_URL', 'https://new.beautywishlistbyhs.shop/wp-json/wc/store/v1');
define('BW_HOMEPAGE_SNAPSHOT_OPTION', 'bw_homepage_snapshot');
define('BW_HOMEPAGE_SYNC_LOCK', 'bw_homepage_sync_lock');
define('BW_HOMEPAGE_SYNC_LOCK_SECONDS', 180);

add_action('admin_menu', function () { add_options_page('Homepage Images', 'Homepage Images', 'manage_options', 'bw-homepage-images', 'bw_render_homepage_images_page'); });
add_action('admin_enqueue_scripts', function ($hook) { if ($hook === 'settings_page_bw-homepage-images') { wp_enqueue_media(); } });

function bw_render_homepage_images_page() {
    if (isset($_POST['bw_homepage_images_nonce']) && wp_verify_nonce($_POST['bw_homepage_images_nonce'], 'bw_save_homepage_images')) {
        $hero1 = esc_url_raw($_POST['bw_hero_image_1'] ?? '');
        $hero2 = esc_url_raw($_POST['bw_hero_image_2'] ?? '');
        $banner = esc_url_raw($_POST['bw_banner_image'] ?? '');
        update_option('bw_hero_image_1', $hero1);
        update_option('bw_hero_image_2', $hero2);
        update_option('bw_banner_image', $banner);

        $snapshot = get_option(BW_HOMEPAGE_SNAPSHOT_OPTION, null);
        if (is_array($snapshot)) {
            $snapshot['hero_image_1'] = $hero1;
            $snapshot['hero_image_2'] = $hero2;
            $snapshot['banner_image'] = $banner;
            $snapshot['updated_at'] = current_time('c');
            update_option(BW_HOMEPAGE_SNAPSHOT_OPTION, $snapshot, false);
        }

        $reval = wp_remote_post(BW_FRONTEND_URL . '/api/revalidate', [
            'timeout' => 15,
            'headers' => ['X-BW-Sync-Secret' => BW_REVALIDATION_SECRET, 'Accept' => 'application/json'],
        ]);
        if (!is_wp_error($reval) && wp_remote_retrieve_response_code($reval) === 200) {
            echo '<div class="notice notice-success"><p>Saved and frontend cache purged successfully.</p></div>';
        } else {
            echo '<div class="notice notice-success"><p>Saved successfully. (Frontend cache will refresh automatically or via Refresh button below).</p></div>';
        }
    }
    if (isset($_POST['bw_refresh_nonce']) && wp_verify_nonce($_POST['bw_refresh_nonce'], 'bw_refresh_homepage')) {
        $response = wp_remote_post(BW_FRONTEND_URL . '/api/revalidate', ['timeout'=>120,'headers'=>['X-BW-Sync-Secret'=>BW_REVALIDATION_SECRET,'Accept'=>'application/json']]);
        if (is_wp_error($response)) echo '<div class="notice notice-error"><p>Refresh failed: ' . esc_html($response->get_error_message()) . '</p></div>';
        else {
            $code = wp_remote_retrieve_response_code($response); $body = json_decode(wp_remote_retrieve_body($response), true);
            if ($code === 200 && !empty($body['success'])) {
                $updated = !empty($body['snapshot']['updated_at']) ? $body['snapshot']['updated_at'] : ''; $warmed = !empty($body['warmed']); $message = 'Homepage data refreshed successfully.';
                if ($updated) $message .= ' Snapshot updated at ' . esc_html($updated) . '.'; if ($warmed) $message .= ' Homepage cache prewarmed.';
                echo '<div class="notice notice-success"><p>' . $message . '</p></div>';
            } else { $message = !empty($body['message']) ? $body['message'] : 'Unexpected response from frontend.'; echo '<div class="notice notice-error"><p>Refresh failed (HTTP ' . esc_html($code) . '): ' . esc_html($message) . '</p></div>'; }
        }
    }
    $hero1=get_option('bw_hero_image_1',''); $hero2=get_option('bw_hero_image_2',''); $banner=get_option('bw_banner_image',''); $snapshot=get_option(BW_HOMEPAGE_SNAPSHOT_OPTION,[]); $last_updated=is_array($snapshot)?($snapshot['updated_at']??''):'';
    ?>
    <div class="wrap"><h1>Homepage Images &amp; Data</h1><div class="notice notice-info" style="padding:12px 16px;margin:20px 0;"><p><strong>Homepage product data is snapshot-based.</strong> Visitors read the latest published snapshot and do not wait for WooCommerce.</p><?php if($last_updated): ?><p><strong>Last snapshot:</strong> <?php echo esc_html($last_updated); ?></p><?php else: ?><p><strong>No homepage snapshot exists yet.</strong> Run the refresh once after installing this snippet.</p><?php endif; ?><form method="post" style="margin-top:10px;"><?php wp_nonce_field('bw_refresh_homepage','bw_refresh_nonce'); ?><?php submit_button('Refresh Homepage Data','primary','submit',false); ?></form></div><hr style="margin:30px 0;"><p><strong>Hero &amp; Banner Images:</strong> Configure the hero section images and journey banner image shown on the Next.js frontend. Saving automatically updates the live website.</p><form method="post"><?php wp_nonce_field('bw_save_homepage_images','bw_homepage_images_nonce'); ?><table class="form-table"><tr><th scope="row">Hero Image 1 (large)</th><td><input type="text" id="bw_hero_image_1" name="bw_hero_image_1" value="<?php echo esc_attr($hero1); ?>" class="regular-text"><button type="button" class="button bw-upload-btn" data-target="bw_hero_image_1">Choose Image</button><div class="bw-preview" id="bw_hero_image_1_preview"><?php if($hero1): ?><img src="<?php echo esc_url($hero1); ?>" style="max-width:220px;margin-top:10px;display:block;"><?php endif; ?></div></td></tr><tr><th scope="row">Hero Image 2 (small, overlapping)</th><td><input type="text" id="bw_hero_image_2" name="bw_hero_image_2" value="<?php echo esc_attr($hero2); ?>" class="regular-text"><button type="button" class="button bw-upload-btn" data-target="bw_hero_image_2">Choose Image</button><div class="bw-preview" id="bw_hero_image_2_preview"><?php if($hero2): ?><img src="<?php echo esc_url($hero2); ?>" style="max-width:220px;margin-top:10px;display:block;"><?php endif; ?></div></td></tr><tr><th scope="row">Full-Width Banner Background</th><td><input type="text" id="bw_banner_image" name="bw_banner_image" value="<?php echo esc_attr($banner); ?>" class="regular-text"><button type="button" class="button bw-upload-btn" data-target="bw_banner_image">Choose Image</button><div class="bw-preview" id="bw_banner_image_preview"><?php if($banner): ?><img src="<?php echo esc_url($banner); ?>" style="max-width:220px;margin-top:10px;display:block;"><?php endif; ?></div></td></tr></table><?php submit_button('Save Images'); ?></form></div>
    <script>jQuery(document).ready(function($){$('.bw-upload-btn').on('click',function(e){e.preventDefault();var target=$(this).data('target');var frame=wp.media({title:'Select Image',button:{text:'Use this image'},multiple:false});frame.on('select',function(){var attachment=frame.state().get('selection').first().toJSON();$('#'+target).val(attachment.url);$('#'+target+'_preview').html('<img src="'+attachment.url+'" style="max-width:220px;margin-top:10px;display:block;">');});frame.open();});});</script>
    <?php
}

add_action('rest_api_init', function () {
    register_rest_route('custom/v1','/homepage-images',['methods'=>'GET','callback'=>'bw_get_homepage_images','permission_callback'=>'__return_true']);
    register_rest_route('custom/v1','/homepage-snapshot',['methods'=>'GET','callback'=>'bw_get_homepage_snapshot','permission_callback'=>'__return_true']);
    register_rest_route('custom/v1','/homepage-sync',['methods'=>'POST','callback'=>'bw_sync_homepage_snapshot','permission_callback'=>'bw_homepage_sync_permission']);
});
function bw_get_homepage_images(){return rest_ensure_response(['success'=>true,'hero_image_1'=>get_option('bw_hero_image_1',''),'hero_image_2'=>get_option('bw_hero_image_2',''),'banner_image'=>get_option('bw_banner_image','')]);}
function bw_get_homepage_snapshot(){ $snapshot=get_option(BW_HOMEPAGE_SNAPSHOT_OPTION,null); if(!is_array($snapshot)||empty($snapshot['categories'])) return new WP_Error('homepage_snapshot_missing','Homepage snapshot has not been created yet.',['status'=>404]); return rest_ensure_response(['success'=>true,'snapshot'=>$snapshot]); }
function bw_homepage_sync_permission(WP_REST_Request $request){$provided=(string)$request->get_header('X-BW-Sync-Secret');if(!$provided||!hash_equals((string)BW_REVALIDATION_SECRET,$provided))return new WP_Error('homepage_sync_forbidden','Invalid sync secret.',['status'=>401]);return true;}
function bw_fetch_store_api_json($path,$label){$url=trailingslashit(BW_WC_STORE_API_BASE_URL).ltrim($path,'/');$response=wp_remote_get($url,['timeout'=>20,'redirection'=>3,'headers'=>['Accept'=>'application/json'],'user-agent'=>'BeautyWishlist-HomepageSync/1.0']);if(is_wp_error($response))return new WP_Error('homepage_sync_request_error','WooCommerce request failed for '.$label.': '.$response->get_error_message(),['status'=>502]);$status=(int)wp_remote_retrieve_response_code($response);$body=wp_remote_retrieve_body($response);if($status!==200){$snippet=trim(wp_strip_all_tags($body));if(strlen($snippet)>300)$snippet=substr($snippet,0,300).'...';return new WP_Error('homepage_sync_http_error','WooCommerce Store API returned HTTP '.$status.' for '.$label.'. URL: '.$url.($snippet?' Response: '.$snippet:''),['status'=>502,'upstreamStatus'=>$status]);}$data=json_decode($body,true);if(json_last_error()!==JSON_ERROR_NONE||!is_array($data))return new WP_Error('homepage_sync_invalid_json','WooCommerce Store API returned invalid JSON for '.$label.'.',['status'=>502]);return $data;}

function bw_fetch_all_store_categories() {
    $all = [];
    $page = 1;
    while ($page <= 10) {
        $items = bw_fetch_store_api_json('products/categories?per_page=100&page=' . $page, 'categories page ' . $page);
        if (is_wp_error($items)) {
            if ($page === 1) return $items;
            break;
        }
        if (!is_array($items) || empty($items)) break;
        $all = array_merge($all, $items);
        if (count($items) < 100) break;
        $page++;
    }
    return $all;
}


function bw_enrich_categories_with_images($categories) {
    if (!is_array($categories) || empty($categories)) return $categories;

    foreach ($categories as &$cat) {
        if (!is_array($cat)) continue;

        // 1. If user uploaded a category image in WooCommerce, keep it
        if (!empty($cat['image']) && !empty($cat['image']['src'])) {
            continue;
        }

        $term_id = !empty($cat['id']) ? (int) $cat['id'] : 0;
        if ($term_id) {
            $thumb_id = get_term_meta($term_id, 'thumbnail_id', true);
            if ($thumb_id) {
                $src = wp_get_attachment_image_url($thumb_id, 'full');
                if ($src) {
                    $cat['image'] = [
                        'id' => (int) $thumb_id,
                        'src' => $src,
                        'alt' => get_post_meta($thumb_id, '_wp_attachment_image_alt', true) ?: ($cat['name'] ?? ''),
                    ];
                    continue;
                }
            }
        }

        // 2. If no image assigned, find the most recent published product's photo
        $term_slug = $cat['slug'] ?? '';
        if ($term_slug || $term_id) {
            $recent_prods = function_exists('wc_get_products') ? wc_get_products([
                'category' => [$term_slug ?: $term_id],
                'limit'    => 1,
                'orderby'  => 'date',
                'order'    => 'DESC',
                'status'   => 'publish',
            ]) : [];

            if (!empty($recent_prods)) {
                $prod = $recent_prods[0];
                $img_id = $prod->get_image_id();
                if ($img_id) {
                    $src = wp_get_attachment_image_url($img_id, 'full');
                    if ($src) {
                        $cat['image'] = [
                            'id' => (int) $img_id,
                            'src' => $src,
                            'alt' => get_post_meta($img_id, '_wp_attachment_image_alt', true) ?: $prod->get_name(),
                        ];
                    }
                }
            }
        }
    }
    unset($cat);

    return $categories;
}

function bw_sync_homepage_snapshot(){
    if(get_transient(BW_HOMEPAGE_SYNC_LOCK))return new WP_Error('homepage_sync_in_progress','A homepage sync is already running. The existing snapshot is still safe.',['status'=>409]);
    set_transient(BW_HOMEPAGE_SYNC_LOCK,time(),BW_HOMEPAGE_SYNC_LOCK_SECONDS);
    try{
        $categories=bw_fetch_all_store_categories(); if(is_wp_error($categories))return $categories;
        $categories=bw_enrich_categories_with_images($categories);
        // The Store API exposes published, catalog-visible products here. The explicit
        // visibility filter keeps Hidden products out; drafts are not published and are
        // therefore excluded as well. We additionally sanitize every returned item below.
        $sale_products=bw_fetch_store_api_json('products?on_sale=true&catalog_visibility=visible&per_page=8','sale products'); if(is_wp_error($sale_products))return $sale_products;
        $best_sellers=bw_fetch_store_api_json('products?orderby=popularity&order=desc&catalog_visibility=visible&per_page=8','best sellers'); if(is_wp_error($best_sellers))return $best_sellers;
        $new_products=bw_fetch_store_api_json('products?orderby=date&order=desc&catalog_visibility=visible&per_page=8','new products'); if(is_wp_error($new_products))return $new_products;

        $is_public_product=function($product){
            if(!is_array($product))return false;
            // Defense-in-depth: never publish non-published product objects even if an
            // upstream/cache/plugin unexpectedly returns them through Store API.
            if(isset($product['status']) && $product['status']!=='publish')return false;
            if(isset($product['catalog_visibility']) && $product['catalog_visibility']!=='visible')return false;
            return true;
        };
        $filter_public=function($items)use($is_public_product){return array_values(array_filter($items,$is_public_product));};

        $snapshot=[
            'categories'=>array_values(array_filter($categories,'is_array')),
            'sale'=>$filter_public($sale_products),
            'best_sellers'=>$filter_public($best_sellers),
            'new_products'=>$filter_public($new_products),
            'hero_image_1'=>get_option('bw_hero_image_1',''),
            'hero_image_2'=>get_option('bw_hero_image_2',''),
            'banner_image'=>get_option('bw_banner_image',''),
            'updated_at'=>current_time('c'),
            'version'=>wp_generate_uuid4(),
        ];
        if(empty($snapshot['categories'])||(empty($snapshot['sale'])&&empty($snapshot['best_sellers'])&&empty($snapshot['new_products'])))return new WP_Error('homepage_sync_empty_snapshot','WooCommerce returned an empty homepage snapshot. Existing data was kept.',['status'=>502]);
        update_option(BW_HOMEPAGE_SNAPSHOT_OPTION,$snapshot,false);
        return rest_ensure_response(['success'=>true,'snapshot'=>['version'=>$snapshot['version'],'updated_at'=>$snapshot['updated_at'],'counts'=>['categories'=>count($snapshot['categories']),'sale'=>count($snapshot['sale']),'best_sellers'=>count($snapshot['best_sellers']),'new_products'=>count($snapshot['new_products'])]]]);
    }finally{delete_transient(BW_HOMEPAGE_SYNC_LOCK);}
}
