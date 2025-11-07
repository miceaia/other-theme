<?php defined( 'ABSPATH' ) OR die( 'This script cannot be accessed directly.' );

global $help_portal_url;

/**
 * @var string The current host
 */
$domain = parse_url( site_url(), PHP_URL_HOST );

/**
 * @var string The path to which the 'help' server will respond
 */
$return_url = admin_url( 'admin.php?page=us-setup-wizard' );

$config = us_config( 'envato', array( 'purchase_url' => '#' ) );
$purchase_url = $config['purchase_url'];
?>
<form class="us-activation" id="activation" method="post" action="<?php echo esc_attr( $help_portal_url ); ?>/envato_auth">
	<input type="hidden" name="domain" value="<?php echo esc_attr( $domain ); ?>">
	<input type="hidden" name="return_url" value="<?php echo esc_attr( $return_url ); ?>">
	<input type="hidden" name="theme" value="<?php echo ( defined( 'US_ACTIVATION_THEMENAME' ) ) ? US_ACTIVATION_THEMENAME : US_THEMENAME; ?>">
	<input type="hidden" name="version" value="<?php echo US_THEMEVERSION; ?>">
	<div class="us-activation-status no">
		<span><?php echo sprintf( __( '%s is not activated', 'us' ), US_THEMENAME ); ?></span>
		<div class="us-activation-tooltip">
			<div class="us-activation-tooltip-sign"></div>
			<div class="us-activation-tooltip-text">
				<p><?php _e( 'By activating theme license you will unlock premium options:', 'us' ) ?></p>
				<ul>
					<li><?php _e( 'Ability to use the Setup Wizard', 'us' ) ?></li>
					<li><?php _e( 'Using Section Templates', 'us' ) ?></li>
					<li><?php _e( 'White Label feature', 'us' ) ?></li>
					<li><?php _e( 'Theme update notifications and ability to update the theme via one click', 'us' ) ?></li>
					<li><?php _e( 'Ability to install and update premium addons via one click', 'us' ) ?></li>
				</ul>
				<p><?php _e( 'Don\'t have valid license yet?', 'us' ) ?><br><a target="_blank" href="<?php echo esc_url( $purchase_url ); ?>"><?php echo sprintf( __( 'Purchase %s license', 'us' ), US_THEMENAME ); ?></a></p>
			</div>
		</div>
	</div>
	<input class="button button-primary" type="submit" value="<?php echo us_translate( 'Activate' ) ?>" name="activate">
</form>
