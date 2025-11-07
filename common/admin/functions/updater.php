<?php defined( 'ABSPATH' ) OR die( 'This script cannot be accessed directly.' );

/**
 * Updater of the plugins from UpSolution Help Portal
 */

if ( ! function_exists( 'us_api_addons' ) ) {
	add_filter( 'us_config_addons', 'us_api_addons' );

	/**
	 * @param array $plugins The plugins
	 * @param bool $force_request The force request
	 * @return array
	 */
	function us_api_addons( $plugins, $force_request = FALSE ) {
		$addons_version = get_option( 'us_addons_version' );

		if (
			get_option( 'us_license_activated' )
			OR get_option( 'us_license_dev_activated' )
			// OR defined( 'US_DEV_SECRET' )
		) {
			// Get transient data
			$transient = 'us_update_addons_data_' . US_THEMENAME;
			if ( ! empty( $addons_version )
				AND $addons_version == US_THEMEVERSION
				AND ( $data = get_transient( $transient ) ) !== FALSE
			) {
				$update_addons_data = $data;
			}
			if ( empty( $update_addons_data ) OR $force_request ) {
				/**
				 * @var array HTTP GET variables
				 */
				$get_variables = array(
					'secret' => (string) get_option( 'us_license_secret' ),
					'domain' => parse_url( site_url(), PHP_URL_HOST ),
					'current_version' => urlencode( US_THEMEVERSION ),
				);
				// Note: We do not need to check this often, since after theme update addons data is reset
				$us_api_response = us_api( '/us.api/check_addons_update/:us_themename', $get_variables, US_API_RETURN_OBJECT );
				if ( is_array( $us_api_response ) AND ! empty( $us_api_response['body'] ) ) {
					set_transient( $transient, $us_api_response['body'], 6 * HOUR_IN_SECONDS );
					$update_addons_data = $us_api_response['body'];
					update_option( 'us_addons_version', US_THEMEVERSION );
				}
			}
			if ( ! empty( $update_addons_data->data ) ) {
				foreach ( $plugins as &$plugin ) {
					$slug = $plugin['slug'];

					// If the ACF PRO license is activated, we do not use the portal for updates
					if (
						$slug === 'acf'
						AND get_option( 'acf_pro_license' )
						AND ! function_exists( '_option_acf_pro_license' )
					) {
						continue;
					}

					if ( isset( $update_addons_data->data->$slug ) ) {
						$addon_data = $update_addons_data->data->$slug;

						// Do not update version and package from Help Portal if config has higher version
						if ( isset( $plugin['version'] ) AND version_compare( $addon_data->new_version, $plugin['version'], '<' ) ) {
							continue;
						}

						$plugin['version'] = $addon_data->new_version;
						$plugin['package'] = $addon_data->package;
					}
				}
				unset( $plugin );
			}

		} else {
			foreach ( $plugins as &$plugin ) {

				// UpSolution Core can be installed without active license
				if ( $plugin['slug'] === 'us-core' ) {
					$plugin['package'] = $plugin['source'];
				}
			}
			unset( $plugin );
		}

		// Show ACF or ACF PRO, not both #4152
		$plugin_dependency = array();
		foreach ( $plugins as $i => $plugin ) {
			if ( $depend_on_plugin = us_arr_path( $plugin, 'depend_on_plugin' ) ) {
				$plugin_dependency[ $depend_on_plugin ] = $i;
			}
		}
		foreach ( $plugins as $i => $plugin ) {
			$slug = $plugin['slug'];
			if ( ! isset( $plugin_dependency[ $slug ] ) ) {
				continue;
			}
			if ( empty( $plugin['package'] ) ) {
				unset( $plugins[ $i ] );
			} else {
				unset( $plugins[ $plugin_dependency[ $slug ] ] );
			}
		}

		return $plugins;
	}
}

$addons = us_config( 'addons', array() );

foreach ( $addons as $i => $addon ) {
	if ( empty( $addons[$i]['version'] ) OR empty( $addons[$i]['package'] ) ) {
		unset( $addons[$i] );
	}
}

if ( empty( $addons ) ) {
	return;
}

// Transient hook for automatic updates of bundled plugins
add_action( 'site_transient_update_plugins', 'us_addons_transient_update' );
function us_addons_transient_update( $transient ) {

	// Exit if no response is set
	if ( ! isset( $transient->response ) ) {
		return $transient;
	}

	$installed_plugins = get_plugins();

	$addons = us_config( 'addons', array() );

	foreach ( $addons as $i => $addon ) {
		if ( empty( $addons[ $i ]['version'] ) or empty( $addons[ $i ]['package'] ) ) {
			unset( $addons[ $i ] );
		}
	}

	foreach ( $addons as $addon ) {
		$folder = ( ! empty( $addon['folder'] ) ) ? $addon['folder'] : $addon['slug'];
		$file = $addon['slug'];
		if ( strpos( $addon['slug'], '/' ) !== FALSE ) {
			$folder = substr(
				$addon['slug'],
				0,
				strpos( $addon['slug'], '/' )
			);
			$file = substr(
				$addon['slug'],
				strpos( $addon['slug'], '/' ) + 1
			);
		}
		$plugin_basename = sprintf( '%s/%s.php', $folder, $file );

		if ( ! isset( $installed_plugins[ $plugin_basename ] ) ) {
			continue;
		}

		if ( version_compare( $installed_plugins[ $plugin_basename ]['Version'], $addon['version'], '<' ) ) {
			$transient->response[ $plugin_basename ] = new StdClass();
			$transient->response[ $plugin_basename ]->plugin = $plugin_basename;
			$transient->response[ $plugin_basename ]->url = $addon['changelog_url'];
			$transient->response[ $plugin_basename ]->slug = $addon['slug'];
			$transient->response[ $plugin_basename ]->package = $addon['package'];
			$transient->response[ $plugin_basename ]->new_version = $addon['version'];
			$transient->response[ $plugin_basename ]->id = '0';
		} elseif ( $addon['premium'] ) {
			// Removing message for update, if update isn't uploaded on the portal
			unset( $transient->response[ $plugin_basename ] );
		}
	}

	return $transient;
}

// Seen when user clicks "view details" on the plugin listing page
add_action( 'install_plugins_pre_plugin-information', 'us_addons_update_popup' );
function us_addons_update_popup() {

	if ( ! isset( $_GET['plugin'] ) ) {
		return;
	}

	$plugin_slug = sanitize_file_name( $_GET['plugin'] );

	$addons = us_config( 'addons', array() );

	foreach ( $addons as $i => $addon ) {
		if ( empty( $addons[$i]['version'] ) OR empty( $addons[$i]['package'] ) ) {
			unset( $addons[$i] );
		}
	}

	foreach ( $addons as $addon ) {
		if ( $addon['slug'] == $plugin_slug ) {
			$changelog_url = $addon['changelog_url'];

			echo '<html><body style="height: 90%; background: #fcfcfc"><p>See the <a href="' . $changelog_url . '" ' . 'target="_blank">' . $changelog_url . '</a> for the detailed changelog</p></body></html>';

			exit;
		}
	}
}

add_action( 'admin_head', 'us_remove_bsf_update_counter' );
function us_remove_bsf_update_counter() {
	remove_action( 'admin_head', 'bsf_update_counter', 999 );
}
