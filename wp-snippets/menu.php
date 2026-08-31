/**
 * Beauty Wishlist
 * Headless Main Menu REST API
 *
 * API:
 * https://new.beautywishlistbyhs.shop/wp-json/custom/v1/menu/main-menu
 */

if (!defined('ABSPATH')) {
    exit;
}


/**
 * Register Main Menu API.
 */
add_action('rest_api_init', function () {

    register_rest_route('custom/v1', '/menu/main-menu', [
        'methods'             => 'GET',
        'callback'            => 'bw_get_main_menu',
        'permission_callback' => '__return_true',
    ]);

});


/**
 * Get Main Menu.
 *
 * Checks several common theme menu-location slugs (main-menu, primary,
 * etc.) and uses whichever one actually has a menu assigned -- different
 * themes register different location slugs (e.g. Astra uses "primary"),
 * so this survives future theme changes without needing an update here.
 */
function bw_get_main_menu() {

    $locations = get_nav_menu_locations();

    $candidate_locations = ['main-menu', 'primary', 'primary-menu', 'header-menu', 'header', 'top-menu'];

    $location = null;

    foreach ($candidate_locations as $candidate) {
        if (!empty($locations[$candidate])) {
            $location = $candidate;
            break;
        }
    }

    if (!$location) {

        return new WP_Error(
            'main_menu_not_found',
            'No menu is assigned to any of the expected menu locations.',
            [
                'status' => 404,
                'checked_locations' => $candidate_locations,
                'available_locations' => array_keys(
                    get_registered_nav_menus()
                ),
            ]
        );
    }

    $menu_id = (int) $locations[$location];

    if (!$menu_id) {

        return new WP_Error(
            'main_menu_not_assigned',
            'No menu assigned to ' . $location . '.',
            [
                'status' => 404,
            ]
        );
    }

    $menu = wp_get_nav_menu_object($menu_id);

    if (!$menu) {

        return new WP_Error(
            'main_menu_invalid',
            'Main menu could not be loaded.',
            [
                'status' => 404,
            ]
        );
    }

    return rest_ensure_response([
        'success'    => true,
        'location'   => $location,
        'menu_id'    => $menu_id,
        'menu_name'  => $menu->name,
        'items'      => bw_build_main_menu_tree($menu_id),
    ]);
}


/**
 * Build Main Menu tree.
 */
function bw_build_main_menu_tree($menu_id) {

    $items = wp_get_nav_menu_items(
        $menu_id,
        [
            'orderby' => 'menu_order',
            'order'   => 'ASC',
        ]
    );

    if (!$items) {
        return [];
    }

    $menu_items = [];


    foreach ($items as $item) {

        $object_id = (int) $item->object_id;

        $thumbnail = null;


        /**
         * Product image.
         */
        if (
            $item->object === 'product' ||
            get_post_type($object_id) === 'product'
        ) {

            $thumbnail_id = get_post_thumbnail_id($object_id);

            if ($thumbnail_id) {

                $thumbnail = [
                    'id' => $thumbnail_id,

                    'url' => wp_get_attachment_image_url(
                        $thumbnail_id,
                        'full'
                    ),

                    'alt' => get_post_meta(
                        $thumbnail_id,
                        '_wp_attachment_image_alt',
                        true
                    ),
                ];
            }
        }


        /**
         * Menu item data.
         */
        $menu_items[$item->ID] = [

            'id' => (int) $item->ID,

            'title' => wp_strip_all_tags(
                $item->title
            ),

            'url' => $item->url,

            'target' => $item->target ?: '_self',

            'parent' => (int) $item->menu_item_parent,

            'order' => (int) $item->menu_order,

            'type' => $item->type,

            'object' => $item->object,

            'object_id' => $object_id,

            'classes' => array_values(
                array_filter($item->classes)
            ),

            'description' => wp_strip_all_tags(
                $item->description
            ),

            'thumbnail' => $thumbnail,

            'children' => [],
        ];
    }


    /**
     * Build hierarchy.
     */
    $tree = [];


    foreach ($menu_items as $id => &$item) {

        $parent = $item['parent'];


        if (
            $parent > 0 &&
            isset($menu_items[$parent])
        ) {

            $menu_items[$parent]['children'][] = &$item;

        } else {

            $tree[] = &$item;
        }
    }


    unset($item);


    return $tree;
}


/**
 * CORS support.
 */
add_action('rest_api_init', function () {

    add_filter(
        'rest_pre_serve_request',
        function ($served) {

            header(
                'Access-Control-Allow-Origin: *'
            );

            header(
                'Access-Control-Allow-Methods: GET, OPTIONS'
            );

            header(
                'Access-Control-Allow-Headers: Content-Type, Authorization'
            );

            return $served;
        }
    );

}, 20);


/**
 * OPTIONS requests.
 */
add_action('init', function () {

    if (
        isset($_SERVER['REQUEST_METHOD']) &&
        $_SERVER['REQUEST_METHOD'] === 'OPTIONS'
    ) {

        header(
            'Access-Control-Allow-Origin: *'
        );

        header(
            'Access-Control-Allow-Methods: GET, OPTIONS'
        );

        header(
            'Access-Control-Allow-Headers: Content-Type, Authorization'
        );

        status_header(200);

        exit;
    }
});
