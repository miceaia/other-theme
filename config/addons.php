<?php defined( 'ABSPATH' ) OR die( 'This script cannot be accessed directly.' );

/**
 * Addons configuration
 *
 * @filter us_config_addons
 */
global $help_portal_url;

return array(
	array(
		'name' => 'UpSolution Core',
		'slug' => 'us-core',
		'description' => __( 'Adds plenty of features for Impreza and Zephyr themes.', 'us' ),
		'premium' => TRUE,
		'source' => $us_template_directory . '/common/plugins/us-core.zip',
		'changelog_url' => $help_portal_url . '/' . strtolower( US_THEMENAME ) . '/us-core#upsolution-core-changelog',
		'version' => US_THEMEVERSION,
		'url' => $help_portal_url . '/' . strtolower( US_THEMENAME ) . '/us-core/',
	),
	array(
		'name' => 'WPBakery Page Builder',
		'slug' => 'js_composer',
		'description' => __( 'Save time working on your website content.', 'us' ),
		'premium' => TRUE,
		// for NOT free plugins we need to provide "url" and "changelog url"
		'changelog_url' => 'https://kb.wpbakery.com/docs/preface/release-notes/',
		'url' => 'https://codecanyon.net/item/visual-composer-page-builder-for-wordpress/242431',
	),
	array(
		'name' => 'FileBird PRO',
		'slug' => 'filebird',
		'folder' => 'filebird-pro',
		'description' => __( 'Create virtual folders to categorize your media uploads.', 'us' ),
		'premium' => TRUE,
		'changelog_url' => 'https://codecanyon.net/item/media-folders-manager-for-wordpress/21715379',
		'url' => 'https://codecanyon.net/item/media-folders-manager-for-wordpress/21715379',
		'icon_url' => 'https://ps.w.org/filebird/assets/icon-128x128.gif',
	),
	array(
		'name' => 'Slider Revolution',
		'slug' => 'revslider',
		'description' => __( 'Create interactive sliders and presentations.', 'us' ),
		'premium' => TRUE,
		'changelog_url' => 'http://codecanyon.net/item/slider-revolution-responsive-wordpress-plugin/2751380',
		'url' => 'https://codecanyon.net/item/slider-revolution-responsive-wordpress-plugin/2751380',
	),
	array(
		'name' => 'WooCommerce Multi Currency',
		'slug' => 'woocommerce-multi-currency',
		'description' => __( 'Allows your customers to switch between currencies.', 'us' ),
		'premium' => TRUE,
		'changelog_url' => 'https://codecanyon.net/item/woocommerce-multi-currency/20948446',
		'url' => 'https://codecanyon.net/item/woocommerce-multi-currency/20948446',
		'icon_url' => 'https://ps.w.org/woo-multi-currency/assets/icon-128x128.gif',
	),
	array(
		'name' => 'WooCommerce Bulk Editor',
		'slug' => 'woo-bulk-editor/index',
		'description' => __( 'Manage shop products in the robust and flexible way.', 'us' ),
		'premium' => TRUE,
		'changelog_url' => 'https://codecanyon.net/item/woobe-woocommerce-bulk-editor-professional/21779835',
		'url' => 'https://codecanyon.net/item/woobe-woocommerce-bulk-editor-professional/21779835',
		'icon_url' => 'https://ps.w.org/woo-bulk-editor/assets/icon-128x128.png',
	),
	array(
		'name' => 'Ultimate Addons for WPBakery Page Builder',
		'slug' => 'Ultimate_VC_Addons',
		'description' => 'Includes WPBakery Page Builder premium addon elements',
		'premium' => TRUE,
		'hide_in_list' => TRUE, // hide on the Addons admin page, but allow to update from the US help portal
		'changelog_url' => 'https://ultimate.brainstormforce.com/changelog/',
		'url' => 'https://codecanyon.net/item/ultimate-addons-for-visual-composer/',
	),
	array(
		'name' => 'Advanced Custom Fields PRO',
		'slug' => 'acf',
		'folder' => 'advanced-custom-fields-pro', // needed when the folder name is different from the main PHP file
		'description' => __( 'Add fields to edit screens and display their values on website pages.', 'us' ),
		'premium' => TRUE,
		'changelog_url' => 'https://www.advancedcustomfields.com/changelog/',
		'url' => 'https://www.advancedcustomfields.com/pro/',
	),
	array(
		'name' => 'Advanced Custom Fields',
		'slug' => 'advanced-custom-fields',
		'depend_on_plugin' => 'acf', // hide if ACF PRO plugin is set
		'description' => __( 'Add fields to edit screens and display their values on website pages.', 'us' ),
	),
	array(
		'name' => 'WooCommerce',
		'slug' => 'woocommerce',
		'description' => __( 'Most popular eCommerce plugin that allows you to sell anything.', 'us' ),
		'icon_ext' => 'gif', // in case when PNG icon doesn't exist
	),
	array(
		'name' => 'Custom Post Type UI',
		'slug' => 'custom-post-type-ui',
		'description' => __( 'Create and manage custom post types and taxonomies.', 'us' ),
	),
	array(
		'name' => 'Contact Form 7',
		'slug' => 'contact-form-7',
		'description' => __( 'Create customizable contact forms and edit the mail contents.', 'us' ),
	),
	array(
		'name' => 'Duplicate Page',
		'slug' => 'duplicate-page',
		'description' => __( 'Duplicate Posts, Pages and Custom Posts using single click.', 'us' ),
		'icon_ext' => 'jpg', // in case when PNG icon doesn't exist
	),
	array(
		'name' => 'TablePress',
		'slug' => 'tablepress',
		'description' => __( 'Create and manage tables.', 'us' ),
	),
	array(
		'name' => 'UpdraftPlus Backup',
		'slug' => 'updraftplus',
		'description' => __( 'Backup your website files and database.', 'us' ),
		'icon_ext' => 'jpg', // in case when PNG icon doesn't exist
	),
	array(
		'name' => 'Post Views Counter',
		'slug' => 'post-views-counter',
		'description' => __( 'Allows you to display how many times a post, page or custom post type had been viewed.', 'us' ),
	),
	array(
		'name' => 'Converter for Media',
		'slug' => 'webp-converter-for-media',
		'description' => __( 'Optimize images and convert to WebP.', 'us' ),
	),
);
