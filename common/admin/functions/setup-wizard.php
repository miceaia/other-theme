<?php defined( 'ABSPATH' ) OR die( 'This script cannot be accessed directly.' );

/**
 * Setup Wizard admin page
 */

if ( ! function_exists( 'us_add_setup_wizard_page' ) ) {
	add_action( 'admin_menu', 'us_add_setup_wizard_page', 30 );
	function us_add_setup_wizard_page() {
		if ( ! defined( 'US_CORE_VERSION' ) ) {
			$parent_slug = 'us-home';
		} else {
			$parent_slug = 'us-theme-options';
		}
		add_submenu_page(
			$parent_slug,
			__( 'Setup Wizard', 'us' ),
			__( 'Setup Wizard', 'us' ),
			'manage_options',
			'us-setup-wizard',
			'us_setup_wizard_page'
		);
	}
}

if ( ! function_exists( 'us_setup_wizard_in_admin_header' ) ) {
	/**
	 * Hide notices on the Setup Wizard Page
	 *
	 */
	add_action( 'in_admin_header', 'us_setup_wizard_in_admin_header' );
	function us_setup_wizard_in_admin_header() {
		global $pagenow;
		if (
			$pagenow == 'admin.php'
			AND isset( $_GET['page'] )
			AND $_GET['page'] == 'us-setup-wizard'
		) {
			remove_all_actions( 'admin_notices' );
		}
	}
}

if ( ! function_exists( 'us_setup_wizard_page' ) ) {
	function us_setup_wizard_page() {

		// Check if the theme is activated
		us_check_and_activate_theme();

		// Output the success screen by URL
		if ( isset( $_GET['success'] ) ) {
			us_setup_wizard_load_template( 'common/admin/templates/sw_success' );

			return;
		}

		if (
			defined( 'US_DEV_SECRET' )
			OR defined( 'US_THEMETEST_CODE' )
			OR get_option( 'us_license_activated', /* default */ 0 )
			OR get_option( 'us_license_dev_activated', /* default */ 0 )
		) {
			$steps = array(
				'setup_type' => array(
					'type' => 'start',
					'menu_label' => __( 'Setup Type', 'us' ),
					'template' => 'sw_setup_type',
				),
				'prebuilt_site' => array(
					'type' => 'prebuilt',
					'menu_label' => us_translate( 'Sites' ),
					'template' => 'sw_site_prebuilt',
				),
				'prebuilt_content' => array(
					'type' => 'prebuilt',
					'menu_label' => us_translate( 'Content' ),
					'template' => 'sw_site_prebuilt',
				),
				'prebuilt_install' => array(
					'type' => 'prebuilt',
					'menu_label' => us_translate_x( 'Installation', 'Plugin installer section title' ),
					'template' => 'sw_site_prebuilt',
				),
				'from_scratch_header' => array(
					'type' => 'from_scratch',
					'menu_label' => _x( 'Header', 'site top area', 'us' ),
					'template' => 'sw_site_from_scratch',
				),
				'from_scratch_footer' => array(
					'type' => 'from_scratch',
					'menu_label' => __( 'Footer', 'us' ),
					'template' => 'sw_site_from_scratch',
				),
				'from_scratch_colors' => array(
					'type' => 'from_scratch',
					'menu_label' => us_translate( 'Colors' ),
					'template' => 'sw_site_from_scratch',
				),
				'from_scratch_fonts' => array(
					'type' => 'from_scratch',
					'menu_label' => __( 'Fonts', 'us' ),
					'template' => 'sw_site_from_scratch',
				),
				'from_scratch_plugins' => array(
					'type' => 'from_scratch',
					'menu_label' => us_translate( 'Plugins' ),
					'template' => 'sw_site_from_scratch',
				),
				'from_scratch_install' => array(
					'type' => 'from_scratch',
					'menu_label' => us_translate_x( 'Installation', 'Plugin installer section title' ),
					'template' => 'sw_site_from_scratch',
				),
			);

		} else {
			$steps = array(
				'activate_theme' => array(
					'type' => 'start',
					'menu_label' => us_translate( 'Activate' ),
					'title' => sprintf( __( 'Welcome to %s', 'us' ), '<strong>' . US_THEMENAME . ' ' . US_THEMEVERSION . '</strong>' ),
					'template' => 'license_activation_form',
				),
			);
		}

		// Get plugins to install for the Prebuilt
		$plugins_to_install = array();
		foreach ( us_config( 'addons', array() ) as $plugin ) {
			if ( in_array( $plugin['slug'], array( 'us-core', 'acf', 'woocommerce' ) ) ) {
				$plugin_folder = ( ! empty( $plugin['folder'] ) ) ? $plugin['folder'] : $plugin['slug'];
				if ( strpos( $plugin['slug'], '/' ) !== FALSE ) {
					$plugin_folder = substr(
						$plugin['slug'],
						0,
						strpos( $plugin['slug'], '/' )
					);
				}
				$plugin_to_activate = trailingslashit( $plugin_folder ) . $plugin['slug'] . '.php';
				if ( ! is_plugin_active( $plugin_to_activate ) ) {
					$plugins_to_install[ $plugin['slug'] ] = us_translate( 'Plugin' ) . ': ' . $plugin['name'];
				}
			}
		}

		$data_to_json = array(
			'ajax' => array(
				'url' => admin_url( 'admin-ajax.php' ),
				'nonce' => wp_create_nonce( 'us-setup-wizard-actions' ),
			),
			'plugins' => $plugins_to_install,
			'steps' => $steps,
			'translations' => array(
				'home' => us_translate( 'Homepage' ),
				'theme_options' => us_translate( 'Theme Options' ),
			),
		);

		$loaded_templates = array();
		?>
		<div class="us-wizard step-<?= array_key_first( $steps ) ?>">
			<div class="us-wizard-nav">
				<div class="us-wizard-menu">
					<?php foreach ( $steps as $step_id => $step ) {
						if ( isset( $step['menu_label'] ) ) { ?>
							<button type="button" class="us-wizard-menu-item type-<?php echo $step['type']; ?> <?php echo ( $step['type'] === 'start' ? 'active' : 'hidden' ); ?>" data-step-id="<?php echo $step_id; ?>">
								<span><?php echo $step['menu_label'] ?></span>
							</button>
							<?php
						}
					} ?>
				</div>
				<button type="button" class="button button-primary action-next-step">
					<span><?= __( 'Next Step', 'us' ) ?></span>
				</button>
				<button type="button" class="button button-primary action-select-content">
					<span><?= __( 'Next Step', 'us' ) ?></span>
				</button>
				<button type="button" class="button button-primary action-install-website">
					<span><?= __( 'Start Installation', 'us' ) ?></span>
					<div class="g-preloader type_1"></div>
				</button>
			</div>
			<div class="us-wizard-body">
				<?php foreach ( $steps as $step ) {
					if ( ! empty( $step['template'] ) AND ! in_array( $step['template'], $loaded_templates ) ) {
						$loaded_templates[] = $step['template'];
						us_setup_wizard_load_template( 'common/admin/templates/' . $step['template'] );
					}
				} ?>
			</div>
			<div class="us-wizard-json" onclick="return <?php echo htmlspecialchars( json_encode( $data_to_json ), ENT_QUOTES, 'UTF-8' ); ?>"></div>
		</div>
	<?php }
}

