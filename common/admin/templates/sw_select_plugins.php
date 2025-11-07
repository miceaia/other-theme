<?php defined( 'ABSPATH' ) or die( 'This script cannot be accessed directly.' );

global $us_template_directory_uri;

$plugins = us_config( 'addons', array() );

// Get premium plugins installation packages from help portal API if not received yet
foreach ( $plugins as $i => $plugin ) {
	if ( isset( $plugins[ $i ]['premium'] ) AND ! isset( $plugins[ $i ]['package'] ) ) {
		$plugins = us_api_addons( $plugins, TRUE );
		break;
	}
}

// Get list of installed and activated plugins
$installed_plugins = get_plugins();
$activated_plugins_option = get_option( 'active_plugins' );
$activated_plugins = array();
foreach ( $activated_plugins_option as $plugin ) {
	if ( isset( $installed_plugins[ $plugin ] ) ) {
		$activated_plugins[ $plugin ] = $installed_plugins[ $plugin ];
	}
}
?>
<div class="us-addons-list">
	<?php

	// Premium Plugins
	foreach ( $plugins as $plugin ) {
		if ( empty( $plugin['premium'] ) ) {
			continue;
		}
		if ( ! empty( $plugin['hide_in_list'] ) ) {
			continue;
		}

		if ( strpos( $plugin['slug'], '/' ) !== FALSE ) {
			$plugin['slug_first_part'] = $plugin['file_path'] = substr(
				$plugin['slug'],
				0,
				strpos( $plugin['slug'], '/' )
			);
		} else {
			$plugin['file_path'] = ( ! empty( $plugin['folder'] ) ) ? $plugin['folder'] : $plugin['slug'];
			$plugin['slug_first_part'] = $plugin['slug'];
		}
		foreach ( array_keys( $installed_plugins ) as $file_path ) {
			if ( preg_match( '|^' . $plugin['file_path'] . '/|', $file_path ) ) {
				$plugin['file_path'] = $file_path;
				break;
			}
		}

		$class = 'us-addon type_premium ' . $plugin['slug_first_part'];

		// Use icon URL, if it's set
		if ( isset( $plugin['icon_url'] ) ) {
			$icon_url = $plugin['icon_url'];
		} else {
			$icon_url = $us_template_directory_uri . '/img/' . $plugin['slug_first_part'] . '.png';
		}

		// Generate status attributes
		$btn_text = '';
		$btn_class = 'button action-button';
		$btn_action = '';
		$active = FALSE;

		if ( isset( $activated_plugins[ $plugin['file_path'] ] ) ) {
			$class .= ' status_active';
			$active = TRUE;

		} elseif ( ! isset( $installed_plugins[ $plugin['file_path'] ] ) ) {
			if (
				empty( $plugin['package'] )
				AND ! (
					get_option( 'us_license_activated' )
					OR get_option( 'us_license_dev_activated' )
					// OR defined( 'US_DEV_SECRET' )
				)
			) {
				$class .= ' status_locked';

			} else {
				$class .= ' status_notinstalled';
				$btn_text = us_translate( 'Install Now' );
				$btn_action = 'install';
			}

		} elseif ( ! isset( $activated_plugins[ $plugin['file_path'] ] ) ) {
			$class .= ' status_notactive';
			$btn_class .= ' button-primary';
			$btn_text = us_translate( 'Activate Plugin' );
			$btn_action = 'activate';
		}
		?>
		<div class="<?php echo esc_attr( $class ); ?>">
			<div class="us-addon-content">
				<img class="us-addon-icon" src="<?php echo esc_url( $icon_url ) ?>" loading="lazy" alt="icon">
				<h2 class="us-addon-title"><?php echo strip_tags( $plugin['name'] ) ?></h2>
				<p class="us-addon-desc"><?php echo strip_tags( $plugin['description'] ) ?></p>
			</div>
			<div class="us-addon-control">
				<div class="us-addon-status"><?php echo us_translate_x( 'Active', 'plugin' ); ?></div>
			</div>
			<?php
			if ( ! $active ) {
				?>
				<label>
					<input type="checkbox" name="premiun_plugins" value="<?php echo esc_attr( $plugin['slug'] ) ?>" data-plugin="<?php echo esc_attr( $plugin['slug'] ) ?>" data-action="<?php echo esc_attr( $btn_action ) ?>" data-title="<?php echo us_translate( 'Plugin' ) . ': ' . strip_tags( $plugin['name'] ); ?>" <?php echo ( esc_attr( $plugin['slug'] ) == 'us-core' ? 'checked="checked" disabled="disabled"' : '' ) ?>>
					<i></i>
				</label>
				<?php
			}
			?>
		</div>
		<?php
	}

	// Free Plugins
	foreach ( $plugins as $plugin ) {
		if ( ! empty( $plugin['premium'] ) ) {
			continue;
		}

		$plugin['file_path'] = $plugin['slug'];
		foreach ( array_keys( $installed_plugins ) as $file_path ) {
			if ( preg_match( '|^' . $plugin['slug'] . '/|', $file_path ) ) {
				$plugin['file_path'] = $file_path;
				break;
			}
		}

		$class = 'us-addon ' . $plugin['slug'];

		// Use icon URL, if it's set
		if ( isset( $plugin['icon_url'] ) ) {
			$icon_url = $plugin['icon_url'];
		} else {
			$icon_ext = isset( $plugin['icon_ext'] ) ? $plugin['icon_ext'] : 'png';
			$icon_url = 'https://ps.w.org/' . $plugin['slug'] . '/assets/icon-128x128.' . $icon_ext;
			$plugin['url'] = 'https://wordpress.org/plugins/' . $plugin['slug'] . '/';
		}

		// Generate status attributes
		$btn_text = '';
		$btn_class = 'button action-button';
		$btn_action = '';
		$active = FALSE;

		if ( isset( $activated_plugins[ $plugin['file_path'] ] ) ) {
			$class .= ' status_active';
			$active = TRUE;

		} elseif ( ! isset( $installed_plugins[ $plugin['file_path'] ] ) ) {
			$class .= ' status_notinstalled';
			$btn_text = us_translate( 'Install Now' );
			$btn_action = 'install';

		} elseif ( ! isset( $activated_plugins[ $plugin['file_path'] ] ) ) {
			$class .= ' status_notactive';
			$btn_class .= ' button-primary';
			$btn_text = us_translate( 'Activate Plugin' );
			$btn_action = 'activate';
		}
		?>
		<div class="<?php echo esc_attr( $class ); ?>">
			<div class="us-addon-content">
				<img class="us-addon-icon" src="<?php echo esc_url( $icon_url ) ?>" loading="lazy" alt="icon">
				<h2 class="us-addon-title"><?php echo strip_tags( $plugin['name'] ) ?></h2>
				<p class="us-addon-desc"><?php echo strip_tags( $plugin['description'] ) ?></p>
			</div>
			<div class="us-addon-control">
				<div class="us-addon-status"><?php echo us_translate_x( 'Active', 'plugin' ); ?></div>
			</div>
			<?php
			if ( ! $active ) {
				?>
				<label>
					<input type="checkbox" name="free_plugins" value="<?php echo esc_attr( $plugin['slug'] ) ?>"  data-plugin="<?php echo esc_attr( $plugin['slug'] ) ?>" data-action="<?php echo esc_attr( $btn_action ) ?>" data-title="<?php echo us_translate( 'Plugin' ) . ': ' . strip_tags( $plugin['name'] ); ?>">
					<i></i>
				</label>
				<?php
			}
			?>
		</div>
		<?php
	}
	?>
</div>
