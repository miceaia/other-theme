/**
 * UpSolution Element: Gallery
 */
;( function( $, _undefined ) {
	"use strict";

	function usGallery( container ) {
		const self = this;

		// Private "Variables"
		self.currentPage = 1;
		self.ajaxData = {};
		self.allImageIds = [];

		// Elements
		self.$container = $( container );
		self.$list = $( '.w-gallery-list', container );
		self.$itemsImg = $( '.w-gallery-item-img', container );
		self.$loadmore = $( '.w-gallery-loadmore', container );
		self.$jsonContainer = $( '.w-gallery-json', container );

		// Bondable events
		self._events = {
			showNumberOfHiddenImages: $ush.debounce( self.showNumberOfHiddenImages.bind( self ), 5 ),
			getItems: self.getItems.bind( self ),
			usbReloadIsotopeLayout: self._usbReloadIsotopeLayout.bind( self ),
		};

		if ( self.$jsonContainer.length && ! $us.usbPreview() ) {
			self.ajaxData = self.$jsonContainer[ 0 ].onclick() || {};
			self.allImageIds = self.ajaxData.template_vars.ids || [];
		}

		if ( self.$container.hasClass( 'type_masonry' ) ) {
			self.initMasonry();
		}

		if ( self.$container.hasClass( 'action_popup_image' ) ) {
			self.initMagnificPopup();
		}

		// For Live Builder
		self.$container.on( 'usbReloadIsotopeLayout', self._events.usbReloadIsotopeLayout );

		// Show number of hidden images
		$us.$window.on( 'resize', self._events.showNumberOfHiddenImages );
		self.showNumberOfHiddenImages();

		if ( ! self.allImageIds.length ) {
			return;
		}

		$( 'button', self.$loadmore ).on( 'click', self._events.getItems );

		if ( self.ajaxData.template_vars.pagination == 'load_on_scroll' ) {
			$us.waypoints.add( self.$loadmore, /* offset */'-70%', self._events.getItems );
		}
	}

	usGallery.prototype = {

		initMagnificPopup: function() {
			$( 'a.w-gallery-item-link', this.$container ).magnificPopup( {
				type: 'image',
				gallery: {
					enabled: true,
					navigateByImgClick: true,
					preload: [0, 1],
					tPrev: $us.langOptions.magnificPopup.tPrev, // Alt text on left arrow
					tNext: $us.langOptions.magnificPopup.tNext, // Alt text on right arrow
					tCounter: $us.langOptions.magnificPopup.tCounter // Markup for "1 of 7" counter
				},
				removalDelay: 300,
				mainClass: 'mfp-fade',
				fixedContentPos: true
			} );
		},

		initMasonry: function() {
			const self = this;
			const isotopeOptions = {
				itemSelector: '.w-gallery-item:not(.hidden)',
				layoutMode: 'masonry',
				isOriginLeft: ! $ush.isRtl(),
			};

			if ( self.$list.parents( '.w-tabs-section-content-h' ).length ) {
				isotopeOptions.transitionDuration = 0;
			}

			$( '>*:not(.hidden)', self.$list ).imagesLoaded( () => {
				self.$list.isotope( isotopeOptions );
				self.$list.isotope();
			} );
			$us.$canvas.on( 'contentChange', () => {
				$( '>*:not(.hidden)', self.$list ).imagesLoaded( () => {
					self.$list.isotope();
				} );
			} );
		},

		/**
		 * Show number of hidden images.
		 */
		showNumberOfHiddenImages: function() {
			const self = this;
			const hiddenImagesNumber = self.$itemsImg.filter( ':hidden' ).length;

			self.$itemsImg.removeAttr( 'data-hidden-images-number' );

			if ( hiddenImagesNumber ) {
				self.$itemsImg
					.filter( ':visible:last' )
					.attr( 'data-hidden-images-number', hiddenImagesNumber );
			}
		},

		/**
		 * Reload layout in the Live Builder context.
		 *
		 * @event handler
		 */
		_usbReloadIsotopeLayout: function() {
			const self = this;
			if ( self.$container.hasClass( 'with_isotope' ) ) {
				self.$list.isotope( 'layout' );
			}
		},

		/**
		 * Get and add the items.
		 */
		getItems: function() {
			const self = this;

			if ( self.$loadmore.hasClass( 'hidden' ) ) {
				return;
			}

			self.currentPage += 1;

			// Get next part ids
			self.ajaxData.template_vars.ids = self.allImageIds.slice(
				self.ajaxData.template_vars.quantity * ( self.currentPage - 1 ), /* start */
				self.ajaxData.template_vars.quantity * self.currentPage /* end */
			);

			// Stop ajax actions, if all ids loaded
			if ( ! self.ajaxData.template_vars.ids.length ) {
				self.$loadmore.addClass( 'hidden' );

				return;
			}

			self.$loadmore.addClass( 'loading' );

			$.ajax( {
				type: 'post',
				url: $us.ajaxUrl,
				data: {
					action: self.ajaxData.action,
					template_vars: JSON.stringify( self.ajaxData.template_vars ),
				},
				success: ( html ) => {
					var $result = $( html ),
						$items = $( '.w-gallery-list > *', $result );

					if ( ! $items.length || self.currentPage === self.ajaxData.template_vars.max_num_pages ) {
						self.$loadmore
							.addClass( 'hidden' );
					}

					self.$list.append( $items );

					if ( self.$container.hasClass( 'action_popup_image' ) ) {
						self.initMagnificPopup();
					}

					if ( self.$container.hasClass( 'type_masonry' ) ) {
						var isotope = self.$list.data( 'isotope' );
						if ( isotope ) {
							isotope.insert( $items );
							isotope.reloadItems();
						}
					}

					if ( self.ajaxData.template_vars.pagination == 'load_on_scroll' ) {
						$us.waypoints.add( self.$loadmore, /* offset */'-70%', self._events.getItems );
					}

					self.$loadmore.removeClass( 'loading' );
				},
				error: () => {
					self.$loadmore.removeClass( 'loading' );
				}
			} );
		},
	};

	$.fn.usGallery = function() {
		return this.each( function() {
			$( this ).data( 'usGallery', new usGallery( this ) );
		} );
	};

	$( () => $( '.w-gallery' ).usGallery() );

	// Init in Post\Product List or Grid context
	$us.$document.on( 'usPostList.itemsLoaded usGrid.itemsLoaded', ( _, $items ) => {
		$( '.w-gallery', $items ).usGallery();
	} );

} )( jQuery );
