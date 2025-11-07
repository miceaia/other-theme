/**
 * $us.scroll
 *
 * ScrollSpy, Smooth scroll links and hash-based scrolling all-in-one
 * @requires $us.canvas
 */
! function( $ ) {
	"use strict";

	// Private variables that are used only in the context of this function, it is necessary to optimize the code.
	var _window = window,
		_document = document,
		_location = location,
		_undefined = undefined;

	// Check for is set objects
	_window.$ush = _window.$ush || {};
	_window.$us = _window.$us || {};

	function USScroll( options ) {
		var self = this;

		/**
		 * Setting options
		 *
		 * @type {{}}
		 */
		var defaults = {
			/**
			 * @param {String|jQuery} Selector or object of hash scroll anchors that should be attached on init
			 */
			attachOnInit: '\
				.menu-item a[href*="#"],\
				.menu-item[href*="#"],\
				.post_custom_field a[href*="#"],\
				.post_title a[href*="#"],\
				.w-ibanner a[href*="#"],\
				.vc_custom_heading a[href*="#"],\
				.vc_icon_element a[href*="#"],\
				.w-comments-title a[href*="#"],\
				.w-iconbox a[href*="#"],\
				.w-image a[href*="#"]:not([onclick]),\
				.w-text a[href*="#"],\
				.w-toplink,\
				a.smooth-scroll[href*="#"],\
				a.w-btn[href*="#"]:not([onclick]),\
				a.w-grid-item-anchor[href*="#"]',
			/**
			 * @param {String} Classname that will be toggled on relevant buttons
			 */
			buttonActiveClass: 'active',
			/**
			 * @param {String} Classname that will be toggled on relevant menu items
			 */
			menuItemActiveClass: 'current-menu-item',
			/**
			 * @param {String} Classname that will be toggled on relevant menu ancestors
			 */
			menuItemAncestorActiveClass: 'current-menu-ancestor',
			/**
			 * @param {Number} Duration of scroll animation
			 */
			animationDuration: ( $us.canvasOptions || {} ).scrollDuration || 0,
			/**
			 * @param {String} Easing for scroll animation.
			 */
			animationEasing: $us.getAnimationName( 'easeInOutExpo' ),

			/**
			 * @param {String} End easing for scroll animation
			 */
			endAnimationEasing: $us.getAnimationName( 'easeOutExpo' )
		};

		self.options = $.extend( {}, defaults, options || {} );

		// Hash blocks with targets and activity indicators.
		self.blocks = {};

		// Is scrolling to some specific block at the moment?
		self.isScrolling = false;

		// Boundable events
		self._events = {
			cancel: self.cancel.bind( self ),
			scroll: self.scroll.bind( self ),
			resize: self.resize.bind( self )
		};

		$us.$window.on( 'resize load', $ush.debounce( self._events.resize, 1 ) );
		$ush.timeout( self._events.resize, 75 );

		$us.$window.on( 'scroll.noPreventDefault', self._events.scroll );
		$ush.timeout( self._events.scroll, 75 );

		if ( self.options.attachOnInit ) {
			self.attach( self.options.attachOnInit );
		}

		// Recount scroll positions on any content changes.
		$us.$canvas.on( 'contentChange', self._countAllPositions.bind( self ) );

		// Handling initial document hash
		if ( _document.location.hash && _document.location.hash.indexOf( '#!' ) == - 1 ) {
			var hash = _document.location.hash,
				scrollPlace = ( self.blocks[ hash ] !== _undefined )
					? hash
					: _undefined;

			if ( scrollPlace === _undefined ) {
				try {
					var $target = $( hash );
					if ( $target.length != 0 ) {
						scrollPlace = $target;
					}
				}
				catch ( error ) {
					//Do not have to do anything here since scrollPlace is already undefined.
				}

			}
			if ( scrollPlace !== _undefined ) {

				// While page loads, its content changes, and we'll keep the proper scroll on each sufficient content
				// change until the page finishes loading or user scrolls the page manually.
				var keepScrollPositionTimer = setInterval( function() {
					self.scrollTo( scrollPlace );
					// Additionally, let's check the states to avoid an infinite call.
					if ( _document.readyState !== 'loading' ) {
						clearInterval( keepScrollPositionTimer );
					}
				}, 100 );
				var clearHashEvents = () => {
					$us.$window.off( 'load mousewheel.noPreventDefault DOMMouseScroll touchstart.noPreventDefault', clearHashEvents );
					// Content size still may change via other script right after page load
					$ush.timeout( () => {
						$us.canvas._events.resize.call( $us.canvas );
						self._countAllPositions();
						// The size of the content can be changed using another script, so we recount the waypoints.
						if ( $us.hasOwnProperty( 'waypoints' ) ) {
							$us.waypoints._countAll();
						}
						self.scrollTo( scrollPlace );
					}, 100 );
				};
				$us.$window.on( 'load mousewheel.noPreventDefault DOMMouseScroll touchstart.noPreventDefault', clearHashEvents );
			}
		}

		// Basic set of options that should be extended by scrollTo methods
		self.animationOptions = {
			duration: self.options.animationDuration,
			easing: self.options.animationEasing,
			start: function() {
				self.isScrolling = true;
			},
			complete: function() {
				self.cancel.call( self );
			},
		}
	}

	USScroll.prototype = {

		/**
		 * Count hash's target position and store it properly
		 *
		 * @param {String} hash
		 */
		_countPosition: function( hash ) {
			var self = this,
				$target = self.blocks[ hash ].target,
				targetTop = $target.offset().top;

			// Get the real height for sticky elements,
			// since after sticking their height changes
			if ( $target.hasClass( 'type_sticky' ) ) {
				var key = 'realTop';
				if ( ! $target.hasClass( 'is_sticky' ) ) {
					$target.removeData( key );
				}
				if ( ! $target.data( key ) ) {
					$target.data( key, targetTop );
				}
				targetTop = $target.data( key ) || targetTop;
			}

			// For support Footer Reveal
			if ( $us.$body.hasClass( 'footer_reveal' ) && $target.closest( 'footer' ).length ) {
				targetTop = $us.$body.outerHeight( true ) + ( targetTop - $us.$window.scrollTop() );
			}

			self.blocks[ hash ].top = Math.ceil( targetTop - $us.canvas.getOffsetTop() );
		},

		/**
		 * Count all targets' positions for proper scrolling
		 */
		_countAllPositions: function() {
			var self = this;
			// Counting all blocks
			for ( var hash in self.blocks ) {
				if ( self.blocks[ hash ] ) {
					self._countPosition( hash );
				}
			}
		},

		/**
		 * Indicate scroll position by hash
		 *
		 * @param {String} activeHash
		 */
		_indicatePosition: function( activeHash ) {
			var self = this;
			for ( var hash in self.blocks ) {
				if ( ! self.blocks[ hash ] ) {
					continue;
				}
				var block = self.blocks[ hash ];
				if ( block.buttons !== _undefined ) {
					block.buttons
						.toggleClass( self.options.buttonActiveClass, hash === activeHash );
				}
				if ( block.menuItems !== _undefined ) {
					block.menuItems
						.toggleClass( self.options.menuItemActiveClass, hash === activeHash );
				}
				// Removing active class for all Menu Ancestors first.
				if ( block.menuAncestors !== _undefined ) {
					block.menuAncestors
						.removeClass( self.options.menuItemAncestorActiveClass );
				}
			}
			// Adding active class for activeHash Menu Ancestors after all Menu Ancestors active classes was removed in
			// previous loop. This way there would be no case when we first added classes for needed Menu Ancestors and
			// then removed those classes while checking sibling menu item's hash.
			if ( self.blocks[ activeHash ] !== _undefined && self.blocks[ activeHash ].menuAncestors !== _undefined ) {
				self.blocks[ activeHash ].menuAncestors.addClass( self.options.menuItemAncestorActiveClass );
			}
		},

		/**
		 * Attach anchors so their targets will be listened for possible scrolls
		 *
		 * @param {String|jQuery} anchors Selector or list of anchors to attach
		 */
		attach: function( anchors ) {
			var self = this,
				$anchors = $( anchors );

			if ( $anchors.length == 0 ) {
				return;
			}

			var // Decode pathname to compare non-latin letters.
				_pathname = decodeURIComponent( _location.pathname ),
				// Location pattern to check absolute URLs for current location.
				patternPathname = new RegExp( '^' + _pathname.replace( /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&" ) + '#' ),
				// Pattern for getting a record or checking a string for a record.
				patternPageId = /^\/?(\?page_id=\d+).*?/;

			$anchors.each( function( index, anchor ) {
				var $anchor = $( anchor ),
					// Link without a host
					href = ( '' + $anchor.attr( 'href' ) ).replace( _location.origin, '' ),
					hash = $anchor.prop( 'hash' ),
					hasProtocol = /^(https?:\/\/)/.test( href ),
					hasPageId = patternPageId.test( href );

				if (
					// Ignoring ajax links
					hash.indexOf( '#!' ) > -1
					// Case when there is no hash-tag
					|| href.indexOf( '#' ) < 0
					// Case where /#hash-tag is used (Allowed on homepage)
					|| ( href.substr( 0, 2 ) == '/#' && _location.search && _pathname == '/' )
					// Сase when the domain name of a third-party resource
					|| ( hasProtocol && href.indexOf( _location.origin ) !== 0 )
					// Case when the search of another page example: /?page_id={id}#hash-tag
					|| ( hasPageId && href.indexOf( ( _location.search.match( patternPageId ) || [] )[1] ) == -1 )
					// Case when the pathname of another page example: /postname/#hash-tag
					|| ( href.charAt( 0 ) == '/' && ! hasPageId && ! patternPathname.test( href ) )
				) {
					return;
				}

				// Do we have an actual target, for which we'll need to count geometry?
				if ( hash != '' && hash != '#' ) {
					// Attach target
					if ( self.blocks[ hash ] === _undefined ) {
						var $target = $( hash ), $type = '';

						// Don't attach anchors that actually have no target
						if ( $target.length == 0 ) {
							return;
						}
						// If it's the only row in a section, than use section instead.
						if ( $target.hasClass( 'g-cols' ) && $target.parent().children().length == 1 ) {
							$target = $target.closest( '.l-section' );
						}
						// If it's a tabs or tour item, then use it's tabs container
						if ( $target.hasClass( 'w-tabs-section' ) ) {
							var $newTarget = $target.closest( '.w-tabs' );
							if ( ! $newTarget.hasClass( 'accordion' ) ) {
								$target = $newTarget;
							}
							$type = 'tab';
						} else if ( $target.hasClass( 'w-tabs' ) ) {
							$type = 'tabs';
						}
						self.blocks[ hash ] = {
							target: $target, type: $type
						};
						self._countPosition( hash );
					}
					// Attach activity indicator
					if ( $anchor.parent().length > 0 && $anchor.parent().hasClass( 'menu-item' ) ) {
						var $menuIndicator = $anchor.closest( '.menu-item' );
						self.blocks[ hash ].menuItems = ( self.blocks[ hash ].menuItems || $() ).add( $menuIndicator );
						var $menuAncestors = $menuIndicator.parents( '.menu-item-has-children' );
						if ( $menuAncestors.length > 0 ) {
							self.blocks[ hash ].menuAncestors = ( self.blocks[ hash ].menuAncestors || $() ).add( $menuAncestors );
						}
					} else {
						self.blocks[ hash ].buttons = ( self.blocks[ hash ].buttons || $() ).add( $anchor );
					}
				}

				$anchor.on( 'click', function( event ) {
					event.preventDefault();
					// Prevent scroll on mobile menu items that should show child sub-items on click by label
					if (
						$anchor.hasClass( 'w-nav-anchor' )
						&& $anchor.closest( '.menu-item' ).hasClass( 'menu-item-has-children' )
						&& $anchor.closest( '.w-nav' ).hasClass( 'type_mobile' )
					) {
						var menuOptions = $anchor.closest( '.w-nav' ).find( '.w-nav-options:first' )[ 0 ].onclick() || {},
							dropByLabel = $anchor.parents( '.menu-item' ).hasClass( 'mobile-drop-by_label' ),
							dropByArrow = $anchor.parents( '.menu-item' ).hasClass( 'mobile-drop-by_arrow' );
						if ( dropByLabel || ( menuOptions.mobileBehavior && !dropByArrow ) ) {
							return false;
						}
					}

					// Prevent scroll if it is a just hash URL inside the popup
					if (
						$anchor.attr( 'href' ) === '#'
						&& $anchor.closest( '.w-popup-wrap' ).length
					) {
						return false;
					}

					self.scrollTo( hash, true );

					if ( typeof self.blocks[ hash ] !== 'undefined' ) {
						var block = self.blocks[ hash ];
						// When scrolling to an element, check for the presence of tabs, and if necessary, open the
						// first section
						if ( $.inArray( block.type, ['tab', 'tabs'] ) !== - 1 ) {
							var $linkedSection = block.target.find( '.w-tabs-section[id="' + hash.substr( 1 ) + '"]' );
							if ( block.type === 'tabs' ) {
								// Selects the first section
								$linkedSection = block.target.find( '.w-tabs-section:first' );
							} else if ( block.target.hasClass( 'w-tabs-section' ) ) {
								// The selected section
								$linkedSection = block.target;
							}
							if ( $linkedSection.length ) {
								// Trigger a click event to open the first section.
								$linkedSection
									.find( '.w-tabs-section-header' )
									.trigger( 'click' );
							}
						} else if (
							block.menuItems !== _undefined
							&& $us.currentStateIs( ['mobiles', 'tablets'] )
							&& $us.$body.hasClass( 'header-show' )
						) {
							$us.$body.removeClass( 'header-show' );
						}
					}
				} );
			} );
		},

		/**
		 * Gets the place position
		 *
		 * @param {*} place
		 * @return {{}}
		 */
		getPlacePosition: function( place ) {
			var self = this,
				data = { newY: 0, type: '' };
			// Scroll to top
			if ( place === '' || place === '#' ) {
				data.newY = 0;
				data.placeType = 'top';
			}
			// Scroll by hash
			else if ( self.blocks[ place ] !== _undefined ) {
				// Position recalculation
				self._countPosition( place );
				data.newY = self.blocks[ place ].top;
				data.placeType = 'hash';
				place = self.blocks[ place ].target;

				// JQuery object handler
			} else if ( place instanceof $ ) {
				if ( place.hasClass( 'w-tabs-section' ) ) {
					var newPlace = place.closest( '.w-tabs' );
					if ( ! newPlace.hasClass( 'accordion' ) ) {
						place = newPlace;
					}
				}
				// Get the Y position, taking into account the height of the header, adminbar and sticky elements.
				data.newY = place.offset().top;
				data.placeType = 'element';
			} else {
				// Get the Y position, taking into account the height of the header, adminbar and sticky elements.
				data.newY = place;
			}

			// If the page has a sticky section, then consider the height of the sticky section.
			if (
				$us.canvas.isStickySection()
				&& $us.canvas.hasPositionStickySections()
				&& ! $( place ).hasClass( 'type_sticky' )
				&& $us.canvas.isAfterStickySection( place )
			) {
				data.newY -= $us.canvas.getStickySectionHeight();
			}

			return data;
		},

		/**
		 * Scroll page to a certain position or hash
		 *
		 * @param {Number|String|jQuery} place
		 * @param {Boolean} animate Enables or disables scroll animation
		 */
		scrollTo: function( place, animate ) {
			var self = this,
				$place = $( place );
			if ( $place.closest( '.w-popup-wrap' ).length ) {
				self.scrollToPopupContent( place );
				return true;
			}

			var offset = self.getPlacePosition.call( self, place ),
				indicateActive = function() {
					if ( offset.type === 'hash' ) {
						self._indicatePosition( place );
					} else {
						self.scroll();
					}
				};

			if ( animate ) {
				// Fix for iPads since scrollTop returns 0 all the time
				if ( navigator.userAgent.match( /iPad/i ) != null && $( '.us_iframe' ).length && offset.type == 'hash' ) {
					$place[ 0 ].scrollIntoView( { behavior: "smooth", block: "start" } );
				}

				var scrollTop = $us.$window.scrollTop(),
					// Determining the direction of scrolling - up or down
					scrollDirections = scrollTop < offset.newY
						? 'down'
						: 'up';

				if ( scrollTop === offset.newY ) {
					return;
				}

				// Animate options
				var animateOptions = $.extend(
					{},
					self.animationOptions,
					{
						always: function() {
							self.isScrolling = false;
							indicateActive();
						}
					}
				);

				/**
				 * Get and applying new values during animation
				 *
				 * @param number now
				 * @param object fx
				 */
				animateOptions.step = function( now, fx ) {
					// Checking the position of the element, since the position may change if the leading elements
					// were loaded with a lazy load
					var newY = self.getPlacePosition( place ).newY;
					// Since the header at the moment of scrolling the scroll can change the height,
					// we will correct the position of the element
					if ( $us.header.isHorizontal() && $us.header.stickyEnabled() ) {
						newY -= $us.header.getCurrentHeight();
					}

					// Since elements can change height, we update the endpoint
					// of each integration thanks to object references.
					fx.end = newY;
				};

				// If the place has a css animation, then run it so that it executes and
				// after that it is possible to get the correct endpoint
				if ( $place.hasClass( 'us_animate_this' ) ) {
					$place.trigger( 'us_startAnimate' );
				}

				// Start animation
				$us.$htmlBody
					.stop( true, false )
					.animate( { scrollTop: offset.newY + 'px' }, animateOptions );

				// Allow user to stop scrolling manually
				$us.$window
					.on( 'keydown mousewheel.noPreventDefault DOMMouseScroll touchstart.noPreventDefault', self._events.cancel );
			} else {

				// If scrolling without animation, then we get the height of the header and change the position.
				if ( $us.header.stickyEnabled() && $us.header.isHorizontal() ) {
					offset.newY -= $us.header.getCurrentHeight( /* adminBar */true );
				}

				// Stop all animations and scroll to the set position
				$us.$htmlBody
					.stop( true, false )
					.scrollTop( offset.newY );
				indicateActive();
			}
		},

		/**
		 * Scroll Popup's content to a certain hash
		 *
		 * @param {String} place
		 */
		scrollToPopupContent: function( place ) {
			var self = this,
				id = place.replace( '#', '' ),
				elm = _document.getElementById( id );

			// Animate options
			var animateOptions = $.extend(
				{},
				self.animationOptions,
				{
					always: function() {
						self.isScrolling = false;
					},
				}
			);

			$( elm ).closest( '.w-popup-wrap' )
				.stop( true, false )
				.animate( { scrollTop: elm.offsetTop + 'px' }, animateOptions );

			$us.$window
				.on( 'keydown mousewheel.noPreventDefault DOMMouseScroll touchstart.noPreventDefault', self._events.cancel );
		},

		/**
		 * Cancel scroll
		 */
		cancel: function() {
			$us.$htmlBody.stop( true, false );
			$us.$window.off( 'keydown mousewheel.noPreventDefault DOMMouseScroll touchstart', this._events.cancel );
			this.isScrolling = false;
		},

		/**
		 * Scroll handler
		 */
		scroll: function() {
			var self = this,
				scrollTop = Math.ceil( $us.header.getScrollTop() );
			// Safari negative scroller fix.
			scrollTop = ( scrollTop >= 0 )
				? scrollTop
				: 0;
			if ( ! self.isScrolling ) {
				var activeHash;
				for ( var hash in self.blocks ) {
					if ( ! self.blocks[ hash ] ) {
						continue;
					}
					var top = self.blocks[ hash ].top,
						$target = self.blocks[ hash ].target;
					if ( ! $us.header.isHorizontal() ) {
						// The with a vertical header, subtract only the height of the admin bar, if any.
						top -= $us.canvas.getOffsetTop();
					} else {
						// Since the header at the moment of scrolling the scroll can change the height,
						// we will correct the position of the element
						if ( $us.header.stickyEnabled() ) {
							top -= $us.header.getCurrentHeight( /* adminBar */true );
						}
						// If the page has a sticky section, then consider the height of the sticky section
						if ( $us.canvas.hasStickySection() ) {
							top -= $us.canvas.getStickySectionHeight();
						}
					}
					top = $ush.parseInt( top.toFixed( 0 ) );
					if ( scrollTop >= top && scrollTop <= ( /* block bottom */top + $target.outerHeight( false ) ) ) {
						activeHash = hash;
					}
				}

				// Function call after 1ms
				$ush.debounce_fn_1ms( self._indicatePosition.bind( self, activeHash ) );
			}
		},

		/**
		 * Resize handler
		 */
		resize: function() {
			var self = this;
			// Delaying the resize event to prevent glitches.
			$ush.timeout( function() {
				self._countAllPositions();
				self.scroll();
			}, 150 );
			self._countAllPositions();
			self.scroll();
		}

	};

	$( function() {
		$us.scroll = new USScroll( $us.scrollOptions || {} );
	} );

}( jQuery );