/* Actions for install content from the scratch
------------------------------------------------------------------------------------*/
if ( ! function_exists( 'us_from_scratch_install_home' ) ) {
	/**
	 * Install selected content
	 *
	 */
	add_action( 'wp_ajax_us_from_scratch_install_home', 'us_from_scratch_install_home' );
	function us_from_scratch_install_home() {
		if ( ! check_ajax_referer( 'us-setup-wizard-actions', 'security', FALSE ) ) {
			wp_send_json_error(
				array(
					'message' => us_translate( 'An error has occurred. Please reload the page and try again.' ),
				)
			);
		}

		// Create Home Page
		$home_page_sections = us_config( 'sw-preview-content' );
		$home_page_content = '';

		if ( ! empty( $home_page_sections ) ) {
			foreach ( $home_page_sections as $home_page_section ) {
				$home_page_content .= $home_page_section;
			}
		}

		$home_page_id = wp_insert_post(
			array(
				'post_type' => 'page',
				'post_date' => date( 'Y-m-d H:i', time() - 86400 ),
				'post_status' => 'publish',
				'post_title' => us_translate( 'Home' ),
				'post_content' => $home_page_content,
			)
		);

		if ( $home_page_id < 1 ) {
			wp_send_json_error(
				array(
					'message' => us_translate( 'An error has occurred. Please reload the page and try again.' ),
				)
			);
		}

		// Set Home Page on the Settings > Reading > Your homepage displays
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $home_page_id );

		// Create basic menu
		$menu_name = 'main-menu';
		if ( ! wp_get_nav_menu_object( $menu_name ) ) {
			$menu_id = wp_create_nav_menu( $menu_name );
			$menu_items = array(
				'home' => us_translate( 'Home' ),
				'about' => us_translate_x( 'About', 'Block pattern category' ),
				'blog' => us_translate_x( 'Blog', 'Theme starter content' ),
				'contact' => us_translate_x( 'Contact', 'Block pattern category' ),
			);
			foreach ( $menu_items as $menu_key => $menu_item ) {
				$menu_item_data = array(
					'menu-item-title' => $menu_item,
					'menu-item-url' => '#',
					'menu-item-status' => 'publish',
				);
				if ( $menu_key === 'home' ) {
					$menu_item_data = array(
						'menu-item-object-id' => $home_page_id,
						'menu-item-object' => 'page',
						'menu-item-type' => 'post_type',
						'menu-item-status' => 'publish',
					);
				}

				wp_update_nav_menu_item( $menu_id, 0, $menu_item_data );
			}
		}

		// Create Header
		$header_post_id = '';
		if (
			isset( $_POST['header_id'] )
			AND $header_id = $_POST['header_id']
			AND $header_templates = us_config( 'header-templates', array() )
			AND isset( $header_templates[ $header_id ] )
		) {
			$header_content = $header_templates[ $header_id ];
			foreach ( $header_content['default']['layout'] as $layout ) {
				foreach ( $layout as $pos => $item ) {
					$name = explode( ':', $item );

					// Set created menu
					if ( isset( $name[0] ) and $name[0] == 'menu' ) {
						$header_content['data'][ $item ]['source'] = $menu_name;
					}
				}
			}

			$header_content = us_fix_header_template_settings( $header_content );

			$header_post_id = wp_insert_post(
				array(
					'post_type' => 'us_header',
					'post_date' => date( 'Y-m-d H:i', time() - 86400 ),
					'post_status' => 'publish',
					'post_title' => _x( 'Header', 'site top area', 'us' ),
					'post_content' => wp_slash( json_encode( $header_content, JSON_UNESCAPED_UNICODE ) ),
				)
			);
		}

		// Create Reusable Block for Footer
		$footer_post_id = '';
		if (
			isset( $_POST['footer_id'] )
			AND $footer_id = $_POST['footer_id']
			AND $footer_templates = us_config( 'footer-templates', array() )
			AND isset( $footer_templates[ $footer_id ] )
		) {
			$footer_content = $footer_templates[ $footer_id ]['content'];

			// Set created menu, if its exists in the shortcode
			$footer_content = preg_replace( '/source="(.*?)"/', 'source="' . $menu_name . '"', $footer_content );

			$footer_post_id = wp_insert_post(
				array(
					'post_type' => 'us_page_block',
					'post_date' => date( 'Y-m-d H:i', time() - 86400 ),
					'post_status' => 'publish',
					'post_title' => __( 'Footer', 'us' ),
					'post_content' => $footer_content,
				)
			);
		}

		wp_send_json_success(
			array(
				'header_post_id' => $header_post_id,
				'footer_post_id' => $footer_post_id,
			)
		);
	}
}

