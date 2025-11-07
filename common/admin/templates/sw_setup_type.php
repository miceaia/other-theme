<?php defined( 'ABSPATH' ) or die( 'This script cannot be accessed directly.' );

global $us_template_directory_uri;

?>
<div class="us-wizard-step setup_type active">
	<div class="us-wizard-step-title"><?= __( 'Select Setup Type', 'us' ) ?></div>
	<div class="us-wizard-setup-type">
		<div class="us-wizard-setup-type-item" for="prebuilt">
			<img src="<?= $us_template_directory_uri ?>/common/admin/img/sw-pre-built.jpg" width="500" height="305" alt="">
			<div class="us-wizard-setup-type-item-wrapper">
				<div class="us-wizard-setup-type-item-title"><?= __( 'Pre-built website', 'us' ) ?></div>
				<span><?= __( 'Start with a ready-made website base.', 'us' ) ?></span>
				<button type="button" class="button button-primary">
					<span><?= us_translate( 'Select' ) ?></span>
				</button>
			</div>
		</div>
		<div class="us-wizard-setup-type-item" for="from_scratch">
			<img src="<?= $us_template_directory_uri ?>/common/admin/img/sw-from-scratch.jpg" alt="">
			<div class="us-wizard-setup-type-item-wrapper">
				<div class="us-wizard-setup-type-item-title"><?= __( 'Site from scratch', 'us' ) ?></div>
				<span><?= __( 'Choose Header, Footer, Colors, and Typography.', 'us' ) ?></span>
				<button type="button" class="button button-primary">
					<span><?= us_translate( 'Select' ) ?></span>
				</button>
			</div>
		</div>
	</div>
</div>
