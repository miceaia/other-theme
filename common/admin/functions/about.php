<?php defined( 'ABSPATH' ) OR die( 'This script cannot be accessed directly.' );

/**
 * About admin page
 */

if ( ! function_exists( 'us_check_updates' ) ) {
	add_action( 'init', 'us_check_updates', 501 );
	/**
	 * Сheck for updates.
	 */
	function us_check_updates() {
		global $pagenow;

		if (
			$pagenow == 'admin.php'
			AND isset( $_GET['page'], $_GET['check_updates'] )
			AND $_GET['page'] == 'us-home'
		) {
			delete_transient( 'us_update_theme_data_' . US_THEMENAME );
			delete_transient( 'us_update_addons_data_' . US_THEMENAME );
			delete_transient( 'us_demo_import_config_data_' . US_THEMENAME );
			delete_option( 'us_addons_version' );

			wp_update_plugins();
			wp_update_themes();

			wp_redirect( admin_url( 'admin.php?page=us-home' ) );
		}
	}
}

if ( ! defined( 'US_CORE_VERSION') ) {
	add_action( 'admin_menu', 'us_add_info_home_page_parent', 9 );
	function us_add_info_home_page_parent() {
		add_menu_page( US_THEMENAME . ': ' . us_translate_x( 'About', 'personal data group label' ), apply_filters( 'us_theme_name', US_THEMENAME ), 'manage_options', 'us-home', 'us_welcome_page', NULL, '59.001' );
	}

	add_action( 'admin_menu', 'us_add_info_home_page', 15 );
} else {
	add_action( 'admin_menu', 'us_add_info_home_page', 50 );
}

function us_add_info_home_page() {
	if ( ! defined( 'US_CORE_VERSION') ) {
		$parent_slug = 'us-home';
	} else {
		$parent_slug = 'us-theme-options';
	}
	add_submenu_page( $parent_slug, US_THEMENAME . ': ' . us_translate_x( 'About', 'personal data group label' ), us_translate_x( 'About', 'personal data group label' ), 'manage_options', 'us-home', 'us_welcome_page' );
}

