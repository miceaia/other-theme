/**
 * UpSolution Element: Carousel
 */
! function( $, _undefined ) {
	"use strict";

	/**
	 * @param {Node} container.
	 */
	function usCarousel( container ) {
		const self = this;

		// Elements
		self.$container = $( container );
		self.$carousel = $( '.w-grid-list.owl-carousel', self.$container );

		// https://owlcarousel2.github.io/OwlCarousel2/docs/api-options.html
		self.options = {
			navElement: 'button',
			navText: ['', ''],
			responsiveRefreshRate: 100,
		};

		// Bondable events
		self._events = {
			initializedOwlCarousel: self.initializedOwlCarousel.bind( self ),
			mousedownOwlCore: self.mousedownOwlCore.bind( self ),
		};

		// Load Owl Oprions
		const $elmSettings = $( '.w-grid-json', self.$container );
		if ( $elmSettings.is( '[onclick]' ) ) {
			$.extend( self.options, ( $elmSettings[0].onclick() || {} ).carousel_settings || {} );
		}
		$elmSettings.remove();

		// To prevent scroll blocking on mobiles
		if ( $us.$html.hasClass( 'touch' ) || $us.$html.hasClass( 'ios-touch' ) ) {
			self.options.mouseDrag = false;
		}

		// Override specific options for proper operation in Live Builder
		if ( $us.usbPreview() ) {
			$.extend( self.options, {
				autoplayHoverPause: true,
				mouseDrag: false,
				touchDrag: false,
				loop: false,
			} );
		}

		if ( self.options.autoplayContinual ) {
			$.extend( self.options, {
				slideTransition: 'linear',
				autoplaySpeed: self.options.autoplayTimeout,
				smartSpeed: self.options.autoplayTimeout,
			} );
			if ( ! self.options.autoWidth ) {
				self.options.slideBy = 1;
			}
		}

		// Events
		self.$carousel
			.on( 'initialized.owl.carousel', self._events.initializedOwlCarousel )
			.on( 'mousedown.owl.core', self._events.mousedownOwlCore );

		// Init Owl Carousel
		self.owlCarousel = self.$carousel.owlCarousel( self.options ).data( 'owl.carousel' );

		if ( self.owlCarousel && self.options.autoplayContinual ) {
			self.$carousel.trigger( 'next.owl.carousel' );
		}

		// Set aria labels for navigation
		if (
			self.owlCarousel
			&& self.options.aria_labels.prev
			&& self.options.aria_labels.next
		) {
			$( '.owl-prev', self.$carousel ).attr( 'aria-label', self.options.aria_labels.prev );
			$( '.owl-next', self.$carousel ).attr( 'aria-label', self.options.aria_labels.next );
		}

		const screenSize = String( self.$carousel[0].className ).match( /owl-responsive-(\d+)/ )[1];
		const carouselResponsive = ( self.options.responsive || {} )[ screenSize ];

		// Toggle classes for responsive
		if ( carouselResponsive ) {
			// 'autoheight' class
			if ( carouselResponsive.items === 1 ) {
				self.$carousel.toggleClass( 'autoheight', carouselResponsive.autoHeight );
			}
			// 'with_dots' class
			self.$carousel.toggleClass( 'with_dots', carouselResponsive.dots );
		}

		// Open Post Image in a Popup
		if ( $( '[ref=magnificPopupGrid]', self.$carousel ).length > 0 ) {
			$ush.timeout( self.initMagnificPopup.bind( self ), 1 );
		}

		// Control the carousel navigation from a keyboard
		self.initKeyboardNav( carouselResponsive );
	}

	// Carousel API
	$.extend( usCarousel.prototype, {

		/**
		 * Control the carousel navigation from a keyboard
		 *
		 * @param {Object} carouselResponsive responsive options
		 *
		 */
		initKeyboardNav: function( carouselResponsive ) {
			const self = this;

			const focusableSelectors = [
				'a[href]', 'area[href]',
				'input:not([disabled])',
				'select:not([disabled])',
				'textarea:not([disabled])',
				'button:not([disabled])',
				'iframe', 'object', 'embed',
				'[tabindex]:not([tabindex="-1"])',
				'[contenteditable]', 'video[controls] source'
			].join();

			// Disallow focus on cloned
			$ush.timeout( () => {
				self.$carousel
					.find( '.owl-item.cloned' )
					.find( focusableSelectors )
					.attr( 'tabindex', -1 );
			}, 100 );

			if ( carouselResponsive.autoplay ) {

				// If autoplay is enabled and the focus is not on the active item set the focus on the active item
				var lastFocused = null;

				self.$carousel.off( 'focusin.carouselKeyboardNav' ).on( 'focusin.carouselKeyboardNav', ( e ) => {
					self.$carousel.trigger( 'stop.owl.autoplay' );

					const $allItems = $( '.owl-item:not(.cloned)', self.$carousel );
					const $mainActive = $( '.owl-item.active:not(.cloned)', self.$carousel );
					const $first = $( focusableSelectors, $mainActive ).first();

					if ( ! $first.length ) {
						return;
					}
					if ( ! $allItems.has( e.target ).length ) {
						return;
					}
					if ( $first[0] === e.target || $first[0] === lastFocused ) {
						return;
					}
					if ( ! $mainActive.has( e.target ).length ) {
						$first.focus();
						lastFocused = $first[0];
					}
				} );

				// Enable autoplay on focusout
				self.$carousel.off( 'focusout.carouselKeyboardNav' ).on( 'focusout.carouselKeyboardNav', () => {
					self.$carousel.trigger( 'play.owl.autoplay' );
				} );
			}

			// Slide carousel when tabbing
			if ( carouselResponsive.items === 1 && ! carouselResponsive.loop ) {
				self.$carousel.off( 'keyup.carouselKeyboardNav' ).on( 'keyup.carouselKeyboardNav', ( e ) => {
					if ( e.keyCode !== $ush.TAB_KEYCODE ) {
						return;
					}
					const $owlItem = $( e.target ).closest( '.owl-item' );
					if ( ! $owlItem.length ) {
						return;
					}
					if ( e.shiftKey ) {
						self.$carousel.trigger( 'to.owl.carousel', [ $owlItem.index() ] );
					} else {
						self.$carousel.trigger( 'to.owl.carousel', [ $owlItem.index(), 0 ] );
					}
				} );
			}

			self.$carousel.off( 'keydown.carouselKeyboardNav' ).on( 'keydown.carouselKeyboardNav', ( e ) => {
				if ( e.keyCode !== $ush.TAB_KEYCODE || carouselResponsive.items === 1 ) {
					return;
				}

				if ( self.options.slideBy === 'page' ) {
					const $activeItems = $( '.owl-item.active:not(.cloned)', self.$carousel );
					const $focusables = $( focusableSelectors, $activeItems ).filter( ':visible' );

					const index = $focusables.index( e.target );
					if ( index < 0 ) {
						return;
					}

					if ( ! e.shiftKey && index === $focusables.length - 1 ) {
						self.$carousel.trigger( 'stop.owl.autoplay' );
						self.$carousel.trigger( 'next.owl.carousel', [0] );
					}

					if ( e.shiftKey && index === 0 ) {
						self.$carousel.trigger( 'stop.owl.autoplay' );
						self.$carousel.trigger( 'prev.owl.carousel', [0] );
					}

				} else {
					const $owlItem = $( e.target ).closest( '.owl-item' );
					if ( ! $owlItem.length ) {
						return;
					}

					const $focusables = $( focusableSelectors, $owlItem ).filter( ':visible' );
					const index = $focusables.index( e.target );

					if ( e.shiftKey && index === 0 ) {
						self.$carousel.trigger( 'prev.owl.carousel', carouselResponsive.items === 1 ? [0] : null );
					}
					if ( ! e.shiftKey && index === $focusables.length - 1 ) {
						self.$carousel.trigger( 'next.owl.carousel', carouselResponsive.items === 1 ? [0] : null );
					}
				}
			} );

			// Slide carousel with arrow keys when focused
			self.$carousel.on( 'keydown.carouselArrowsNav', focusableSelectors, ( e ) => {
				switch ( e.keyCode ) {
					case 37: // ArrowLeft
						e.preventDefault();
						self.$carousel.trigger( 'prev.owl.carousel' );
						break;
					case 39: // ArrowRight
						e.preventDefault();
						self.$carousel.trigger( 'next.owl.carousel' );
						break;
				}
			} );
		},

		/**
		 * Open Post Image in a Popup
		 */
		initMagnificPopup: function() {
			const self = this;
			const globalOpts = $us.langOptions.magnificPopup || {};

			self.$carousel.magnificPopup( {
				type: 'image',
				delegate: '.owl-item:not(.cloned) a[ref=magnificPopupGrid]',
				gallery: {
					enabled: true,
					navigateByImgClick: true,
					preload: [0, 1],
					tPrev: globalOpts.tPrev, // Alt text on left arrow
					tNext: globalOpts.tNext, // Alt text on right arrow
					tCounter: globalOpts.tCounter // Markup for "1 of 7" counter
				},
				image: {
					titleSrc: 'aria-label'
				},
				removalDelay: 300,
				mainClass: 'mfp-fade',
				fixedContentPos: true,
				callbacks: {
					beforeOpen: function() {
						if ( self.owlCarousel && self.owlCarousel.settings.autoplay ) {
							self.$carousel.trigger( 'stop.owl.autoplay' );
						}
					},
					beforeClose: function() {
						if ( self.owlCarousel && self.owlCarousel.settings.autoplay ) {
							self.$carousel.trigger( 'play.owl.autoplay' );
						}
					}
				}
			} );

			self.$carousel.on( 'initialized.owl.carousel', ( e ) => {
				const items = {};
				const $list = $( e.currentTarget );
				$( '.owl-item:not(.cloned)', $list ).each( ( _, owlItem ) => {
					const $owlItem = $( owlItem );
					const id = $( '[data-id]', $owlItem ).data( 'id' );
					if ( ! items[ id ] ) {
						items[ id ] = $owlItem;
					}
				} );
				$list.on( 'click', '.owl-item.cloned', ( e ) => {
					e.preventDefault();
					e.stopPropagation();
					const id = $( '[data-id]', e.currentTarget ).data( 'id' );
					if ( items[ id ] ) {
						$( 'a[ref=magnificPopupGrid]', items[ id ] ).trigger( 'click' );
					}
				} );
			} );
		},

		/**
		 * Re-init for "Show More" link after carousel init to set correct height.
		 *
		 * @param {Event} e
		 */
		initializedOwlCarousel: function( e ) {
			const self = this;
			const $toggleLinks = $( '[data-content-height]', e.currentTarget );;

			// Refresh for toggle links
			$toggleLinks.each( ( _, node ) => {
				const $node = $( node );
				var usCollapsibleContent = $node.data( 'usCollapsibleContent' );
				// Init for nodes that are cloned
				if ( $ush.isUndefined( usCollapsibleContent ) ) {
					usCollapsibleContent = $node.usCollapsibleContent().data( 'usCollapsibleContent' );
				}
				usCollapsibleContent.setHeight();
				$ush.timeout( () => {
					self.$carousel.trigger( 'refresh.owl.carousel' );
				}, 1 );
			} );
			// Refresh for active tabs
			if ( $.isMobile && self.$carousel.closest( '.w-tabs-section.active' ).length > 0 ) {
				$ush.timeout( () => {
					self.$carousel.trigger( 'refresh.owl.carousel' );
				}, 50 );
			}
			// Updates the carousel height when expanding or collapsing text
			if ( self.options.autoHeight ) {
				$toggleLinks.on( 'showContent', () => {
					self.$carousel.trigger( 'refresh.owl.carousel' );
				} );
			}
		},

		/**
		 * Due to the carousel’s behavior, we handle movement completion manually,
		 * but sometimes errors occur when clicking on third-party elements.
		 *
		 * @param {Event} e
		 */
		mousedownOwlCore: function( e ) {
			const self = this;
			if ( ! String( e.target.className ).includes( 'collapsible-content-' ) ) {
				return;
			}
			if ( self.owlCarousel.settings.mouseDrag ) {
				self.owlCarousel.$stage.trigger( 'mouseup.owl.core' );
			}
			if ( self.owlCarousel.settings.touchDrag ) {
				self.owlCarousel.$stage.trigger( 'touchcancel.owl.core' );
			}
		}
	} );

	$.fn.usCarousel = function() {
		return this.each( function() {
			$( this ).data( 'usCarousel', new usCarousel( this ) );
		} );
	};

	$( () => $( '.w-grid.type_carousel' ).usCarousel() );

} ( jQuery );
