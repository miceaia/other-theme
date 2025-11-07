/**
 * UpSolution Element: Tabs
 *
 * @requires $us.canvas
 */
! function( $, _undefined ) {
	"use strict";

	$us.WTabs = function( container, options ) {
		const self = this;

		const _defaults = {
			easing: 'cubic-bezier(.78,.13,.15,.86)',
			duration: 300
		};

		self.options = $.extend( {}, _defaults, options );
		self.isRtl = $( '.l-body' ).hasClass( 'rtl' );

		// Elements
		self.$container = $( container );
		self.$tabsList = $( '> .w-tabs-list:first', self.$container );
		self.$tabs = $( '.w-tabs-item', self.$tabsList );
		self.$sectionsWrapper = $( '> .w-tabs-sections:first', self.$container );
		self.$sections = $( '> .w-tabs-section', self.$sectionsWrapper );
		self.$headers = self.$sections.children( '.w-tabs-section-header' );
		self.$contents = self.$sections.children( '.w-tabs-section-content' );
		self.$tabsBar = $();

		// Overriding specific to Web Accessibility, it is not allowed to have several identical id and
		// aria-content, aria-control. http://web-accessibility.carnegiemuseums.org/code/accordions/
		if ( self.$container.hasClass( 'accordion' ) ) {
			self.$tabs = self.$headers;
		}

		// Private "Variables"
		self.accordionAtWidth = self.$container.data( 'accordion-at-width' );
		self.align = self.$tabsList.usMod( 'align' );
		self.count = self.$tabs.length;
		self.hasScrolling = self.$container.hasClass( 'has_scrolling' ) || false;
		self.isAccordionAtWidth = $ush.parseInt( self.accordionAtWidth ) !== 0;
		self.isScrolling = false;
		self.isTogglable = self.$container.usMod( 'type' ) === 'togglable';
		self.minWidth = 0; // container width at which we should switch to accordion layout.
		self.tabHeights = [];
		self.tabLefts = [];
		self.tabTops = [];
		self.tabWidths = [];
		self.width = 0;

		// If there are no tabs, abort further execution.
		if ( self.count === 0 ) {
			return;
		}

		// Basic layout
		if ( self.$container.hasClass( 'accordion' ) ) {
			self.basicLayout = 'accordion';

		} else {
			self.basicLayout = self.$container.usMod( 'layout' ) || 'hor';
		}

		// Current active layout (may be switched to 'accordion').
		self.curLayout = self.basicLayout;

		// Array of active tabs indexes.
		self.active = [];
		self.activeOnInit = [];
		self.definedActive = [];

		// Preparing arrays of jQuery objects for easier manipulating in future.
		self.tabs = $.map( self.$tabs.toArray(), $ );
		self.sections = $.map( self.$sections.toArray(), $ );
		self.headers = $.map( self.$headers.toArray(), $ );
		self.contents = $.map( self.$contents.toArray(), $ );

		// Do nothing it there are no sections.
		if ( ! self.sections.length ) {
			return;
		}

		$.each( self.tabs, ( index ) => {

			if ( self.sections[ index ].hasClass( 'content-empty' ) ) {
				self.tabs[ index ].hide();
				self.sections[ index ].hide();
			}

			if ( self.tabs[ index ].hasClass( 'active' ) ) {
				self.active.push( index );
				self.activeOnInit.push( index );
			}

			if ( self.tabs[ index ].hasClass( 'defined-active' ) ) {
				self.definedActive.push( index );
			}

			self.tabs[ index ]
				.add( self.headers[ index ] )
				.on( 'click mouseover', ( e ) => {

					var $link = self.tabs[ index ];
					if ( ! $link.is( 'a' ) ) {
						$link = $( 'a', $link );
					}

					if ( $link.length ) {
						if ( e.type == 'click' && ! $ush.toString( $link.attr( 'href' ) ) ) {
							e.preventDefault();
						}
					} else {
						e.preventDefault();
					}

					if (
						e.type == 'mouseover'
						&& (
							self.$container.hasClass( 'accordion' )
							|| ! self.$container.hasClass( 'switch_hover' )
						)
					) {
						return;
					}

					// Toggling accordion sections.
					if ( self.curLayout === 'accordion' && self.isTogglable ) {
						self.toggleSection( index ); // cannot toggle the only active item.

						// Setup active tab
					} else {

						if ( index != self.active[0] ) {
							self.headerClicked = true;
							self.openSection( index );

						} else if ( self.curLayout === 'accordion' ) {

							self.contents[ index ]
								.css( 'display', 'block' )
								.slideUp( self.options.duration, self._events.contentChanged );
							self.tabs[ index ]
								.attr( 'aria-expanded', 'true' )
								.removeClass( 'active' );
							self.sections[ index ]
								.removeClass( 'active' );
							self.active[0] = _undefined;
						}
					}
				} );
		} );

		// Bindable events
		self._events = {
			resize: self.resize.bind( self ),
			hashchange: self.hashchange.bind( self ),
			contentChanged: function() {
				$.each( self.tabs, ( _, item ) => {
					var $content = $( item );
					$content.attr( 'aria-expanded', $content.hasClass( 'active' ) );
				} )
				$us.$canvas.trigger( 'contentChange', { elm: self.$container } );
			},
			wheel: function() {
				if ( self.isScrolling ) {
					$us.$htmlBody.stop( true, false ); // stop animation when scrolling wheel
				}
			}
		};

		// Starting everything.
		self.switchLayout( self.curLayout );

		$us.$window
			.on( 'resize', $ush.debounce( self._events.resize, 5 ) )
			.on( 'hashchange', self._events.hashchange )
			.on( 'wheel.noPreventDefault', $ush.debounce( self._events.wheel.bind( self ), 5 ) );

		$us.$document.ready( () => {
			self.resize();
			$ush.timeout( self._events.resize, 50 );
			$ush.timeout( () => {
				// TODO: move to a class function for code reading improvement.
				// Open tab on page load by hash.
				if ( window.location.hash ) {
					var hash = window.location.hash.substr( 1 ),
						$linkedSection = $( `.w-tabs-section[id="${hash}"]`, self.$sectionsWrapper );
					if ( $linkedSection.length && ! $linkedSection.hasClass( 'active' ) ) {
						$( '.w-tabs-section-header', $linkedSection ).trigger( 'click' );
					}
				}
			}, 150 );
		} );

		// Support for external links to tabs.
		$.each( self.tabs, ( index ) => {
			if ( self.headers.length && self.headers[ index ].attr( 'href' ) != _undefined ) {
				var tabHref = self.headers[ index ].attr( 'href' ),
					tabHeader = self.headers[ index ];
				$( `a[href="${tabHref}"]`, self.$container ).on( 'click', function( e ) {
					e.preventDefault();
					if ( $( this ).hasClass( 'w-tabs-section-header', 'w-tabs-item' ) ) {
						return;
					}
					if ( ! $( tabHeader ).parent( '.w-tabs-section' ).hasClass( 'active' ) ) {
						tabHeader.trigger( 'click' );
					}
				} );
			}
		} );

		self.$container.addClass( 'initialized' );

		// Gets the height of the header after animation.
		self.headerHeight = 0;
		$us.header.on( 'transitionEnd', ( header ) => {
			self.headerHeight = header.getCurrentHeight( /* adminBar */true );
		} );

		if ( $us.usbPreview() ) {

			const usbContentChange = () => {
				if ( ! self.isTrendy() || self.curLayout == 'accordion' ) {
					return;
				}
				self.measure();
				self.setBarPosition( self.active[0] || 0 ); // set bar position for certain element index and current layout
			};

			self.$container.on( 'usb.contentChange', $ush.debounce( usbContentChange, 1 ) );
		}
	};

	$us.WTabs.prototype = {

		/**
		 * Determines if trendy style (Material style)
		 *
		 * @return {boolean} True if trendy, False otherwise
		 */
		isTrendy: function() {
			return this.$container.hasClass( 'style_trendy' );
		},

		hashchange: function() {
			if ( window.location.hash ) {
				var hash = window.location.hash.substr( 1 ),
					$linkedSection = $( `.w-tabs-section[id="${hash}"]`, this.$sectionsWrapper );
				if ( $linkedSection.length && ! $linkedSection.hasClass( 'active' ) ) {
					$( '.w-tabs-section-header', $linkedSection ).click();
				}
			}
		},

		switchLayout: function( to ) {
			this.cleanUpLayout( this.curLayout );
			this.prepareLayout( to );
			this.curLayout = to;
		},

		/**
		 * Clean up layout's special inline styles and/or dom elements.
		 *
		 * @param from
		 */
		cleanUpLayout: function( from ) {
			this.$sections.resetInlineCSS( 'display' );

			if ( from === 'accordion' ) {
				this.$container.removeClass( 'accordion' );
				this.$contents.resetInlineCSS( 'height', 'padding-top', 'padding-bottom', 'display', 'opacity' );
			}

			if ( this.isTrendy() && [ 'hor', 'ver' ].includes( from ) ) {
				this.$tabsBar.remove();
			}
		},

		/**
		 * Apply layout's special inline styles and/or dom elements.
		 *
		 * @param to
		 */
		prepareLayout: function( to ) {
			if ( to !== 'accordion' && this.active[0] === _undefined ) {
				this.active[0] = this.activeOnInit[0];
				if ( this.active[ 0 ] !== _undefined ) {
					this.tabs[ this.active[0] ]
						.addClass( 'active' );
					this.sections[ this.active[0] ]
						.addClass( 'active' );
				}
			}

			if ( to === 'accordion' ) {
				this.$container.addClass( 'accordion' );
				this.$contents.hide();
				if ( this.curLayout !== 'accordion' && this.active[0] !== _undefined && this.active[0] !== this.definedActive[0] ) {
					this.headers[ this.active[0] ]
						.removeClass( 'active' );
					this.tabs[ this.active[0] ]
						.removeClass( 'active' );
					this.sections[ this.active[0] ]
						.removeClass( 'active' );
					this.active[0] = this.definedActive[0];

				}
				for ( var i = 0; i < this.active.length; i ++ ) {
					if ( this.contents[ this.active[ i ] ] !== _undefined ) {
						this.tabs[ this.active[ i ] ]
							.attr( 'aria-expanded', 'true' )
							.addClass( 'active' );
						this.sections[ this.active[ i ] ]
							.addClass( 'active' );
						this.contents[ this.active[ i ] ]
							.show();
					}
				}

			} else if ( to === 'ver' ) {
				this.$contents.hide();
				this.contents[ this.active[0] ]
					.show();
			}

			if ( this.isTrendy() && 'hor|ver'.indexOf( this.curLayout ) > - 1 ) {
				this.$tabsBar = $( '<div class="w-tabs-list-bar"></div>' )
					.appendTo( this.$tabsList );
			}
		},

		/**
		 * Measure needed sizes.
		 */
		measure: function() {
			if ( this.basicLayout === 'ver' ) {
				// Get the specified minimum width or determine automatically
				if ( this.isAccordionAtWidth ) {
					this.minWidth = this.accordionAtWidth;
				} else {
					var // Measuring minimum tabs width.
						minTabWidth = this.$tabsList.outerWidth( true ),
						// Static value fo min content width
						minContentWidth = 300,
						// Measuring minimum tabs width for percent-based sizes.
						navWidth = this.$container.usMod( 'navwidth' );

					if ( navWidth !== 'auto' ) {
						minTabWidth = Math.max( minTabWidth, minContentWidth * parseInt( navWidth ) / ( 100 - parseInt( navWidth ) ) );
					}
					this.minWidth = Math.max( 480, minContentWidth + minTabWidth + 1 )
				}

				if ( this.isTrendy() ) {
					this.tabHeights = [];
					this.tabTops = [];
					for ( var index = 0; index < this.tabs.length; index ++ ) {
						this.tabHeights.push( this.tabs[ index ].outerHeight( true ) );
						this.tabTops.push(
							index
								? ( this.tabTops[ index - 1 ] + this.tabHeights[ index - 1 ] )
								: 0
						);
					}
				}

			} else {
				if ( this.basicLayout === 'hor' ) {
					this.$container.addClass( 'measure' );
					// Get the specified minimum width or determine automatically
					if ( this.isAccordionAtWidth ) {
						this.minWidth = this.accordionAtWidth;
					} else {
						this.minWidth = 0;
						for ( var index = 0; index < this.tabs.length; index ++ ) {
							this.minWidth += this.tabs[ index ].outerWidth( true );
						}
					}
					this.$container.removeClass( 'measure' );
				}

				if ( this.isTrendy() ) {
					this.tabWidths = [];
					this.tabLefts = [];
					for ( var index = 0; index < this.tabs.length; index ++ ) {
						this.tabWidths.push( this.tabs[ index ].outerWidth( true ) );
						this.tabLefts.push( index
							? ( this.tabLefts[ index - 1 ] + this.tabWidths[ index - 1 ] )
							: this.tabs[ index ].position().left
						);
					}
					// Offset correction for RTL version with Trendy enabled
					if ( this.isRtl ) {
						var
							// Get the width of the first tab
							firstTabWidth = this.tabWidths[0],
							// Get X offsets
							offset = ( 'none' == this.align )
								? this.$tabsList.outerWidth( true )
								: this.tabWidths // Get the total width of all tambours
									.reduce( ( a, b ) => { return a + b }, /* default */0 );
						// Calculate position based on offset
						this.tabLefts = this.tabLefts
							.map( ( left ) => Math.abs( left - offset + firstTabWidth ) );
					}
				}
			}
		},

		/**
		 * Set bar position for certain element index and current layout
		 *
		 * @param {number} index The index element
		 * @param {boolean} animated Animating an element when updating css
		 */
		setBarPosition: function( index, animated ) {
			if (
				index === _undefined
				|| ! this.isTrendy()
				|| 'hor|ver'.indexOf( this.curLayout ) == - 1
			) {
				return;
			}
			// Add a bar to the document if it does not exist
			if ( ! this.$tabsBar.length ) {
				this.$tabsBar = $( '<div class="w-tabs-list-bar"></div>' )
					.appendTo( this.$tabsList );
			}
			// Get bar position for certain element index and current layout
			var css = {};
			if ( this.curLayout === 'hor' ) {
				css = { width: this.tabWidths[ index ] };
				css[ this.isRtl ? 'right' : 'left' ] = this.tabLefts[ index ];
			} else if ( this.curLayout === 'ver' ) {
				css = {
					top: this.tabTops[ index ],
					height: this.tabHeights[ index ]
				};
			}
			// Set css properties for a bar element
			if ( ! animated ) {
				this.$tabsBar.css( css );
			} else {
				this.$tabsBar
					.performCSSTransition( css, this.options.duration, null, this.options.easing );
			}
		},

		/**
		 * Open tab section.
		 *
		 * @param index int
		 */
		openSection: function( index ) {
			if ( this.sections[ index ] === _undefined ) {
				return;
			}

			if ( this.curLayout === 'hor' ) {
				this.$sections
					.removeClass( 'active' )
					.css( 'display', 'none' );
				this.sections[ index ]
					.stop( true, true )
					.fadeIn( this.options.duration, function() {
						$( this ).addClass( 'active' );
					} );
			} else if ( this.curLayout === 'accordion' ) {
				if ( this.contents[ this.active[0] ] !== _undefined ) {
					this.contents[ this.active[0] ]
						.css( 'display', 'block' )
						.stop( true, false )
						.slideUp( this.options.duration );
				}
				this.contents[ index ]
					.css( 'display', 'none' )
					.stop( true, false )
					.slideDown( this.options.duration, function() {
						this._events.contentChanged.call( this );

						// Scrolling to the opened section
						if ( this.hasScrolling && this.curLayout === 'accordion' && this.headerClicked == true ) {
							var top = this.headers[ index ].offset().top;

							if ( ! jQuery.isMobile ) {
								top -= $us.$canvas.offset().top || 0;
							}
							// If there is a sticky section in front of the current section,
							// then take into account the position this section.
							var $prevStickySection = this.$container
								.closest( '.l-section' )
								.prevAll( '.l-section.type_sticky' );

							if ( $prevStickySection.length ) {
								top -= parseInt( $prevStickySection.outerHeight( true ) );
							}

							// Animate options
							var animateOptions = {
								duration: $us.canvasOptions.scrollDuration,
								easing: $us.getAnimationName( 'easeInOutExpo' ),
								start: function() {
									this.isScrolling = true;
								}.bind( this ),
								always: function() {
									this.isScrolling = false;
								}.bind( this ),
								/**
								 * Get and applying new values during animation.
								 *
								 * @param number now
								 * @param object fx
								 */
								step: function( now, fx ) {
									var newTop = top;
									// Since the header at the moment of scrolling the scroll can change the height,
									// we will correct the position of the element.
									if (
										$us.header.isHorizontal()
										&& $us.header.stickyEnabled()
									) {
										newTop -= this.headerHeight;
									}
									if ( fx.end !== newTop ) {
										$us.$htmlBody
											.stop( true, false )
											.animate( { scrollTop: newTop }, $.extend( animateOptions, {
												easing: $us.getAnimationName( 'easeOutExpo' )
											} ) );
									}
								}.bind( this )
							};
							$us.$htmlBody
								.stop( true, false )
								.animate( { scrollTop: top }, animateOptions );
							this.headerClicked = false;
						}
					}.bind( this ) );
				this.$sections
					.removeClass( 'active' );
				this.sections[ index ]
					.addClass( 'active' );
			} else if ( this.curLayout === 'ver' ) {
				if ( this.contents[ this.active[0] ] !== _undefined ) {
					this.contents[ this.active[0] ]
						.css( 'display', 'none' );
				}
				this.contents[ index ]
					.css( 'display', 'none' )
					.stop( true, true )
					.fadeIn( this.options.duration, this._events.contentChanged );
				this.$sections
					.removeClass( 'active' );
				this.sections[ index ]
					.addClass( 'active' );
			}

			this._events.contentChanged();
			this.$tabs
				.attr( 'aria-expanded', 'false' )
				.removeClass( 'active' );
			this.tabs[ index ]
				.attr( 'aria-expanded', 'true' )
				.addClass( 'active' );
			this.active[ 0 ] = index;

			// Set bar position for certain element index and current layout
			this.setBarPosition( index, /* animated */true );
		},

		/**
		 * Toggle some togglable accordion section.
		 *
		 * @param index
		 */
		toggleSection: function( index ) {
			// (!) Can only be used within accordion state
			var indexPos = $.inArray( index, this.active );
			if ( indexPos != - 1 ) {
				this.contents[ index ]
					.css( 'display', 'block' )
					.slideUp( this.options.duration, this._events.contentChanged );
				this.tabs[ index ]
					.attr( 'aria-expanded', 'true' )
					.removeClass( 'active' );
				this.sections[ index ]
					.removeClass( 'active' );
				this.active.splice( indexPos, 1 );
			} else {
				this.contents[ index ]
					.css( 'display', 'none' )
					.slideDown( this.options.duration, this._events.contentChanged );
				this.tabs[ index ]
					.attr( 'aria-expanded', 'false' )
					.addClass( 'active' );
				this.sections[ index ]
					.addClass( 'active' );
				this.active.push( index );
			}
		},

		/**
		 * Resize-driven logics
		 */
		resize: function() {
			this.width = this.isAccordionAtWidth
				? $us.$window.outerWidth()
				: this.$container.width();

			// Skip changing Tabs into Accordion inside header menu on Mobiles
			if (
				this.curLayout !== 'accordion'
				&& ! this.width
				&& this.$container.closest( '.w-nav' ).length
				&& ! jQuery.isMobile
			) {
				return;
			}

			var nextLayout = ( this.width <= this.minWidth )
				? 'accordion'
				: this.basicLayout;
			if ( nextLayout !== this.curLayout ) {
				this.switchLayout( nextLayout );
			}
			if ( this.curLayout !== 'accordion' ) {
				this.measure();
			}

			this._events.contentChanged();
			// Set bar position for certain element index and current layout
			this.setBarPosition( this.active[ 0 ] );
		}
	};

	$.fn.wTabs = function( options ) {
		return this.each( function() {
			$( this ).data( 'wTabs', new $us.WTabs( this, options ) );
		} );
	};

	$( () => $( '.w-tabs' ).wTabs() );

	// Init in Post\Product List or Grid context
	$us.$document.on( 'usPostList.itemsLoaded usGrid.itemsLoaded', ( _, $items ) => {
		$( '.w-tabs', $items ).wTabs();
	} );

}( jQuery );

/* RevSlider support for our tabs */
jQuery( function( $ ) {
	$( '.w-tabs .rev_slider' ).each( function() {
		var $slider = $( this );
		$slider.bind( "revolution.slide.onloaded", function( e ) {
			$us.$canvas.on( 'contentChange', function() {
				$slider.revredraw();
			} );
		} );
	} );
} );
