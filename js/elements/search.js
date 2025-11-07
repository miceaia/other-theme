/**
 * Search Form
 */

! function( $ ) {
	"use strict";

	function UsSearch( container ) {
		// Elms
		this.$container = $( container );
		this.$form = this.$container.find( '.w-search-form' );
		this.$btnOpen = this.$container.find( '.w-search-open' );
		this.$btnClose = this.$container.find( '.w-search-close' );
		this.$input = this.$form.find( '[name="s"]' );
		this.$overlay = this.$container.find( '.w-search-background' );
		this.$window = $( window );

		// Params
		this.searchOverlayInitRadius = 25;
		this.isFullScreen = this.$container.hasClass( 'layout_fullscreen' );
		this.isWithRipple = this.$container.hasClass( 'with_ripple' );

		// Events
		this._bindEvents();
	}

	$.extend( UsSearch.prototype, {

		_bindEvents: function() {
			this.$btnOpen.on( 'click.usSearch', ( e ) => {
				this.searchShow( e );
			} );
			this.$btnClose.on( 'touchstart.noPreventDefault click', ( e ) => {
				this.searchHide( e );
			} );

			this.$form.on( 'keydown', ( e ) => {
				if ( e.keyCode === $ush.ESC_KEYCODE && this.$container.hasClass( 'active' ) ) {
					this.searchHide( e );
				}
			} );

			// Open form on Space
			this.$btnOpen.on( 'keydown', ( e ) => {
				if ( e.keyCode === $ush.SPACE_KEYCODE ) {
					e.preventDefault();
					this.searchShow( e );
				}
			} );
		},

		searchHide: function( e ) {
			e.stopPropagation();
			if ( e.type === 'touchstart' ) {
				e.preventDefault();
			}

			// To prevent reopen on close click in fullscreen
			if ( this.isFullScreen ) {
				$ush.timeout( () => {
					this.$btnOpen.one( 'click.usSearch', ( evt ) => {
						this.searchShow( evt );
					} );
				}, 100 );
			}

			this.$btnOpen.removeAttr( 'tabindex' );

			this.$container.removeClass( 'active' );
			this.$input.blur();
			if ( this.isWithRipple && this.isFullScreen ) {
				this.$form.css( {
					transition: 'opacity 0.4s'
				} );
				$ush.timeout( () => {
					this.$overlay
						.removeClass( 'overlay-on' )
						.addClass( 'overlay-out' )
						.css( {
							'transform': 'scale(0.1)'
						} );
					this.$form.css( 'opacity', 0 );
					$ush.debounce( () => {
						this.$form.css( 'display', 'none' );
						this.$overlay.css( 'display', 'none' );
					}, 600 );
				}, 25 );
			}

			// Trigger only for mouse use to prevent outline in Safari
			if ( e.type !== 'touchstart' ) {
				this.$btnOpen.trigger( 'focus' );
			}

			$us.$document.off( 'focusin.usSearch' );
		},

		calculateOverlayScale: function() {
			const searchPos = this.$btnOpen.offset();
			const searchWidth = this.$btnOpen.width();
			const searchHeight = this.$btnOpen.height();
			// Preserving scroll position
			searchPos.top -= this.$window.scrollTop();
			searchPos.left -= this.$window.scrollLeft();
			const overlayX = searchPos.left + searchWidth / 2;
			const overlayY = searchPos.top + searchHeight / 2;
			const winWidth = $us.canvas.winWidth;
			const winHeight = $us.canvas.winHeight;

			const dx = Math.pow( Math.max( winWidth - overlayX, overlayX ), 2 );
			const dy = Math.pow( Math.max( winHeight - overlayY, overlayY ), 2 );
			const overlayRadius = Math.sqrt( dx + dy );

			return [ ( overlayRadius + 15 ) / this.searchOverlayInitRadius, overlayX, overlayY ];
		},

		searchShow: function( e ) {
			e.preventDefault();

			$us.$document.on( 'focusin.usSearch', this.closeFormOnTabOutside.bind( this ) );

			// To prevent reopen on close click in fullscreen
			if ( this.isFullScreen ) {
				this.$btnOpen.off( 'click.usSearch' );
			}

			this.$container.addClass( 'active' );
			this.$btnOpen.attr( 'tabindex', '-1' );

			if ( this.isWithRipple && this.isFullScreen ) {

				const calculateOverlayScale = this.calculateOverlayScale();
				const overlayScale = calculateOverlayScale[0];
				const overlayX = calculateOverlayScale[1];
				const overlayY = calculateOverlayScale[2];

				this.$overlay.css( {
					width: this.searchOverlayInitRadius * 2,
					height: this.searchOverlayInitRadius * 2,
					left: overlayX,
					top: overlayY,
					"margin-left": - this.searchOverlayInitRadius,
					"margin-top": - this.searchOverlayInitRadius
				} );
				this.$overlay
					.removeClass( 'overlay-out' )
					.show();
				this.$form.css( {
					opacity: 0,
					display: 'block',
					transition: 'opacity 0.4s 0.3s'
				} );
				$ush.timeout( () => {
					this.$overlay
						.addClass( 'overlay-on' )
						.css( {
							"transform": "scale(" + overlayScale + ")"
						} );
					this.$form.css( 'opacity', 1 );
				}, 25 );
			}
			$ush.timeout( () => {
				this.$input.trigger( 'focus' );
			}, 25 );
		},

		closeFormOnTabOutside: function( e ) {
			if ( ! $.contains( this.$form[0], $us.$document[0].activeElement ) ) {
				this.searchHide( e );
			}
		},
	} );

	$.fn.wSearch = function() {
		return this.each( function() {
			$( this ).data( 'wSearch', new UsSearch( this ) );
		} );
	};

	$( function() {
		jQuery( '.l-header .w-search' ).wSearch();
	} );
}( jQuery );