if ( ! function_exists( 'us_from_scratch_install_theme_options' ) ) {
	/**
	 * Install selected Theme Options
	 */
	add_action( 'wp_ajax_us_from_scratch_install_theme_options', 'us_from_scratch_install_theme_options' );
	function us_from_scratch_install_theme_options() {
		if ( ! check_ajax_referer( 'us-setup-wizard-actions', 'security', FALSE ) ) {
			wp_send_json_error(
				array(
					'message' => us_translate( 'An error has occurred. Please reload the page and try again.' ),
				)
			);
		}

		/*
		 * Getting default Theme Options options values
		 */
		// First preload default options to make dependencies work ...
		global $usof_options;
		$usof_options = usof_defaults();
		us_config( 'theme-options', array(), TRUE );

		// ... then get default values
		$updated_options = usof_defaults();


		// Header
		if ( isset( $_POST['header_post_id'] ) AND $header_post_id = (int) $_POST['header_post_id'] ) {
			$updated_options['header_id'] = $header_post_id;
		}

		// Footer
		if ( isset( $_POST['footer_post_id'] ) AND $footer_post_id = (int) $_POST['footer_post_id'] ) {
			$updated_options['footer_id'] = $footer_post_id;
		}

		// Fonts
		$typography_config = us_config( 'typography-templates' );
		if (
			isset( $_POST['font_id'] )
			AND isset( $typography_config[ $_POST['font_id'] ] )
		) {
			$updated_options = us_array_merge( $updated_options, $typography_config[ $_POST['font_id'] ] );
		}

		// Colors
		$colors_config = us_config( 'color-schemes' );
		if (
			isset( $_POST['scheme_id'] )
			AND isset( $colors_config[ $_POST['scheme_id'] ] )
		) {
			$updated_options = us_array_merge( $updated_options, $colors_config[ $_POST['scheme_id'] ]['values'] );
		}

		usof_save_options( $updated_options );

		wp_send_json_success();
	}
}

/* Actions for install content from the prebuilt
------------------------------------------------------------------------------------*/
if ( ! function_exists( 'us_ajax_install_plugin' ) ) {
	add_action( 'wp_ajax_us_ajax_install_plugin', 'us_ajax_install_plugin' );
	function us_ajax_install_plugin() {
		set_time_limit( 300 );

		if ( ! check_ajax_referer( 'us-setup-wizard-actions', 'security', FALSE ) ) {
			wp_send_json_error(
				array(
					'message' => us_translate( 'An error has occurred. Please reload the page and try again.' ),
				)
			);
		}

		if ( ! isset( $_POST['plugin'] ) OR ! $_POST['plugin'] ) {
			wp_send_json_error( array( 'message' => us_translate( 'An error has occurred. Please reload the page and try again.' ) ) );
		}

		us_install_plugin( $_POST['plugin'] );
	}
}

if ( ! function_exists( 'us_get_selected_demo_name' ) ) {
	/**
	 * Returns name of selected demo site
	 *
	 * @return string
	 */
	function us_get_selected_demo_name() {
		$config = us_get_demo_import_config();
		$available_demos = array_keys( $config );
		$demo_name = $available_demos[0] ?? '';
		if ( in_array( $_POST['demo'], $available_demos ) ) {
			$demo_name = $_POST['demo'];
		}
		return $demo_name;
	}
}

