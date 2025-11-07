<?php defined( 'ABSPATH' ) or die( 'This script cannot be accessed directly.' );

global $help_portal_url;
$theme_url = $help_portal_url . '/' . strtolower( US_THEMENAME );

?>
<div class="us-wizard step-success">
	<div class="us-wizard-body">
		<div class="us-wizard-step active">
			<i class="dashicons dashicons-saved"></i>
			<div class="us-wizard-step-title"><?= __( 'Installation Completed', 'us' ) ?></div>
			<a class="button button-primary" href="<?= home_url() ?>" target="_blank"><?= us_translate( 'Visit Site' ) ?></a>
			<div class="us-wizard-step-links">
				<a href="<?= $theme_url ?>/video-tutorials/" target="_blank"><?= __( 'Video Tutorials', 'us' ) ?></a>
				<a href="<?= $theme_url ?>/" target="_blank"><?= __( 'Online Documentation', 'us' ) ?></a>
				<a href="<?= $theme_url ?>/tickets/" target="_blank"><?= __( 'Support Portal', 'us' ) ?></a>
			</div>
		</div>
	</div>
</div>
