<?php
/**
 * Beauty Wishlist
 * WooCommerce Email Styling — matches the site's typography, colors, and
 * modern rounded-card layout across every order email (new order,
 * processing, on-hold, completed, invoice, etc.) without needing to
 * override each individual email template file.
 *
 * Also sets the custom footer line and links "Fahad Khalid" to his
 * linktr.ee.
 *
 * IMPORTANT — a few things to also set in wp-admin (WooCommerce →
 * Settings → Emails, scroll to the bottom for the color pickers):
 *   Base colour:              #8347C9
 *   Background colour:        #FBF7FC
 *   Body background colour:   #FFFFFF
 *   Body text colour:         #362B3F
 *   Footer text colour:       #7A6C84
 * These match the site's CSS variables exactly. The CSS below reinforces
 * and extends these with typography/layout details wp-admin's color
 * pickers can't control.
 */

if (!defined('ABSPATH')) {
    exit;
}


/**
 * Inject brand CSS into every WooCommerce email.
 */
add_filter('woocommerce_email_styles', function ($css) {

    $brand_css = "

        /* Beauty Wishlist by HS — email brand styling */

        body, #wrapper {
            background-color: #FBF7FC !important;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }

        #template_container {
            border: none !important;
            border-radius: 20px !important;
            overflow: hidden;
            box-shadow: 0 8px 30px rgba(109, 47, 176, 0.08) !important;
        }

        #template_header {
            background-color: #6D2FB0 !important;
            background: linear-gradient(135deg, #8347C9 0%, #6D2FB0 100%) !important;
            border-radius: 20px 20px 0 0 !important;
            padding: 36px 24px !important;
        }

        #template_header h1,
        #template_header h1 a {
            font-family: Georgia, 'Times New Roman', serif !important;
            font-style: italic !important;
            font-weight: 500 !important;
            color: #FFFFFF !important;
            font-size: 28px !important;
            letter-spacing: 0.02em;
        }

        #template_body {
            background-color: #FFFFFF !important;
        }

        #body_content {
            background-color: #FFFFFF !important;
        }

        #body_content_inner {
            color: #362B3F !important;
            font-size: 15px !important;
            line-height: 1.7 !important;
        }

        #body_content_inner p {
            color: #362B3F !important;
        }

        h1, h2, h3 {
            font-family: Georgia, 'Times New Roman', serif !important;
            font-style: italic !important;
            font-weight: 500 !important;
            color: #362B3F !important;
        }

        h2 {
            font-size: 22px !important;
            border-bottom: 1px solid #E9DEF0 !important;
            padding-bottom: 12px !important;
        }

        a {
            color: #6D2FB0 !important;
        }

        a.button,
        #body_content_inner a.button {
            background-color: #8347C9 !important;
            border-radius: 999px !important;
            color: #FFFFFF !important;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
            font-weight: 600 !important;
            padding: 14px 32px !important;
            text-decoration: none !important;
            display: inline-block;
            box-shadow: none !important;
            border: none !important;
        }

        table.td,
        table.td th {
            border-color: #E9DEF0 !important;
            color: #362B3F !important;
        }

        table.td th {
            background-color: #F5EEFB !important;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
            text-transform: uppercase;
            font-size: 11px !important;
            letter-spacing: 0.05em;
            color: #7A6C84 !important;
        }

        #template_footer td {
            background-color: #FBF7FC !important;
            border-radius: 0 0 20px 20px !important;
        }

        #template_footer #credit,
        #template_footer p {
            color: #7A6C84 !important;
            font-size: 12px !important;
            line-height: 1.6 !important;
        }

        #template_footer a {
            color: #6D2FB0 !important;
            text-decoration: none !important;
        }
    ";

    return $css . $brand_css;
});


/**
 * Custom footer line, with "Fahad Khalid" linked.
 */
add_filter('woocommerce_email_footer_text', function ($footer_text) {

    return 'Beauty Wishlist by Hina Shahab &mdash; Made by <a href="https://linktr.ee/fahadkhalid211" target="_blank" rel="noopener noreferrer">Fahad Khalid</a>';
});