if ( ! function_exists( 'us_upload_import_file' ) ) {
	/**
	 * Upload demo data to server
	 *
	 * @param string $filename
	 * @param string $extension
	 * @return mixed
	 */
	function us_upload_import_file( $filename = '', $extension = 'xml' ) {
		if (
			! defined( 'US_DEV_SECRET' )
			AND ! defined( 'US_THEMETEST_CODE' )
			AND ! get_option( 'us_license_activated' )
			AND ! get_option( 'us_license_dev_activated' )
		) {
			$message_error = new WP_Error( 'us-demo-import-file', 'The theme license is not activated.' );

			return $message_error;
		}

		$upload_dir = wp_upload_dir();
		$file_path = $upload_dir['basedir'] . '/' . $filename . '.' . $extension;

		// Determination if can't write to dir or file
		if ( ! is_writable( $upload_dir['basedir'] ) ) {
			$message_error = new WP_Error( 'us-demo-import-file', 'Failed to save files: the upload directory is not writable.' );

			return $message_error;
		}

		/**
		 * @var array HTTP GET variables
		 */
		$get_variables = array(
			'demo' => us_get_selected_demo_name(),
			'domain' => wp_parse_url( site_url(), PHP_URL_HOST ),
			'file' => urlencode( $filename ),
			'secret' => (string) get_option( 'us_license_secret' ),
		);

		// Determination if server doesn't get file from server
		if (
			! $us_api_response = us_api( '/us.api/download_demo/:us_themename', $get_variables )
			OR (
				strlen( $us_api_response['body'] ) < 300
				AND json_decode( $us_api_response['body'] ) === NULL
			)
		) {
			$message_error = new WP_Error( 'us-demo-import-file', 'Failed to download files from the UpSolution server.' );

			return $message_error;
		}

		// Get the data from the server and write it into the relevant file
		if ( $fp = fopen( $file_path, 'w' ) AND fwrite( $fp, $us_api_response['body'] ) ) {
			return $file_path;

		} else {
			$message_error = new WP_Error( 'us-demo-import-file', 'Failed to create files on a disk.' );

			return $message_error;
		}

	}
}

if ( ! function_exists( 'us_import_content' ) ) {
	/**
	 * @param string $file_path The file path
	 */
	function us_import_content( $file_path ) {
		global $wp_import;

		us_set_time_limit();

		if ( ! defined( 'WP_LOAD_IMPORTERS' ) ) {
			define( 'WP_LOAD_IMPORTERS', TRUE );
		}

		if ( ! class_exists( 'WP_Import' ) ) {
			require_once( US_CORE_DIR . 'vendor/wordpress-importer/wordpress-importer.php' );
		}

		$wp_import = new WP_Import();
		$wp_import->fetch_attachments = TRUE;

		ob_start();
		$wp_import->import( $file_path );
		ob_end_clean();

		// Replace images in _wpb_shortcodes_custom_css meta with placeholder
		global $wpdb;
		$placeholder = $wpdb->get_col( "SELECT guid FROM $wpdb->posts WHERE guid like '%us-placeholder-landscape%';" );
		if ( is_array( $placeholder ) AND isset( $placeholder[0] ) ) {
			$placeholder = $placeholder[0];
		}

		if ( ! empty( $placeholder ) ) {
			$wpdb_results = $wpdb->get_results( "SELECT p.ID, pm.meta_value, pm.meta_key FROM {$wpdb->postmeta} pm LEFT JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE (pm.meta_key = '_wpb_shortcodes_custom_css' OR pm.meta_key = 'us_og_image') AND p.post_status = 'publish'" );
			foreach ( $wpdb_results as $meta_result ) {
				if ( $meta_result->ID ) {
					if ( $meta_result->meta_key == 'us_og_image' ) {
						$new_meta_value = preg_replace( '/(https?:\/\/[^ ,;]+\.(?:png|jpg))/i', $placeholder, $meta_result->meta_value );
						if ( $new_meta_value !== $meta_result->meta_value ) {
							update_post_meta( $meta_result->ID, 'us_og_image', $new_meta_value );
						}
					} else {
						$new_meta_value = preg_replace( '/(https?:\/\/[^ ,;]+\.(?:png|jpg))/i', $placeholder, $meta_result->meta_value );
						if ( $new_meta_value !== $meta_result->meta_value ) {
							update_post_meta( $meta_result->ID, '_wpb_shortcodes_custom_css', $new_meta_value );
						}
					}

				}
			}
		}

		// Remove meta duplicates for _wpb_shortcodes_custom_css
		$delete_meta_dublicates_sql = "DELETE FROM {$wpdb->postmeta} WHERE meta_key IN ('_wpb_shortcodes_custom_css', 'us_og_image', 'us_grid_layout_ids') AND meta_id NOT IN (
					SELECT *
					FROM (
						SELECT MAX(meta_id)
						FROM {$wpdb->postmeta}
						WHERE meta_key IN ('_wpb_shortcodes_custom_css', 'us_og_image', 'us_grid_layout_ids')
						GROUP BY post_id, meta_key
					) AS x
				)";

		$wpdb->query( $delete_meta_dublicates_sql );

		// Delete the saved styles for regeneration
		if ( get_option( 'us_theme_options_css' ) ) {
			delete_option( 'us_theme_options_css' );
		}

		unlink( $file_path );
	}
}