function us_welcome_page() {
	global $help_portal_url;

	/**
	 * @var string The current host
	 */
	$domain = parse_url( site_url(), PHP_URL_HOST );

	/**
	 * @var array HTTP GET variables
	 */
	$get_variables = array(
		'secret' => '',
		'domain' => $domain,
		'version' => US_THEMEVERSION,
	);

	if (
		isset( $_GET['deactivate'] )
		AND (
			get_option( 'us_license_activated' )
			OR get_option( 'us_license_dev_activated' )
		)
	) {
		$get_variables['secret'] = get_option( 'us_license_secret' );

		delete_option( 'us_license_activated' );
		delete_option( 'us_license_dev_activated' );
		delete_option( 'us_license_secret' );
		delete_transient( 'us_update_addons_data_' . US_THEMENAME );
		update_option( 'us_can_modify_favorite_sections', 0 );

		us_api( '/us.api/license_deactivation/:us_themename', $get_variables, US_API_RETURN_ARRAY );

	} elseif ( isset( $_GET['activation_action'] ) AND $_GET['activation_action'] == 'activate' ) {

		if ( ! empty( $_GET['secret'] ) ) {
			$get_variables['secret'] = (string) $_GET['secret'];
		}

		// Get license data
		$us_api_response = us_api( '/envato_auth', $get_variables, US_API_RETURN_ARRAY );
		if (
			is_array( $us_api_response['body'] )
			AND isset( $us_api_response['body']['status'] )
			AND $us_api_response['body']['status'] == 1
		) {
			if ( isset( $us_api_response['body']['site_type'] ) AND $us_api_response['body']['site_type'] == 'dev' ) {
				update_option( 'us_license_dev_activated', /* set value */1 );
				delete_option( 'us_license_activated' );
			} else {
				update_option( 'us_license_activated', /* set value */1 );
				delete_option( 'us_license_dev_activated' );
			}

			update_option( 'us_license_secret', $get_variables['secret'] );
			delete_transient( 'us_update_addons_data_' . US_THEMENAME );
		}

	} elseif (
		get_option( 'us_license_activated' )
		OR get_option( 'us_license_dev_activated' )
	) {
		$get_variables['secret'] = (string) get_option( 'us_license_secret' );

		// Get license data
		$us_api_response = us_api( '/envato_auth', $get_variables, US_API_RETURN_ARRAY );
		if (
			is_array( $us_api_response['body'] )
			AND isset( $us_api_response['body']['status'] )
			AND $us_api_response['body']['status'] !== 1
		) {
			delete_option( 'us_license_dev_activated' );
			delete_option( 'us_license_activated' );
			delete_option( 'us_license_secret' );
			delete_transient( 'us_update_addons_data_' . US_THEMENAME );
			update_option( 'us_can_modify_favorite_sections', 0 );

		} elseif ( isset( $us_api_response['body']['can_modify_favorite_sections'] ) ) {
			update_option( 'us_can_modify_favorite_sections', (int) $us_api_response['body']['can_modify_favorite_sections'] );
		}
	}

	if ( get_option( 'us_license_dev_activated' ) AND function_exists( 'us_update_option' ) ) {
		us_update_option( 'maintenance_mode', /* set value */1 );
	}

	// Get current theme name
	$us_themename = defined( 'US_ACTIVATION_THEMENAME' )
		? US_ACTIVATION_THEMENAME
		: US_THEMENAME;
	?>

	<div class="wrap about-wrap us-home">
		<div class="us-header">
			<h1><?= sprintf( __( 'Welcome to %s', 'us' ), '<strong>' . US_THEMENAME . ' ' . US_THEMEVERSION . '</strong>' ) ?></h1>
			<div class="us-header-links">
				<a href="<?= esc_url( $help_portal_url ); ?>/<?= strtolower( $us_themename ) ?>/" target="_blank">
					<?php _e( 'Online Documentation', 'us' ) ?>
				</a>
				<a href="<?= esc_url( $help_portal_url ); ?>/<?= strtolower( $us_themename ) ?>/tickets/" target="_blank">
					<?php _e( 'Support Portal', 'us' ) ?>
				</a>
				<a href="<?= esc_url( $help_portal_url ); ?>/<?= strtolower( $us_themename ) ?>/changelog/" target="_blank">
					<?php _e( 'Theme Changelog', 'us' ) ?>
				</a>
			</div>
		</div>
		<?php

		if ( defined( 'US_DEV_SECRET' ) OR defined( 'US_THEMETEST_CODE' ) ) {
			?>
			<div class="us-activation">
				<div class="us-activation-status yes">
					<?= sprintf( __( '%s is activated', 'us' ), US_THEMENAME ); ?>
					<?php if ( defined( 'US_DEV_SECRET' ) ) {
						echo ' via US_DEV_SECRET';
					} else {
						echo '<!-- via US_THEMETEST_CODE -->';
					} ?>
				</div>
			</div>
			<?php
		} elseif (
			get_option( 'us_license_activated' )
			OR get_option( 'us_license_dev_activated' )
		) {
			?>
			<div class="us-activation">
				<?php if ( get_option( 'us_license_dev_activated' ) ): ?>
				<div class="us-activation-status dev">
					<?= sprintf( __( '%s is activated for development', 'us' ), US_THEMENAME ); ?>
				</div>
				<?php else: ?>
				<div class="us-activation-status yes">
					<?= sprintf( __( '%s is activated', 'us' ), US_THEMENAME ); ?>
				</div>
				<?php endif ?>
				<a class="usof-button" href="<?= admin_url( 'admin.php?page=us-home&check_updates=1' ) ?>">
					<?= __( 'Check for Updates', 'us' )?>
				</a>
				<a class="usof-button" href="<?= admin_url( 'admin.php?page=us-home&deactivate=1' )?>" onclick="return confirm('<?= esc_attr( us_translate( 'Are you sure you want to do this?' ) ) ?>')">
					<?= us_translate( 'Deactivate' ) ?>
				</a>
			</div>
			<?php
			// Load Activation Form
		} else {
			us_setup_wizard_load_template( 'common/admin/templates/license_activation_form' );
		}

		if ( defined( 'US_CORE_VERSION' ) ) {

			// White Label Settings
			if (
				defined( 'US_DEV_SECRET' )
				OR defined( 'US_THEMETEST_CODE' )
				OR get_option( 'us_license_activated' )
				OR get_option( 'us_license_dev_activated' )
			) {
				global $usof_options;
				usof_load_options_once();
				$usof_options = array_merge( usof_defaults(), $usof_options );

				if ( ! did_action( 'wp_enqueue_media' ) ) {
					wp_enqueue_media();
				}

				// Enqueue USOF JS files separately, when US_DEV is set
				if ( defined( 'US_DEV' ) ) {
					foreach ( us_config( 'assets-admin.js', array() ) as $key => $admin_js_file ) {
						wp_enqueue_script( 'usof-js-' . $key, US_CORE_URI . $admin_js_file, array(), US_CORE_VERSION );
					}
				} else {
					wp_enqueue_script( 'usof-scripts', US_CORE_URI . '/usof/js/usof.min.js', array( 'jquery' ), US_CORE_VERSION, TRUE );
				}

				// Output UI
				echo '<div class="usof-container for_white_label" data-ajaxurl="' . admin_url( 'admin-ajax.php' ) . '">';
				echo '<form class="usof-form" method="post" action="#" autocomplete="off">';

				// Output _nonce and _wp_http_referer hidden fields for ajax secuirity checks
				wp_nonce_field( 'usof-actions' );

				$config = us_config( 'white-label', array(), TRUE );
				$hidden_fields_values = array(); // preserve values for hidden fields

				foreach ( $config as $section_id => &$section ) {
					if ( isset( $section['place_if'] ) AND ! $section['place_if'] ) {
						if ( isset( $section['fields'] ) ) {
							$hidden_fields_values = array_merge( $hidden_fields_values, array_intersect_key( $usof_options, $section['fields'] ) );
						}
						continue;
					}
					echo '<section class="usof-section current" data-id="' . $section_id . '">';
					echo '<div class="usof-section-header" data-id="' . $section_id . '">';
					echo '<h3>' . $section['title'] . '</h3><span class="usof-section-header-control"></span></div>';
					echo '<div class="usof-section-content" style="display: block">';
					foreach ( $section['fields'] as $field_name => &$field ) {
						us_load_template(
							'usof/templates/field', array(
								'name' => $field_name,
								'id' => 'usof_' . $field_name,
								'field' => $field,
								'values' => &$usof_options,
							)
						);
						unset( $hidden_fields_values[ $field_name ] );
					}
					echo '</div></section>';
				}
				unset( $section );

				// Control for saving changes button
				echo '<div class="usof-control for_save status_clear">';
				echo '<button class="usof-button button-primary type_save" type="button"><span>' . us_translate( 'Save Changes' ) . '</span>';
				echo '<span class="usof-preloader"></span></button>';
				echo '<div class="usof-control-message"></div>';
				echo '</div>';

				echo '</form>';
				echo '</div>';
			}
		}
		?>
	</div>
	<?php
}
