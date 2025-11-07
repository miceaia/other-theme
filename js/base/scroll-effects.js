/**
 * Scroll Effects - Functionality describing the logic of scrolling effect.
 */
! function( $, undefined ) {
	"use strict";

	// Private variables that are used only in the context of this function, it is necessary to optimize the code.
	var _window = window,
		_body = document.body;

	// Math API
	var abs = Math.abs,
		max = Math.max,
		min = Math.min,
		floor = Math.floor,
		round = Math.round;

	// Prevent errors if our global objects are not set yet
	_window.$us = _window.$us || {};
	_window.$ush = _window.$ush || {};

	/**
	 * @type {Number} N(px) - The value provides the best balance: performance VS precision.
	 */
	const _TRANSLATE_FACTOR_ = 7;

	/**
	 * Get the current offset of the scrolls.
	 *
	 * @return {{}} Returns an object of current scroll values.
	 */
	function scroll() {
		return {
			top: _window.scrollY || _window.pageYOffset,
		};
	}

	/**
	 * Check if effects are disabled.
	 *
	 * @return {Boolean}
	 */
	function areEffectsDisabled() {
		return $us.canvasOptions.disableEffectsWidth >= _body.clientWidth;
	}

	/**
	 * @var {{}} Private temp data.
	 */
	var _lastState = {
		bodyHeight: $ush.parseInt( _body.clientHeight ),
		effectsDisabled: areEffectsDisabled(),
	};

	/**
	 * @class ScrollEffects - Scroll effects manager.
	 */
	function ScrollEffects() {
		var self = this;

		// Variables
		self.elms = [];

		/**
		 * @var {{}} Bondable events
		 */
		self._events = {
			onScroll: self._onScroll.bind( self ),
			onСontentChange: self._onСontentChange.bind( self ),
		};

		// Events
		$us.$window
			.on( 'scroll.noPreventDefault', self._events.onScroll )
			.on( 'resize', $ush.debounce( self._events.onСontentChange, 25 ) );

		// Handler for updating initial data when content changes
		$us.$canvas
			.on( 'contentChange', $ush.debounce( self._events.onСontentChange, 1 ) );
	}

	// Scroll Effect API
	ScrollEffects.prototype = {

		/**
		 * Add scroll effects manager to elements.
		 *
		 * @param {Node|[Node...]} elms The element or array of elements.
		 */
		addElms: function( elms ) {
			var self = this;
			if ( ! Array.isArray( elms ) ) {
				elms = [ elms ];
			}
			elms.map( function( element ) {
				if ( $ush.isNode( element ) ) {
					// Destroy old instance
					for ( var i in self.elms ) {
						if ( self.elms[ i ].node === element ) {
							self.elms[ i ].removeEffects();
							self.elms.splice( i, 1 );
							break;
						}
					}
					self.elms.push( new SE_Manager( element ) );
				}
			} );
		},

		/**
		 * Handler makes adjustments to the effects when the window or body size changes.
		 *
		 * @event handler
		 */
		_onСontentChange: function() {
			var self = this;

			// Turn effects on or off for the current screen width
			var effectsDisabled = areEffectsDisabled();
			if ( _lastState.effectsDisabled !== effectsDisabled ) {
				_lastState.effectsDisabled = effectsDisabled;
				self.elms.map( function( element ) {
					element[ effectsDisabled ? 'removeEffects' : 'applyEffects' ]();
				} );
			}

			// If the body height has changed, update elements data
			var bodyHeight = $ush.parseInt( _body.clientHeight );
			if ( _lastState.bodyHeight !== bodyHeight ) {
				_lastState.bodyHeight = bodyHeight;
				self.elms.map( function( element ) {
					element.setInitialData();
				} );
			}
		},

		/**
		 * Handler for the scroll event.
		 *
		 * @event handler
		 */
		_onScroll: function() {
			var self = this;
			if ( areEffectsDisabled() ) {
				return;
			}
			self.elms.map( function( element ) {
				// If the node is outside the viewport, then skip it
				if ( ! element.isInViewport() ) {
					element.node.classList.remove( 'in_viewport' );
					return;
				}
				element.node.classList.add( 'in_viewport' );
				element.applyEffects();
			} );
		}

	};

	// Export API
	$us.scrollEffects = new ScrollEffects;

	/**
	 * @class SE_Manager - Scroll Effects Manager.
	 * @param {Node} node The node.
	 */
	function SE_Manager( node ) {
		var self = this;

		// Variables
		self.node = node;
		// Note: IEEE 754 standard (https://en.wikipedia.org/wiki/Signed_zero)
		self.offsetTop = -0; // offset top for synchronize effects
		self.nearestTop = -0; // nearest top of initial or current position
		self.currentHeight = -0; // current element height
		self.initialData = {
			top: -0,
			height: -0,
		};
		self._config = {
			start_position: '0%', // distance from the bottom screen edge, where the element starts its animation
			end_position: '100%', // distance from the bottom screen edge, where the element ends its animation
			from_initial_position: 0, // start animation from initial position
			translate_y: 0,
			translate_y_direction: 'up',
			translate_y_speed: '0.5x',
			translate_x: 0,
			translate_x_direction: 'left',
			translate_x_speed: '0.5x',
			opacity: 0,
			opacity_direction: 'out-in',
			scale: 0,
			scale_direction: 'up',
			scale_speed: '0.5x',
			delay: '0.1s',
		};

		// Load configuration
		var $node = $( node );
		$.extend( self._config, $node.data( 'us-scroll' ) || {} );
		$node.removeAttr( 'data-us-scroll' );

		// Set initial data
		self.setInitialData();

		// Set classes and css variable
		node.classList.toggle( 'in_viewport', self.isInViewport() );

		// Apply effects
		if ( ! areEffectsDisabled() ) {
			self.applyEffects();
		}

		// Important! Set after init node positions
		$ush.timeout( function() {
			node.style.setProperty( '--scroll-delay', self.getParam( 'delay' ) );
		}, 100 );
	}

	// Scroll Effects Manager API
	SE_Manager.prototype = {

		/**
		 * Set or update initial data.
		 */
		setInitialData: function() {
			var self = this,
				rect = $ush.$rect( self.node );

			self.currentHeight = rect.height;
			self.initialData.height = rect.height;
			self.initialData.top = scroll().top + rect.top - $ush.parseFloat( self.style( '--translateY' ) );
			self.translateSpeedY = $ush.parseFloat( self.getParam( 'translate_y_speed' ) );
			self.translateSpeedX = $ush.parseFloat( self.getParam( 'translate_x_speed' ) );

			// Calculate scroll bounds for elements that scroll between specified start and end positions
			// (and not from its initial/original position)
			if ( $ush.parseInt( self.getParam( 'from_initial_position' ) ) != 1 ) {
				var startPosition = $ush.parseInt( self.getParam( 'start_position' ) ),
					endPosition = $ush.parseInt( self.getParam( 'end_position' ) ),
					centerPosition = 50;

				self.centerScrollTop = $ush.parseInt(
					self.initialData.top + self.initialData.height / 2 - _window.innerHeight / 2
				);

				self.startScrollTop = self.centerScrollTop - _window.innerHeight / 2
					+ ( startPosition / 100 * _window.innerHeight )
					- self.initialData.height * ( centerPosition - startPosition ) / 100;

				self.endScrollTop = self.centerScrollTop - _window.innerHeight / 2
					+ ( endPosition / 100 * _window.innerHeight )
					+ self.initialData.height * ( endPosition - centerPosition ) / 100;
			}
		},

		/**
		 * Determines whether the element is in the viewport area.
		 *
		 * @return {Boolean} True if in viewport, False otherwise.
		 */
		isInViewport: function() {
			var self = this,
				rect = $ush.$rect( self.node ),
				initialTop = self.initialData.top - scroll().top,
				nearestTop = min( initialTop, rect.top ) - _window.innerHeight;

			self.offsetTop = rect.top;
			self.nearestTop = nearestTop;
			self.currentHeight = rect.height;

			return (
				nearestTop <= 0
				&& ( max( initialTop, rect.top ) + rect.height ) >= 0
			);
		},

		/**
		 * Check if element has class.
		 *
		 * @param {String} className The class name.
		 * @return {Boolean} True if class, False otherwise.
		 */
		hasClass: function( className ) {
			return className && this.node.classList.contains( className );
		},

		/**
		 * Get or set a style property.
		 *
		 * @param {String} prop The property.
		 * @param {*} value The value [optional].
		 * @return {*} Returns values on get, nothing on set.
		 */
		style: function( prop, value ) {
			var elmStyle = this.node.style;
			if ( $ush.isUndefined( value ) ) {
				return elmStyle.getPropertyValue( prop );
			} else {
				elmStyle.setProperty( prop, $ush.toString( value ) );
			}
		},

		/**
		 * Get parameter values by param name.
		 * Note: This method supports the data attributes required by Live Builder and can be used in custom solutions.
		 *
		 * @param {String} name The param name.
		 * @param {*} defaultValue The default value.
		 * @return {*} Returns parameter values.
		 */
		getParam: function( name, defaultValue ) {
			var self = this;
			return (
				self.node.dataset[ name ]
				|| self._config[ name ]
				|| defaultValue
			);
		},

		/**
		 * Get position data for an element.
		 *
		 * @param {Number} offsetY The offset by axis relative to viewport.
		 * @param {Number} distanceInPx The distance in viewing area (along any axis).
		 * @return {{}} Returns a data object.
		 */
		getPositionData: function( offsetY, distanceInPx ) {
			var self = this,
				// RESULT = 100% - ( OFFSET / DISTANCE * 100% )
				currentPosition = 100 - ( $ush.parseFloat( offsetY ) / $ush.parseFloat( distanceInPx ) * 100 ),
				startPosition = $ush.parseInt( self.getParam( 'start_position' ) ),
				endPosition = $ush.parseInt( self.getParam( 'end_position' ) );

			return {
				start: startPosition,
				current: $ush.limitValueByRange( currentPosition, 0, 100 ), // range: 0-100%
				end: endPosition,
				diff: ( endPosition - startPosition ),
			};
		},

		/**
		 * Apply the effects.
		 */
		applyEffects: function() {
			var self = this;
			self.setTranslateY();
			self.setTranslateX();
			self.setOpacity();
			self.setScale();
		},

		/**
		 * Remove the effects.
		 */
		removeEffects: function() {
			var self = this;
			[ '--translateY', '--translateX', '--opacity', '--scale' ]
				.map( function( varName ) {
					self.style( varName, /*remove*/'' );
				} );
		},

		/**
		 * Get the position for translate.
		 *
		 * @param {Number} translateSpeed  The translate speed.
		 * @return {Number} The position.
		 */
		getPosition: function( translateSpeed ) {
			var self = this,
				position = -0;

			// Animate this element from its initial position
			if ( $ush.parseInt( self.getParam( 'from_initial_position' ) ) == 1 ) {
				position = scroll().top * translateSpeed;
				// Animate this element from Start to End positions
			} else {
				// Actual animation between Start and End positions
				if ( self.startScrollTop < scroll().top && scroll().top < self.endScrollTop ) {
					position = ( scroll().top - self.centerScrollTop ) * translateSpeed;
					// Start position and before
				} else if ( self.startScrollTop >= scroll().top ) {
					position = ( self.startScrollTop - self.centerScrollTop ) * translateSpeed;
					// End position and after
				} else if ( self.endScrollTop <= scroll().top ) {
					position = ( self.endScrollTop - self.centerScrollTop ) * translateSpeed;
				}
			}

			// Prevent element going beyond the bottom border of the document, becuase it causes scroll bar increasing glitch
			if ( self.initialData.top + self.initialData.height + position >= _lastState.bodyHeight ) {
				return _lastState.bodyHeight - self.initialData.top - self.initialData.height - 1;
			}
			return position;
		},

		/**
		 * Set vertical offset.
		 */
		setTranslateY: function() {
			var self = this;

			// If the speed is not set, then exit
			if ( ! self.hasClass( 'has_translate_y' ) || ! self.translateSpeedY ) {
				return;
			}

			var translateSpeed = self.translateSpeedY,
				translateY;

			// Depending on the direction, change the speed value to negative or positive
			if ( self.getParam( 'translate_y_direction' ) !== 'down' ) {
				translateSpeed = - translateSpeed;
			}

			self.style( '--translateY', self.getPosition( translateSpeed ) + 'px' );
		},

		/**
		 * Set horizontal offset.
		 */
		setTranslateX: function() {
			var self = this;

			// If the speed is not set, then exit
			if ( ! self.hasClass( 'has_translate_x' ) || ! self.translateSpeedX ) {
				return;
			}

			var translateSpeed = self.translateSpeedX,
				translateX;

			// Depending on the direction, change the speed value to negative or positive
			if ( self.getParam( 'translate_x_direction' ) !== 'right' ) {
				translateSpeed = - translateSpeed;
			}

			self.style( '--translateX', self.getPosition( translateSpeed ) + 'px' );
		},

		/**
		 * Set transparency.
		 */
		setOpacity: function() {
			var self = this;

			// Get opacity direction
			var opacityDirection = self.getParam( 'opacity_direction' ),
				opacity;
			if ( ! self.hasClass( 'has_opacity' ) || ! opacityDirection ) {
				return;
			}

			// If animating from initial position, it is based on the window scroll
			if ( $ush.parseInt( self.getParam( 'from_initial_position' ) ) == 1 ) {
				var initialPosition = $ush.parseInt( self.initialData.top + self.initialData.height / 2 );

				// Get opacity: RESULT = WINDOW SCROLL / ELEMENT INITIAL POSITION
				opacity = min( 1, scroll().top / initialPosition );

				// If animating on viewport enter
			} else {
				// Get positions
				var elmHeight = self.initialData.height,
					viewportHeight = _window.innerHeight,
					offsetTop = viewportHeight + self.nearestTop + elmHeight,
					position = self.getPositionData( offsetTop, viewportHeight + elmHeight ),
					startPosition = position.start,
					currentPosition = $ush.limitValueByRange( round( position.current ), startPosition, position.end ); // range: start-end

				// Get opacity: RESULT = ( ( 100% / POSITION_DIFF ) * PASSED_POSITION ) / 100%
				opacity = ( ( 100 / position.diff ) * ( currentPosition - startPosition ) ) / 100;
			}


			if ( opacityDirection === 'in-out' ) {
				opacity = 1 - opacity; // reverse direction
			} else if ( opacityDirection === 'in-out-in' ) {
				opacity = ( 2 * opacity ) - 1;
			} else if ( opacityDirection === 'out-in-out' ) {
				opacity = ( opacity > 0.5 ? 2 : 0 ) - ( 2 * opacity );
			}
			self.style( '--opacity', $ush.limitValueByRange( abs( opacity ).toFixed( 3 ), 0, 1 ) );
		},

		/**
		 * Set scale.
		 */
		setScale: function() {
			var self = this;

			// If the speed is not set, then exit
			var scaleSpeed = $ush.parseFloat( self.getParam( 'scale_speed' ) );
			if ( ! self.hasClass( 'has_scale' ) || ! scaleSpeed ) {
				return;
			}

			// Depending on the direction, change the speed value to negative or positive
			if ( self.getParam( 'scale_direction' ) === 'down' ) {
				scaleSpeed = -scaleSpeed;
			}

			// If animating from initial position, it is based on the window scroll
			if ( $ush.parseInt( self.getParam( 'from_initial_position' ) ) == 1 ) {
				// Get scale: RESULT = 1 + % OF WINDOW HEIGHT SCROLLED / 50% * SPEED
				var scale = 1 + ( scroll().top / _window.innerHeight * 100 ) / 50 * scaleSpeed;

				// If animating on viewport enter
			} else {
				// Get positions
				var elmHeight = max( self.initialData.height, self.currentHeight ),
					viewportHeight = _window.innerHeight,
					offsetTop = viewportHeight + self.nearestTop + elmHeight,
					position = self.getPositionData( offsetTop, viewportHeight + elmHeight ),
					currentPosition = $ush.limitValueByRange( round( position.current ), position.start, position.end ); // range: start-end

				// Get scale: RESULT = 1 - ( 50% - POSITION ) / 50% * SPEED
				var scale =  1 - ( 50 - currentPosition ) / 50 * scaleSpeed;
			}

			if ( scale < 0 ) {
				scale = 0;
			}

			self.style( '--scale', scale );
		}
	};

	// Add to jQuery
	$.fn.usScrollEffects = function() {
		return this.each( function() {
			$us.scrollEffects.addElms( this );
		} )
	};

	// Init scroll effects
	$( function() {
		$( '[data-us-scroll]' ).usScrollEffects();
	} );

}( jQuery );