if ( ! function_exists( 'us_action_for_import' ) ) {
	/**
	 * Global action for import demo
	 * @param string $filename
	 * @return string
	 */
	function us_action_for_import( $filename, $callback = NULL ) {
		if ( ! check_ajax_referer( 'us-setup-wizard-actions', 'security', FALSE ) ) {
			wp_send_json_error(
				array(
					'message' => us_translate( 'An error has occurred. Please reload the page and try again.' ),
				)
			);
		}

		$file_path = us_upload_import_file( $filename );

		if ( ! is_wp_error( $file_path ) ) {
			us_import_content( $file_path );
			if ( is_callable( $callback ) ) {
				call_user_func( $callback );
			}
			wp_send_json_success();

		} else {
			wp_send_json_error(
				array(
					'message' => $file_path->get_error_messages(),
				)
			);
		}
	}
}

// Import All Content
if ( ! function_exists( 'wp_ajax_us_import_content_all' ) ) {
	add_action( 'wp_ajax_us_import_content_all', 'wp_ajax_us_import_content_all' );
	function wp_ajax_us_import_content_all() {

		if ( ! check_ajax_referer( 'us-setup-wizard-actions', 'security', FALSE ) ) {
			wp_send_json_error(
				array(
					'message' => us_translate( 'An error has occurred. Please reload the page and try again.' ),
				)
			);
		}

		$config = us_get_demo_import_config();
		$demo_name = us_get_selected_demo_name();
		$demo_selected = isset( $_POST['demo'] ) ? $_POST['demo'] : '';

		$file_path = us_upload_import_file( 'all_content' );

		if ( ! is_wp_error( $file_path ) ) {

			// Actions BEFORE saving posts to database
			add_filter( 'wp_import_post_data_raw', 'us_demo_import_all_wp_import_post_data_raw' );
			function us_demo_import_all_wp_import_post_data_raw( $post ) {

				// Filter content of every post
				if ( ! in_array( $post['post_type'], array( 'nav_menu_item', 'attachment' ) ) AND ! empty( $post['post_content'] ) ) {
					$post['post_content'] = us_replace_post_list_term_slugs_with_ids( $post['post_content'] );
				}

				// Collect meta data of menu items 
				global $us_demo_import_mega_menu_data;
				if ( $post['post_type'] == 'nav_menu_item' AND isset( $post['postmeta'] ) AND is_array( $post['postmeta'] ) ) {
					foreach ( $post['postmeta'] as $postmeta ) {
						if ( is_array( $postmeta ) AND isset( $postmeta['key'] ) AND $postmeta['key'] == 'us_mega_menu_settings' AND ! empty( $postmeta['value'] ) ) {
							if ( ! isset( $us_demo_import_mega_menu_data ) OR ! is_array( $us_demo_import_mega_menu_data ) ) {
								$us_demo_import_mega_menu_data = array();
							}

							$us_demo_import_mega_menu_data[ (int) $post['post_id'] ] = $postmeta['value'];
						}
					}

				}

				return $post;
			}

			// Actions AFTER saving posts to database
			add_action( 'import_end', 'us_demo_import_all_import_end' );
			function us_demo_import_all_import_end() {
				global $wp_import, $us_demo_import_mega_menu_data;

				if ( is_array( $us_demo_import_mega_menu_data ) ) {
					foreach ( $us_demo_import_mega_menu_data as $menu_import_id => $mega_menu_data ) {
						if ( ! empty( $wp_import->processed_menu_items[ $menu_import_id ] ) ) {
							update_post_meta( (int) $wp_import->processed_menu_items[ $menu_import_id ], 'us_mega_menu_settings', maybe_unserialize( $mega_menu_data ) );
						}
					}
				}
			}

			// Register testimonials, if its has in the contents
			if (
				! us_get_option( 'enable_testimonials' )
				AND isset( $config[ $demo_selected ] )
				AND in_array( 'testimonials', $config[ $demo_selected ]['content'] )
				AND function_exists( 'us_create_testimonials_post_type' )
			) {
				us_create_testimonials_post_type();
			}

			// Register portfolio, if its has in the contents
			if (
				! us_get_option( 'enable_portfolio' )
				AND isset( $config[ $demo_selected ] )
				AND in_array( 'portfolio_items', $config[ $demo_selected ]['content'] )
				AND function_exists( 'us_create_portfolio_post_type' )
			) {
				us_create_portfolio_post_type();
			}

			/**
			 * Get page ID by title
			 *
			 * @param $page_title
			 * @return string|null
			 */
			global $wpdb;
			$func_get_page_id_by_slug = function ( $page_slug ) use ( $wpdb ) {
				return $wpdb->get_var( "SELECT ID FROM $wpdb->posts WHERE post_name = '" . $page_slug . "' AND post_type = 'page' AND post_status = 'publish'" );
			};

			// Delete initial WooCommerce pages to free their page slugs
			if ( $shop_page_id = $func_get_page_id_by_slug( 'shop' ) ) {
				wp_delete_post( $shop_page_id, TRUE );
			}
			if ( $cart_page_id = $func_get_page_id_by_slug( 'cart' ) ) {
				wp_delete_post( $cart_page_id, TRUE );
			}
			if ( $checkout_page_id = $func_get_page_id_by_slug( 'checkout' ) ) {
				wp_delete_post( $checkout_page_id, TRUE );
			}
			if ( $my_account_page_id = $func_get_page_id_by_slug( 'my-account' ) ) {
				wp_delete_post( $my_account_page_id, TRUE );
			}

			// Delete initial WordPress pages
			if ( $privacy_page_id = $func_get_page_id_by_slug( 'privacy-policy' ) ) {
				wp_delete_post( $privacy_page_id, TRUE );
			}
			if ( $sample_page_id = $func_get_page_id_by_slug( 'sample-page' ) ) {
				wp_delete_post( $sample_page_id, TRUE );
			}

			us_import_content( $file_path );

			// Set menu
			if ( isset( $config[ $demo_name ]['nav_menu_locations'] ) ) {
				$locations = get_theme_mod( 'nav_menu_locations' );
				$menus = array();
				foreach ( wp_get_nav_menus() as $menu ) {
					if ( is_object( $menu ) ) {
						$menus[ $menu->name ] = $menu->term_id;
					}
				}
				foreach ( $config[ $demo_name ]['nav_menu_locations'] as $nav_location_key => $menu_name ) {
					if ( isset( $menus[ $menu_name ] ) ) {
						$locations[ $nav_location_key ] = $menus[ $menu_name ];
					}
				}

				set_theme_mod( 'nav_menu_locations', $locations );
			}

			// Set Front Page
			if ( isset( $config[ $demo_name ]['front_page'] ) ) {
				$front_page = get_posts(
					array(
						'name' => $config[ $demo_name ]['front_page'],
						'post_type' => 'page',
						'post_status' => 'publish',
						'posts_per_page' => 1,
					)
				);

				if ( $front_page ) {
					$front_page = $front_page[0];
				}
				if ( isset( $front_page->ID ) ) {
					update_option( 'show_on_front', 'page' );
					update_option( 'page_on_front', $front_page->ID );
				}
			}

			// Trash the "Hello World" post
			wp_trash_post( 1 );

			if ( function_exists( 'wc_delete_product_transients' ) ) {
				wc_delete_product_transients();
			}

			// Set the permalink structure
			global $wp_rewrite;
			$wp_rewrite->set_permalink_structure( '/%postname%/' );
			update_option( 'us_flush_rules', TRUE, /* autoload */ 'yes' );
			wp_send_json_success();

		} else {
			wp_send_json_error(
				array(
					'message' => $file_path->get_error_messages(),
				)
			);
		}
	}
}

