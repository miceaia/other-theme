/**
 * UpSolution Element: Page Scroller.
 */
;( function( $, _undefined ) {
	"use strict";

	const _window = window;
	const _document = document;

	/**
	 * Function call after 0.5s
	 *
	 * @type debounced
	 */
	const __debounce_fn_500ms = $ush.debounce( $ush.fn, /* wait */500 );

	$us.PageScroller = function( container, options ) {
		this.init( container, options );
	};

	$us.PageScroller.prototype = {
		init: function( container, options ) {
			var defaults = {
				coolDown: 100,
				/**
				 * @param {Number} Duration of scroll animation.
				 */
				animationDuration: 1000,
				/**
				 * @param {String} Easing for scroll animation.
				 */
				animationEasing: $us.getAnimationName( 'easeInOutExpo' ),

				/**
				 * @param {String} End easing for scroll animation.
				 */
				endAnimationEasing: $us.getAnimationName( 'easeOutExpo' ),
			};

			this.options = $.extend( {}, defaults, options );

			this.$container = $( container );
			this.activeSection = 0;
			this.sections = [];

			this.initialSections = [];
			this.hiddenSections = [];
			this.currHidden = [];
			this.dots = [];
			this.scrolls = [];
			this.usingDots = false;
			this.footerReveal = $us.$body.hasClass( 'footer_reveal' );
			this.isTouch = ( ( 'ontouchstart' in _window ) || ( navigator.msMaxTouchPoints > 0 ) || ( navigator.maxTouchPoints ) );
			this.disableWidth = ( this.$container.data( 'disablewidth' ) !== _undefined ) ? this.$container.data( 'disablewidth' ) : 768;
			this.hiddenClasses = {
				// Ultimate Addons classes and width limits.
				'uvc_hidden-xs': [0, 479],
				'uvc_hidden-xsl': [480, 767],
				'uvc_hidden-sm': [768, 991],
				'uvc_hidden-md': [992, 1199],
				'uvc_hidden-ml': [1200, 1823],
				'uvc_hidden-lg': [1824, 99999], // 99999 max screen resolution.

				// WPBakery classes
				'vc_hidden-xs': [0, 767],
				'vc_hidden-sm': [768, 991],
				'vc_hidden-md': [992, 1199],
				'vc_hidden-lg': [1200, 99999], // 99999 max screen resolution.

			};

			if ( this.$container.data( 'speed' ) !== _undefined ) {
				this.options.animationDuration = this.$container.data( 'speed' );
			}

			// Bondable events.
			this._events = {
				destroy: this._destroy.bind( this ),
				mouseWheelHandler: this._mouseWheelHandler.bind( this ),
				resize: this.resize.bind( this ),
				scroll: this.scroll.bind( this )
			};

			this._attachEvents();

			// Destroying all dependencies when deleting an element in the usbuilder
			this.$container
				.on( 'usb.removeHtml', this._events.destroy )

			$us.$canvas
				.on( 'contentChange', $ush.debounce( this._events.resize, 5 ) );

			/**
			 * @type debounced
			 */
			var _resize = $ush.debounce( this._events.resize, 50 );

			// Pass stop param from Page Scroller not to execute this handler
			$us.$window
				.on( 'scroll.noPreventDefault', $ush.debounce( this._events.scroll, 5 ) )
				.on( 'resize', ( _, stopExecute ) => {
					if ( ! stopExecute ) {
						_resize();
					}
				} );

			// Late init not to load things twice
			$ush.timeout( this._init.bind( this ), 100 );
		},

		is_popup: function() {
			// Detect popup not to trigger extra events.
			return $us.$html.hasClass( 'us_popup_is_opened' );
		},

		/**
		 * Add dynamic breakpoints using Theme options
		 */
		_add_dynamic_breakpoints: function() {
			var custom_breakpoints = $us.responsiveBreakpoints,
				default_breakpoints = {
					'hide_on_mobiles': [0, 767],
					'hide_on_tablets': [768, 991],
					'hide_on_laptops': [992, 1199],
					'hide_on_default': [1200, 99999],
				};

			if ( custom_breakpoints ) {
				default_breakpoints = {
					'hide_on_mobiles': [0, custom_breakpoints.mobiles],
					'hide_on_tablets': [( custom_breakpoints.mobiles + 1 ), custom_breakpoints.tablets],
					'hide_on_laptops': [( custom_breakpoints.tablets + 1 ), custom_breakpoints.laptops],
					'hide_on_default': [( custom_breakpoints.laptops + 1 ), 9999]
				};
			}
			this.hiddenClasses = Object.assign( this.hiddenClasses, default_breakpoints );
		},

		_init: function() {
			// Add header, only when it's not sticky and not transparent, because it occupies part of the screen in
			// that case.
			if ( $us.header.isStatic() && $us.header.isHorizontal() && ! $us.header.isTransparent() ) {
				$us.canvas.$header.each( function() {
					var $section = $us.canvas.$header,
						section = {
							$section: $section,
							area: 'header',
						};
					this._countPosition( section );
					this.sections.push( section );
					this.initialSections.push( section );
				}.bind( this ) );
			}

			// Add dynamic breakpoints from Theme options
			this._add_dynamic_breakpoints();

			// Adding canvas sections.
			$( '.l-main > .l-section, .l-footer > .l-section', $us.$canvas ).each( function( key, elm ) {
				var $section = $( elm ),
					section = {
						$section: $section,
						hiddenBoundaries: [],
						area: 'content',
						isSticky: $section.hasClass( 'type_sticky' )
					},
					addedWidths = [];

				// Handle hidden sections.
				hidden:
					for ( var i in this.hiddenClasses ) {
						if ( this.hiddenClasses.hasOwnProperty( i ) ) {
							var low = this.hiddenClasses[ i ][ 0 ],
								high = this.hiddenClasses[ i ][ 1 ];
							if ( $section.hasClass( i ) ) {
								var addedWidthLength = addedWidths.length,
									j;

								// Save added sections to exclude doubles.
								addedWidths.push( [low, high] );

								// Exclude repeating widths.
								for ( j = 0; j < addedWidthLength; j ++ ) {
									if ( addedWidths[ j ][ 0 ] === low && addedWidths[ j ][ 1 ] === high ) {
										break hidden;
									}
								}
								section.hiddenBoundaries.push( [low, high] );
								// Avoid doubles
								if ( this.hiddenSections.indexOf( key ) === - 1 ) {
									this.hiddenSections.push( key );
								}

							}
						}
					}

				this._countPosition( section, key );
				this.sections.push( section );
				this.initialSections.push( section );
			}.bind( this ) );

			// Save last content section for reveal footer sections.
			this.lastContentSectionIndex = this.sections.length - 1;

			// Adding footer sections
			$( '.l-footer > .l-section' ).each( function( key, elm ) {
				var $section = $( elm ),
					section = {
						$section: $section,
						area: 'footer',
						isSticky: $section.hasClass( 'type_sticky' )
					};
				this._countPosition( section, key );
				this.sections.push( section );
				this.initialSections.push( section );
			}.bind( this ) );

			// Resize after load
			$ush.timeout( this.resize.bind( this ), 100 );

			// Adding dots for canvas sections.
			this.$dotsContainer = this.$container.find( '.w-scroller-dots' );
			if ( this.$dotsContainer.length ) {
				this.usingDots = true;

				this.$firstDot = this.$dotsContainer.find( '.w-scroller-dot' ).first();
				this.redrawDots( true );
				// Initialize scroll to determine the position of dots.
				this.scroll();
			}

		},

		/**
		 * Destroying all dependencies
		 *
		 * @event handler
		 */
		_destroy: function() {
			var self = this;
			$us.$document.off( 'mousewheel DOMMouseScroll MozMousePixelScroll' );
			_document.removeEventListener( 'mousewheel', self._events.mouseWheelHandler );
			_document.removeEventListener( 'DOMMouseScroll', self._events.mouseWheelHandler );
			_document.removeEventListener( 'MozMousePixelScroll', self._events.mouseWheelHandler );
			$us.$canvas.off( 'touchstart touchmove' );
		},

		isSectionHidden: function( section ) {
			if ( ! this.initialSections[ section ].hiddenBoundaries || ! this.initialSections[ section ].hiddenBoundaries.length ) {
				return false;
			}
			var currWidth = _window.innerWidth,
				isHidden = false;

			for ( var i = 0; i < this.initialSections[ section ].hiddenBoundaries.length; i ++ ) {
				var low = this.initialSections[ section ].hiddenBoundaries[ i ][ 0 ],
					high = this.initialSections[ section ].hiddenBoundaries[ i ][ 1 ];

				if ( currWidth >= low && currWidth <= high ) {
					isHidden = true;
					break;
				}
			}

			return isHidden;
		},

		redrawDots: function( inited ) {
			if ( ! this.usingDots || ! this.$dotsContainer || ! this.$dotsContainer.length ) {
				return false;
			}
			// Clean up dots container.
			this.$dotsContainer.html( '' );

			for ( var i = 0; i < this.sections.length; i ++ ) {
				// Don't add dots for footer sections
				if ( this.sections[ i ].area === 'footer' && ! this.$container.data( 'footer-dots' ) ) {
					continue;
				}
				this.$firstDot.clone().appendTo( this.$dotsContainer );
			}

			this.$dots = this.$dotsContainer.find( '.w-scroller-dot' );
			this.$dots.each( function( key, elm ) {
				var $dot = $( elm );
				this.dots[ key ] = $dot;
				$dot
					.click( function() {
						this.scrollTo( key );
						this.$dots.removeClass( 'active' );
						$dot.addClass( 'active' );
					}.bind( this ) )
					// Control of the number of points.
					.toggleClass( 'hidden', this.sections[ key ].isSticky && $us.$window.width() > $us.canvas.options.columnsStackingWidth );
			}.bind( this ) );
			if ( !! inited && this.dots[ this.activeSection ] ) {
				this.dots[ this.activeSection ].addClass( 'active' );
			}
			this.$dotsContainer.addClass( 'show' );
		},

		recountSections: function() {
			if ( this.currHidden ) {
				// Set sections to initial state to extract hidden.
				for ( var initialSection in this.initialSections ) {
					this.sections[ initialSection ] = this.initialSections[ initialSection ];
				}
			}

			// Loop backward to don't mess with the indexes.
			for ( var i = this.hiddenSections.length - 1; i >= 0; i -- ) {
				var indexOfTheItem = this.currHidden.indexOf( this.hiddenSections[ i ] );

				if ( this.isSectionHidden( this.hiddenSections[ i ] ) ) {
					// Add to currently hidden if it wasn't added before.
					if ( indexOfTheItem === - 1 ) {
						this.currHidden.push( this.hiddenSections[ i ] );
					}
					this.sections.splice( this.hiddenSections[ i ], 1 );
				} else {
					this.currHidden.splice( indexOfTheItem, 1 );
				}
			}

			this.redrawDots( true /* Set active section after resize */ );
		},

		getScrollSpeed: function( number ) {
			var sum = 0,
				lastElements = this.scrolls.slice( Math.max( this.scrolls.length - number, 1 ) );

			for ( var i = 0; i < lastElements.length; i ++ ) {
				sum = sum + lastElements[ i ];
			}

			return Math.ceil( sum / number );
		},

		/**
		 * Wheel scroll handler
		 *
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM.
		 */
		_mouseWheelHandler: function( e ) {
			var self = this;
			if (
				$us.usbPreview() // Skip events for builder in preview mode
				|| self.is_popup() // Cancel processing if a modal window is open on the page
			) {
				return;
			}

			e.preventDefault();
			var currentTime = new Date().getTime(),
				target = self.activeSection,
				direction = e.wheelDelta || - e.detail,
				speedEnd, speedMiddle, isAccelerating;

			if ( self.scrolls.length > 149 ) {
				self.scrolls.shift();
			}
			self.scrolls.push( Math.abs( direction ) );

			if ( ( currentTime - self.previousMouseWheelTime ) > self.options.coolDown ) {
				self.scrolls = [];
			}
			self.previousMouseWheelTime = currentTime;

			speedEnd = self.getScrollSpeed( 10 );
			speedMiddle = self.getScrollSpeed( 70 );
			isAccelerating = speedEnd >= speedMiddle;

			if ( isAccelerating ) {
				if ( direction < 0 ) {
					target ++;
				} else if ( direction > 0 ) {
					target --;
				}
				if ( self.sections[ target ] === _undefined ) {
					return;
				}
				self.scrollTo( target );
				self.lastScroll = currentTime;
			}
		},

		_attachEvents: function() {
			var self = this;
			self._destroy();

			if ( $us.$window.width() > self.disableWidth && $us.mobileNavOpened <= 0 && ( ! $us.$html.hasClass( 'cloverlay_fixed' ) ) ) {
				_document.addEventListener( 'mousewheel', self._events.mouseWheelHandler, { passive: false } );
				_document.addEventListener( 'DOMMouseScroll', self._events.mouseWheelHandler, { passive: false } );
				_document.addEventListener( 'MozMousePixelScroll', self._events.mouseWheelHandler, { passive: false } );

				if ( $.isMobile || self.isTouch ) {
					$us.$canvas.on( 'touchstart.noPreventDefault', ( event ) => {
						var e = event.originalEvent;
						if ( typeof e.pointerType === 'undefined' || e.pointerType !== 'mouse' ) {
							self.touchStartY = e.touches[ 0 ].pageY;
						}
					} );

					$us.$canvas.on( 'touchmove', function( event ) {
						event.preventDefault();
						var currentTime = new Date().getTime(),
							e = event.originalEvent,
							target = self.activeSection;

						self.touchEndY = e.touches[ 0 ].pageY;

						if ( Math.abs( self.touchStartY - self.touchEndY ) > ( $us.$window.height() / 50 ) ) {
							if ( self.touchStartY > self.touchEndY ) {
								target ++;
							} else if ( self.touchEndY > self.touchStartY ) {
								target --;
							}

							if ( self.sections[ target ] === _undefined ) {
								return;
							}
							self.scrollTo( target );
							self.lastScroll = currentTime;
						}
					} );
				}
			}
		},

		_countPosition: function( section, key ) {
			section.top = section.$section.offset().top - $us.canvas.getOffsetTop();
			// Count footer reveal sections separately
			if ( this.footerReveal && section.area === 'footer' && key !== _undefined ) {
				if ( _window.innerWidth > parseInt( $us.canvasOptions.columnsStackingWidth ) - 1 ) {

					if ( this.sections[ key - 1 ] !== _undefined && this.sections[ key - 1 ].area === 'footer' ) {
						// Takes previous footer section coordinates, works after init when resize happens
						section.top = this.sections[ key - 1 ].bottom;
					} else {
						var rowIndex = ( this.sections[ this.lastContentSectionIndex + key ] !== _undefined )
							? this.lastContentSectionIndex + key
							: key - 1;
						section.top = this.sections[ rowIndex ].bottom;
					}
				}
			}
			section.bottom = section.top + section.$section.outerHeight( false );
		},

		_countAllPositions: function() {
			var counter = 0;
			for ( var section in this.sections ) {
				if ( this.sections[ section ].$section.length ) {
					this._countPosition( this.sections[ section ], counter );
				}
				counter ++;
			}
		},

		scrollTo: function( target ) {
			var currentTime = new Date().getTime();
			if ( this.previousScrollTime !== _undefined && ( currentTime - this.previousScrollTime < this.options.animationDuration ) ) {
				return;
			}
			this.previousScrollTime = currentTime;

			// The for dots points from sticky block.
			if ( this.sections[ target ].isSticky && $us.$window.width() > $us.canvas.options.columnsStackingWidth ) {
				if ( target > this.activeSection ) {
					target += 1;
				} else {
					target -= 1;
				}
			}

			if ( this.usingDots ) {
				this.$dots.removeClass( 'active' );
				if ( this.dots[ target ] !== _undefined ) {
					this.dots[ target ].addClass( 'active' );
				}
			}

			// For a header that has sticky and auto-hide enabled, add the height of the header when scrolling to the
			// bottom, this will allow not to recalculate the position of the page section when hide header.
			var top = Math.ceil( this.sections[ target ][ 'top' ] || 0 );

			if ( top === Math.ceil( $us.header.getScrollTop() ) ) {
				return;
			}

			// Animate options
			var animateOptions = {
				duration: this.options.animationDuration,
				easing: this.options.animationEasing,
				start: function() {
					this.isScrolling = true;
				}.bind( this ),
				always: function() {
					this.isScrolling = false;
					this.activeSection = target;
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
					if ( $us.header.stickyEnabled() ) {
						newTop -= $us.header.getCurrentHeight( /* adminBar */true );
					}
					if ( fx.end !== newTop ) {
						$us.$htmlBody
							.stop( true, false )
							.animate( { scrollTop: newTop }, $.extend( animateOptions, {
								easing: this.options.endAnimationEasing
							} ) );
					}
				}.bind( this )
			};
			$us.$htmlBody
				.stop( true, false )
				.animate( { scrollTop: top }, animateOptions );
		},

		resize: function( e ) {
			if ( this.is_popup() ) {
				return false;
			}
			this._attachEvents();
			this.recountSections();
			// Delaying the resize event to prevent glitches.
			$ush.timeout( this._countAllPositions.bind( this ), 150 );
		},

		scroll: function() {
			if ( this.is_popup() ) {
				return false;
			}

			var currentTime = new Date().getTime();
			if ( ( currentTime - this.lastScroll ) < ( this.options.coolDown + this.options.animationDuration ) ) {
				return;
			}

			__debounce_fn_500ms( function() {
				var scrollTop = $ush.parseInt( $us.$window.scrollTop() );
				if ( $us.header.isPinned() ) {
					scrollTop += $us.header.getCurrentHeight( /* adminBar */true );
				}

				for ( var index in this.sections ) {
					var section = this.sections[ index ];
					if (
						scrollTop >= $ush.parseInt( section.top - 1 )
						&& scrollTop < $ush.parseInt( section.bottom - 1 )
						&& section.area === 'content'
						&& this.activeSection !== index
					) {
						this.activeSection = index;
						// Note: Do not add break because everything should be checked!
					}
				}

				if ( this.usingDots ) {
					this.$dots.removeClass( 'active' );
					if ( this.dots[ this.activeSection ] !== _undefined ) {
						this.dots[ this.activeSection ].addClass( 'active' );
					}
				}
			}.bind( this ) );
		}
	};

	$.fn.usPageScroller = function( options ) {
		return this.each( function() {
			$( this ).data( 'usPageScroller', new $us.PageScroller( this, options ) );
		} );
	};

	$( function() {
		// Delay to destination ult-vc-hide-row
		$ush.timeout( function() {
			$( '.w-scroller' ).usPageScroller();
		}, 0 );
	} );
} )( jQuery );
