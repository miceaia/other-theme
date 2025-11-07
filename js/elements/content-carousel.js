/**
 * UpSolution Element: Content Carousel
 */
! function( $, undefined ) {
	"use strict";

	window.$us = window.$us || {};

	/**
	 * @param {String} container The container.
	 * @param {{}} options The options [optional].
	 */
	function usContentCarousel( container ) {
		const self = this;

		// Elements
		const $carouselContainer = $( '.owl-carousel', container );

		// Predefined options suitable for content carousel
		// https://owlcarousel2.github.io/OwlCarousel2/docs/api-options.html
		var carouselOptions = {
			navElement: 'button',
			navText: [ '', '' ],
			responsiveRefreshRate: 100,
		}

		if ( $carouselContainer.is( '[onclick]' ) ) {
			$.extend( carouselOptions, $carouselContainer[0].onclick() || {} );
			if ( ! $us.usbPreview() ) {
				$carouselContainer.removeAttr( 'onclick' );
			}
		}

		// To prevent scroll blocking on mobiles
		if ( $us.$html.hasClass( 'touch' ) || $us.$html.hasClass( 'ios-touch' ) ) {
			$.extend( carouselOptions, {
				mouseDrag: false,
			} );
		}

		// Disable autoWidth for [vc_row_inner] items
		if ( carouselOptions.slideBy == 'page' ) {
			if ( $( '.wpb_row:first', $carouselContainer ).length ) {
				$.each( carouselOptions.responsive, ( _, options ) => {
					$.extend( options, {
						items:1,
						autoWidth: false
					} );
				} );
			}
		}

		// Override specific options for proper operation in Live Builder
		if ( $us.usbPreview() ) {
			$.extend( carouselOptions, {
				autoplayHoverPause: true,
				mouseDrag: false,
				touchDrag: false,
				loop: false,
			} );
			// TODO: Find a more elegant solution to work correctly in Live Builder!
			$carouselContainer.one( 'initialized.owl.carousel', () => {
				// ../plugins/us-core/builder/assets/js/builder-preview.js#L2734
				$( '.owl-item', $carouselContainer ).each( ( _, node ) => {
					var $node = $( node ),
						$element = $( '> *', node ),
						usbid = $element.data( 'usbid' ) || $element.data( 'usbid2' );
					$node.attr( 'data-usbid', usbid );
					$element.data( 'usbid2', usbid ).removeAttr( 'data-usbid' );
				} );
				$ush.timeout( () => {
					$( '.owl-dots *, .owl-prev, .owl-next', $carouselContainer ).addClass( 'usb_skip_elmSelected' );
				}, 1 );
			} );
			$( 'style[data-for]', $carouselContainer ).each( ( _, node ) => {
				$( node ).next().prepend( node );
			} );
		}

		// Re-init for "Show More" link after carousel init to set correct height.
		$carouselContainer.one( 'initialized.owl.carousel', () => {
			$( '[data-content-height]', $carouselContainer ).each( ( _, node ) => {
				var $node = $( node ),
					usCollapsibleContent = $node.data( 'usCollapsibleContent' );
				// Init for nodes that are cloned
				if ( $ush.isUndefined( usCollapsibleContent ) ) {
					usCollapsibleContent = $node.usCollapsibleContent().data( 'usCollapsibleContent' );
				}
				usCollapsibleContent.setHeight();
				$ush.timeout( () => {
					$carouselContainer.trigger( 'refresh.owl.carousel' );
				}, 1 );
			} );
			// Updates the carousel height to expanded and collapsed text
			if ( carouselOptions.autoHeight ) {
				$( '[data-content-height]', $carouselContainer ).on( 'showContent', () => {
					$list.trigger( 'refresh.owl.carousel' );
				} );
			}
		});

		if ( carouselOptions.autoplayContinual ) {
			carouselOptions.slideTransition = 'linear';
			carouselOptions.autoplaySpeed = carouselOptions.autoplayTimeout;
			carouselOptions.smartSpeed = carouselOptions.autoplayTimeout;
			if ( ! carouselOptions.autoWidth ) {
				carouselOptions.slideBy = 1;
			}
		}

		if ( $carouselContainer.data( 'owl.carousel' )) {
			$carouselContainer.trigger( 'destroy.owl.carousel' );
		}

		// Init Owl Carousel
		$carouselContainer.owlCarousel( carouselOptions );

		// Trigger continual autoplay
		if ( $carouselContainer && carouselOptions.autoplayContinual ) {
			$carouselContainer.trigger( 'next.owl.carousel' );
		}

		// Set aria labels for navigation arrows
		if (
			$carouselContainer
			&& carouselOptions.aria_labels.prev
			&& carouselOptions.aria_labels.next
		) {
			$( '.owl-prev', $carouselContainer ).attr( 'aria-label', carouselOptions.aria_labels.prev );
			$( '.owl-next', $carouselContainer ).attr( 'aria-label', carouselOptions.aria_labels.next );
		}

		const currentOwlResponsiveValue = $carouselContainer.attr( 'class' ).match( /owl-responsive-(\d+)/ )[1];
		const carouselOptionsResponsive = carouselOptions.responsive || {};
		const currentOptionsResponsive = carouselOptionsResponsive[ currentOwlResponsiveValue ];

		// Toggle classes for responsive
		if ( currentOptionsResponsive ) {
			// 'autoheight' class
			if ( currentOptionsResponsive.items === 1 ) {
				$carouselContainer.toggleClass( 'autoheight', currentOptionsResponsive.autoHeight );
			}
			// 'with_dots' class
			$carouselContainer.toggleClass( 'with_dots', currentOptionsResponsive.dots );
		}
	}

	$.fn.usContentCarousel = function( options ) {
		return this.each( function() {
			$( this ).data( 'usContentCarousel', new usContentCarousel( this, options ) );
		} );
	};

	$( () => {
		$( '.w-content-carousel' ).usContentCarousel();
	} );

}( jQuery );