// Pages
if ( ! function_exists( 'us_import_content_pages' ) ) {
	add_action( 'wp_ajax_us_import_content_pages', 'us_import_content_pages' );
	function us_import_content_pages() {
		us_action_for_import( 'pages' );
	}
}

// Posts
if ( ! function_exists( 'us_import_content_posts' ) ) {
	add_action( 'wp_ajax_us_import_content_posts', 'us_import_content_posts' );
	function us_import_content_posts() {
		us_action_for_import( 'posts',  function() {
			wp_trash_post( 1 ); // Trashing Hello World Post
		} );
	}
}

// Portfolio
if ( ! function_exists( 'us_import_content_portfolio' ) ) {
	add_action( 'wp_ajax_us_import_content_portfolio', 'us_import_content_portfolio' );
	function us_import_content_portfolio() {
		if (
			! us_get_option( 'enable_portfolio' )
			AND function_exists( 'us_update_option' )
			AND function_exists( 'us_create_portfolio_post_type' )
		) {
			us_update_option( 'enable_portfolio', 1 );
			us_create_portfolio_post_type();
		}
		us_action_for_import( 'portfolio_items' );
	}
}

// Testimonials
if ( ! function_exists( 'us_import_content_testimonials' ) ) {
	add_action( 'wp_ajax_us_import_content_testimonials', 'us_import_content_testimonials' );
	function us_import_content_testimonials() {
		if (
			! us_get_option( 'enable_testimonials' )
			AND function_exists( 'us_update_option' )
			AND function_exists( 'us_create_testimonials_post_type' )
		) {
			us_update_option( 'enable_testimonials', 1 );
			us_create_testimonials_post_type();
		}
		us_action_for_import( 'testimonials' );
	}
}

// Headers
if ( ! function_exists( 'us_import_content_headers' ) ) {
	add_action( 'wp_ajax_us_import_content_headers', 'us_import_content_headers' );
	function us_import_content_headers() {
		us_action_for_import( 'headers' );
	}
}

// Grid Layouts
if ( ! function_exists( 'us_import_content_grid_layouts' ) ) {
	add_action( 'wp_ajax_us_import_content_grid_layouts', 'us_import_content_grid_layouts' );
	function us_import_content_grid_layouts() {
		us_action_for_import( 'grid_layouts' );
	}
}

// Reusable Blocks
if ( ! function_exists( 'us_import_content_page_blocks' ) ) {
	add_action( 'wp_ajax_us_import_content_page_blocks', 'us_import_content_page_blocks' );
	function us_import_content_page_blocks() {
		us_action_for_import( 'page_blocks' );
	}
}

// Page Templates
if ( ! function_exists( 'us_import_content_content_templates' ) ) {
	add_action( 'wp_ajax_us_import_content_content_templates', 'us_import_content_content_templates' );
	function us_import_content_content_templates() {
		us_action_for_import( 'content_templates' );
	}
}

