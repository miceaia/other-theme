<?php defined( 'ABSPATH' ) or die( 'This script cannot be accessed directly.' );

global $us_template_directory_uri;

// Add needed assets for RTL languages
if ( is_rtl() ) {
	$html_dir_attr = ' dir="rtl"';
	$rtl_styles = '<link rel="stylesheet" id="us-rtl-css" href="' . $us_template_directory_uri . '/common/css/rtl.min.css" media="all" />';
} else {
	$html_dir_attr = '';
	$rtl_styles = '';
}

// Styles for correct preview
$preview_styles = '<style>';
$preview_styles .= ':active { pointer-events: none !important; }'; // disable clicks on links
$preview_styles .= '</style>';

?><!DOCTYPE HTML>
<html class="no-touch"<?= $html_dir_attr ?> <?php language_attributes( 'html' ) ?>>
	<head>
		<meta charset="<?php bloginfo( 'charset' ) ?>">
		<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
		<link rel="stylesheet" id="us-style-css" href="<?= $us_template_directory_uri ?>/css/style.min.css" media="all" />
		<link rel="stylesheet" id="us-woocommerce-css" href="<?= $us_template_directory_uri ?>/common/css/plugins/woocommerce.min.css" media="all" />
		<?= $rtl_styles ?>
		<?= $preview_styles ?>
		<?php us_setup_wizard_load_template( 'common/admin/templates/sw_site_preview/theme_styles_html' ); ?>
	</head>
	<body <?php body_class( 'l-body header_hor state_default' ) ?>>
		<div class="l-canvas">
			<?php us_setup_wizard_load_template( 'common/admin/templates/sw_site_preview/header_html' ) ?>
			<main class="l-main">
				<?php us_setup_wizard_load_template( 'common/admin/templates/sw_site_preview/content_html' ) ?>
			</main>
		</div>
		<footer	class="l-footer">
			<?php us_setup_wizard_load_template( 'common/admin/templates/sw_site_preview/footer_html' ) ?>
		</footer>
		<script src="<?= home_url() ?>/wp-includes/js/jquery/jquery.min.js" id="jquery-core-js"></script>
		<script src="<?= $us_template_directory_uri ?>/js/us.core.min.js" id="us-core-js"></script>
		<div class="hidden">
			<?php us_setup_wizard_load_template( 'common/admin/templates/sw_site_preview/templates_for_headers' ) ?>
			<?php us_setup_wizard_load_template( 'common/admin/templates/sw_site_preview/templates_for_footers' ) ?>
			<?php us_setup_wizard_load_template( 'common/admin/templates/sw_site_preview/templates_for_colors' ) ?>
			<?php us_setup_wizard_load_template( 'common/admin/templates/sw_site_preview/templates_for_fonts' ) ?>
		</div>
	<script>
		jQuery( document ).ready( function() {
			window.USReinitHeder = function() {
				$us.header = new window.USHeader( $us.headerSettings || {} );
			};
		} );
	</script>
	</body>
</html>
