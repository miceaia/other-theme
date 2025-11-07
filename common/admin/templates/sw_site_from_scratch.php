<?php defined( 'ABSPATH' ) or die( 'This script cannot be accessed directly.' );

global $us_template_directory_uri;

$header_templates = us_config( 'header-templates', array() );
$footer_templates = us_config( 'footer-templates', array() );
$color_schemes = us_config( 'color-schemes', array() );
$typography_templates = us_config( 'typography-templates', array() );

?>
<div class="us-wizard-step from_scratch_with_iframe">
	<div class="us-wizard-step-row">
		<div class="us-wizard-preview-wrap">
			<div class="us-wizard-preview">
				<div class="us-wizard-preview-bar"><i></i><?= __( 'Website Preview', 'us' ) ?></div>
				<iframe src="<?= trailingslashit( home_url(), PHP_URL_HOST ) ?>?us_setup_wizard_preview=1" frameborder="0"></iframe>
			</div>
		</div>
		<div class="us-wizard-templates for_header">
			<div class="us-wizard-step-title"><?= _x( 'Select Website Header', 'site top area', 'us' ) ?></div>
			<div class="us-wizard-step-description"><?= sprintf( _x( 'The selected header can be further customized at %s', 'site top area', 'us' ), '<span>' . us_translate( 'Templates' ) . ' > ' . _x( 'Headers', 'site top area', 'us' ) . '</span>' ) ?></div>
			<div class="us-wizard-templates-list">
				<?php foreach ( $header_templates as $name => $header_template ) { ?>
					<div class="us-wizard-templates-item<?= ( array_key_first( $header_templates ) === $name ? ' active' : '' ) ?>" data-type="header_id" data-id="<?= esc_attr( $name ) ?>">
						<img src="<?= $us_template_directory_uri ?>/common/admin/img/header-templates/<?= $name ?>.png" alt="">
					</div>
				<?php } ?>
			</div>
		</div>
		<div class="us-wizard-templates for_footer">
			<div class="us-wizard-step-title"><?= __( 'Select Website Footer', 'us' ) ?></div>
			<div class="us-wizard-step-description"><?= sprintf( __( 'The selected footer can be further customized at %s', 'us' ), '<span>' . us_translate( 'Templates' ) . ' > ' . __( 'Reusable Blocks', 'us' ) . '</span>' ) ?></div>
			<div class="us-wizard-templates-list">
				<?php foreach ( $footer_templates as $name => $footer_template ) { ?>
					<div class="us-wizard-templates-item<?= ( array_key_first( $footer_templates ) === $name ? ' active' : '' ) ?>" data-type="footer_id" data-id="<?= esc_attr( $name ) ?>">
						<img src="<?= $us_template_directory_uri ?>/common/admin/img/footer-templates/<?= $name ?>.jpg" alt="">
					</div>
				<?php } ?>
			</div>
		</div>
		<div class="us-wizard-templates for_colors">
			<div class="us-wizard-step-title"><?= __( 'Select Website Colors', 'us' ) ?></div>
			<div class="us-wizard-step-description"><?= sprintf( __( 'The selected colors can be further customized at %s', 'us' ), '<span>' . US_THEMENAME . ' > ' . __( 'Theme Options', 'us' ) . ' > ' . us_translate( 'Colors' ) . '</span>' ) ?></div>
			<div class="us-wizard-templates-list">
				<?php foreach ( $color_schemes as $key => &$scheme ) { ?>
					<div class="us-wizard-templates-item<?= ( array_key_first( $color_schemes ) === $key ? ' active' : '' ) ?>" data-type="scheme_id" data-id="<?= $key ?>">
						<?= us_color_scheme_preview( $scheme ) ?>
					</div>
				<?php } ?>
			</div>
		</div>
		<div class="us-wizard-templates for_fonts">
			<div class="us-wizard-step-title"><?= __( 'Select Website Fonts', 'us' ) ?></div>
			<div class="us-wizard-step-description"><?= sprintf( __( 'The selected fonts can be further customized at %s', 'us' ), '<span>' . US_THEMENAME . ' > ' . __( 'Theme Options', 'us' ) . ' > ' . __( 'Typography', 'us' ) . '</span>' ) ?></div>
			<div class="us-wizard-templates-list">
				<?php foreach ( $typography_templates as $name => $typography_template ) { ?>
					<div class="us-wizard-templates-item<?= ( array_key_first( $typography_templates ) === $name ? ' active' : '' ) ?>" data-type="font_id" data-id="<?= $name ?>">
						<img src="<?= $us_template_directory_uri ?>/common/admin/img/typography-templates/<?= $name ?>.png" alt="">
					</div>
				<?php } ?>
			</div>
		</div>
	</div>
</div>
<div class="us-wizard-step from_scratch_plugins">
	<div class="us-wizard-step-title"><?= __( 'Select Needed Plugins', 'us' ) ?></div>
	<?php us_setup_wizard_load_template( 'common/admin/templates/sw_select_plugins' ); ?>
</div>