// ACF fields
if ( ! function_exists( 'us_import_content_acf' ) ) {
	add_action( 'wp_ajax_us_import_content_acf', 'us_import_content_acf' );
	function us_import_content_acf() {
		us_action_for_import( 'acf_fields' );
	}
}

// WooCommerce Import
if ( ! function_exists( 'us_import_content_woocommerce' ) ) {
	add_action( 'wp_ajax_us_import_content_woocommerce', 'us_import_content_woocommerce' );
	function us_import_content_woocommerce() {
		if ( ! check_ajax_referer( 'us-setup-wizard-actions', 'security', FALSE ) ) {
			wp_send_json_error(
				array(
					'message' => us_translate( 'An error has occurred. Please reload the page and try again.' ),
				)
			);
		}

		us_set_time_limit();

		if ( ! defined( 'WP_LOAD_IMPORTERS' ) ) {
			define( 'WP_LOAD_IMPORTERS', TRUE );
		}

		$file_path = us_upload_import_file( 'products' );

		if ( ! is_wp_error( $file_path ) ) {
			if ( ! class_exists( 'WP_Import' ) ) {
				require_once( US_CORE_DIR . 'vendor/wordpress-importer/wordpress-importer.php' );
			}

			$wp_import = new WP_Import();
			$wp_import->fetch_attachments = TRUE;

			// Creating attributes taxonomies
			global $wpdb;
			$parser = new WXR_Parser();
			$import_data = $parser->parse( $file_path );

			if ( isset( $import_data['posts'] ) ) {

				$posts = $import_data['posts'];

				// TODO: This code needs to be simplified
				if ( $posts and sizeof( $posts ) > 0 ) {
					foreach ( $posts as $post ) {
						if ( 'product' === $post['post_type'] ) {
							if ( ! empty( $post['terms'] ) ) {
								foreach ( $post['terms'] as $term ) {
									if ( strstr( $term['domain'], 'pa_' ) ) {
										if ( ! taxonomy_exists( $term['domain'] ) ) {
											$attribute_name = wc_sanitize_taxonomy_name( str_replace( 'pa_', '', $term['domain'] ) );

											// Create the taxonomy
											if ( ! in_array( $attribute_name, wc_get_attribute_taxonomies() ) ) {
												$attribute = array(
													'attribute_label' => $attribute_name,
													'attribute_name' => $attribute_name,
													'attribute_type' => 'select',
													'attribute_orderby' => 'menu_order',
													'attribute_public' => 1,
												);
												$wpdb->insert( $wpdb->prefix . 'woocommerce_attribute_taxonomies', $attribute );
												delete_transient( 'wc_attribute_taxonomies' );
											}

											// Register the taxonomy now so that the import works!
											register_taxonomy(
												$term['domain'], apply_filters( 'woocommerce_taxonomy_objects_' . $term['domain'], array( 'product' ) ), apply_filters(
													'woocommerce_taxonomy_args_' . $term['domain'], array(
														'hierarchical' => TRUE,
														'show_ui' => FALSE,
														'query_var' => TRUE,
														'rewrite' => FALSE,
													)
												)
											);
										}
									}
								}
							}
						}
					}
				}
			}

			ob_start();
			$wp_import->import( $file_path );
			ob_end_clean();

			unlink( $file_path );

			if ( function_exists( 'wc_delete_product_transients' ) ) {
				wc_delete_product_transients();
			}
			wp_send_json_success();

		} else {
			wp_send_json_error(
				array(
					'message' => $file_path->get_error_messages(),
				)
			);
		}
	}
}

// WooCommerce sales support, as the main import does not support this, we will check on the filter.
if ( ! function_exists( 'us_wp_import_post_meta' ) ) {
	add_filter( 'wp_import_post_meta', 'us_wp_import_post_meta', 10, 3 );
	function us_wp_import_post_meta( $postmeta, $post_id, $post ) {
		if ( empty( $postmeta ) or empty( $post ) or ! is_array( $postmeta ) or ! is_array( $post ) ) {
			return false;
		}
		global $wpdb;
		if ( in_array( $post['post_type'], array( 'product', 'product_variation' ) ) ) {
			$postmeta_keys = array_flip( wp_list_pluck( $postmeta, 'key' ) );
			$postmeta_value = ( ! empty( $postmeta_keys['_sale_price'] ) ) ? us_arr_path( $postmeta, $postmeta_keys['_sale_price'] . '.value' ) : NULL;
			if ( ! empty( $postmeta_value ) ) {
				$sql = "
					SELECT
						`onsale`
					FROM {$wpdb->wc_product_meta_lookup}
					WHERE
						`product_id` = %s
						AND `onsale` = 1
					LIMIT 1;
				";
				if ( $wpdb->get_row( $wpdb->prepare( $sql, $post_id ) ) === NULL ) {
					$wpdb->insert(
						$wpdb->wc_product_meta_lookup, array(
							'product_id' => $post_id,
							'onsale' => 1,
							'max_price' => sprintf( '%0.2f', $postmeta_value ),
							'min_price' => sprintf( '%0.2f', $postmeta_value ),
							'stock_status' => 'instock',
						)
					);
				}
			}
		}

		return $postmeta;
	}
}

// Site settings
if ( ! function_exists( 'us_import_site_settings' ) ) {
	add_action( 'wp_ajax_us_import_site_settings', 'us_import_site_settings' );
	function us_import_site_settings() {
		if ( ! check_ajax_referer( 'us-setup-wizard-actions', 'security', FALSE ) ) {
			wp_send_json_error(
				array(
					'message' => us_translate( 'An error has occurred. Please reload the page and try again.' ),
				)
			);
		}

		us_set_time_limit();

		global $wpdb;
		$file_path = us_upload_import_file( 'options', 'json' );
		if ( ! is_wp_error( $file_path ) ) {
			$import_options = (array) json_decode( file_get_contents( $file_path ), TRUE );
			$allowed_options = array(
				'posts_per_page',
				'us_widget_areas',
				'sidebars_widgets',
			);
			if ( $sidebars_widgets = (array) us_arr_path( $import_options, 'sidebars_widgets' ) ) {
				foreach( $sidebars_widgets as $sidebar ) {
					if ( is_array( $sidebar ) ) {
						foreach ( $sidebar as $widget_id ) {
							$allowed_options[] = sprintf( 'widget_%s', wp_parse_widget_id( $widget_id )['id_base'] );
						}
					}
				}
			}
			if ( class_exists( 'woocommerce' ) ) {
				$allowed_options = array_merge( $allowed_options, array(
					'woocommerce_shop_page_id',
					'woocommerce_cart_page_id',
					'woocommerce_checkout_page_id',
					'woocommerce_myaccount_page_id',
					'woocommerce_terms_page_id',
				) );
			}
			$allowed_options = array_unique( $allowed_options );
			foreach ( $import_options  as $option_name => $option_value ) {
				if ( in_array( $option_name, $allowed_options ) ) {

					// For settings with page ID use the page titles instead, because page IDs may change during import
					if ( substr( $option_name, -strlen( '_page_id' ) ) == '_page_id' ) {
						$option_value = $wpdb->get_var( $wpdb->prepare(
							"SELECT ID FROM $wpdb->posts WHERE post_title = %s AND post_type = 'page' AND post_status = 'publish'", $option_value
						) );
					}
					update_option( $option_name, $option_value );
				}
			}
			unlink( $file_path );
			wp_send_json_success();
		} else {
			wp_send_json_error(
				array(
					'message' => $file_path->get_error_messages(),
				)
			);
		}
	}
}

// Theme Options
if ( ! function_exists( 'us_import_content_theme_options' ) ) {
	add_action( 'wp_ajax_us_import_content_theme_options', 'us_import_content_theme_options' );
	function us_import_content_theme_options() {
		if ( ! check_ajax_referer( 'us-setup-wizard-actions', 'security', FALSE ) ) {
			wp_send_json_error(
				array(
					'message' => us_translate( 'An error has occurred. Please reload the page and try again.' ),
				)
			);
		}

		if ( empty( get_option( 'usof_backup_' . US_THEMENAME, NULL )['usof_options'] ) ) {
			usof_backup();
		}

		$file_path = us_upload_import_file( 'theme_options', 'json' );

		if ( ! is_wp_error( $file_path ) ) {
			$updated_options = json_decode( file_get_contents( $file_path ), TRUE );

			if ( ! is_array( $updated_options ) ) {
				// Wrong file configuration
				wp_send_json(
					array(
						'success' => FALSE,
						'message' => us_translate( 'An error has occurred. Please reload the page and try again.' ),
					)
				);
			}

			// Save custom settings
			foreach ( [ 'custom_css', 'custom_html', 'custom_html_head' ] as $custom_field ) {
				if ( isset( $updated_options[ $custom_field ] ) ) {
					$updated_options[ $custom_field ] = usof_get_option( $custom_field );
				}
			}

			usof_save_options( $updated_options );
			unlink( $file_path );
			wp_send_json_success();
		} else {
			wp_send_json_error(
				array(
					'message' => $file_path->get_error_messages(),
				)
			);
		}
	}
}

if ( ! function_exists( 'us_replace_post_list_term_slugs_with_ids' ) ) {
	/**
	 * Replace Post List tax query terms slugs with IDs
	 */
	function us_replace_post_list_term_slugs_with_ids( $content ) {
		return preg_replace_callback(
			'/\[(us_post_list|us_product_list)([^\]]+?)tax_query="(.+?)"([^\]]*?)\]/',
			function ( $matches ) {

				if ( empty( $matches[3] ) ) {
					return $matches[0];
				}

				$tax_query = json_decode( rawurldecode( $matches[3] ), TRUE );

				if ( is_array( $tax_query ) ) {
					foreach ( $tax_query as &$query ) {
						if ( isset( $query['terms'] ) AND is_string( $query['terms'] ) ) {
							$term_slugs = explode( ',', $query['terms'] );
							$term_ids = array();

							foreach ( $term_slugs as $term_slug ) {
								if ( $term = get_term_by( 'slug', $term_slug, $query['taxonomy'] ) ) {
									$term_ids[] = $term->term_id;
								} else {
									$term_ids[] = '0';
								}
							}

							$query['terms'] = implode( ',', $term_ids );
						}
					}
				}

				$new_tax_query = rawurlencode( json_encode( $tax_query ) );

				return str_replace( $matches[3], $new_tax_query, $matches[0] );
			},
			$content
		);
	}
}
