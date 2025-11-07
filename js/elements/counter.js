/**
 * UpSolution Element: Counter
 */
! function( $, undefined ) {

	var // Private variables that are used only in the context of this function, it is necessary to optimize the code
		_parseFloat = parseFloat,
		_parseInt = parseInt,
		_undefined = undefined,
		_window = window

	/**
	 * Counter Number part animations
	 *
	 * @param container
	 * @constructor
	 */
	var USCounterNumber = function( container ) {
		var self = this;

		self.$container = $( container );
		self.initialString = self.$container.html() + '';
		self.finalString = self.$container.data( 'final' ) + '';
		self.format = self.getFormat( self.initialString, self.finalString );
		if ( self.format.decMark ) {
			var pattern = new RegExp( '[^0-9\/' + self.format.decMark + ']+', 'g' );
			self.initial = _parseFloat( self.initialString.replace( pattern, '' ).replace( self.format.decMark, '.' ) );
			self.final = _parseFloat( self.finalString.replace( pattern, '' ).replace( self.format.decMark, '.' ) );
		} else {
			self.initial = _parseInt( self.initialString.replace( /[^0-9]+/g, '' ) );
			self.final = _parseInt( self.finalString.replace( /[^0-9]+/g, '' ) );
		}
		if ( self.format.accounting ) {
			if ( self.initialString.length > 0 && self.initialString[ 0 ] == '(' ) {
				self.initial = - self.initial;
			}
			if ( self.finalString.length > 0 && self.finalString[ 0 ] == '(' ) {
				self.final = - self.final;
			}
		}
	};
	/**
	 * Export API
	 */
	USCounterNumber.prototype = {

		/**
		 * Function to be called at each animation frame
		 * @param now float Relative state between 0 and 1
		 */
		step: function( now ) {
			var self = this,
				value = ( 1 - now ) * self.initial + self.final * now,
				intPart = Math[ self.format.decMark ? 'floor' : 'round' ]( value ).toString(),
				result = '';
			if ( self.format.zerofill ) {
				// Check how many zeros we need to add to this step value
				var amountOfZeros = ( self.format.intDigits - intPart.length );
				if ( amountOfZeros > 0 ) {
					intPart = '0'.repeat( amountOfZeros ) + intPart;
				}
			}
			if ( self.format.groupMark ) {
				if ( self.format.indian ) {
					result += intPart.replace( /(\d)(?=(\d\d)+\d$)/g, '$1' + self.format.groupMark );
				} else {
					result += intPart.replace( /\B(?=(\d{3})+(?!\d))/g, self.format.groupMark );
				}
			} else {
				result += intPart;
			}
			if ( self.format.decMark ) {
				var decimalPart = ( value % 1 ).toFixed( self.format.decDigits ).substring( 2 );
				result += self.format.decMark + decimalPart;
			}
			if ( self.format.accounting && result.length > 0 && result[ 0 ] == '-' ) {
				result = '(' + result.substring( 1 ) + ')';
			}
			self.$container.html( result );
		},

		/**
		 * Get number format based on initial and final number strings
		 * @param initial string
		 * @param final string
		 * @returns {{groupMark, decMark, accounting, zerofill, indian}}
		 */
		getFormat: function( initial, final ) {
			var self = this,
				iFormat = self._getFormat( initial ),
				fFormat = self._getFormat( final ),
				// Final format has more priority
				format = $.extend( {}, iFormat, fFormat );
			// Group marks detector is more precise, so using it in controversial cases
			if ( format.groupMark == format.decMark ) {
				delete format.groupMark;
			}
			return format;
		},

		/**
		 * Get number format based on a single number string
		 * @param str string
		 * @returns {{groupMark, decMark, accounting, zerofill, indian}}
		 */
		_getFormat: function( str ) {
			var marks = str.replace( /[0-9\(\)\-]+/g, '' ),
				format = {};
			if ( str.charAt( 0 ) == '(' ) {
				format.accounting = true;
			}
			if ( /^0[0-9]/.test( str ) ) {
				format.zerofill = true;
			}
			str = str.replace( /[\(\)\-]/g, '' );
			if ( marks.length != 0 ) {
				if ( marks.length > 1 ) {
					format.groupMark = marks.charAt( 0 );
					if ( marks.charAt( 0 ) != marks.charAt( marks.length - 1 ) ) {
						format.decMark = marks.charAt( marks.length - 1 );
					}
					if ( str.split( format.groupMark ).length > 2 && str.split( format.groupMark )[ 1 ].length == 2 ) {
						format.indian = true;
					}
				} else/*if (marks.length == 1)*/ {
					format[ ( ( ( str.length - 1 ) - str.indexOf( marks ) ) == 3 && marks !== '.' ) ? 'groupMark' : 'decMark' ] = marks;
				}
				if ( format.decMark ) {
					format.decDigits = str.length - str.indexOf( format.decMark ) - 1;
				}
			}
			if ( format.zerofill ) {
				format.intDigits = str.replace( /[^\d]+/g, '' ).length - ( format.decDigits || 0 );
			}

			return format;
		}
	};

	/**
	 * Counter Number part animations
	 *
	 * @param container
	 * @constructor
	 */
	var USCounterText = function( container ) {
		var self = this;
		self.$container = $( container );
		self.initial = self.$container.text() + '';
		self.final = self.$container.data( 'final' ) + '';
		self.partsStates = self.getStates( self.initial, self.final );
		self.len = 1 / ( self.partsStates.length - 1 );
		// Text value won't be changed on each frame, so we'll update it only on demand
		self.curState = 0;
	};
	/**
	 * Export API
	 */
	USCounterText.prototype = {

		/**
		 * Function to be called at each animation frame
		 *
		 * @param now float Relative state between 0 and 1
		 */
		step: function( now ) {
			var self = this,
				state = Math.round( Math.max( 0, now / self.len ) );
			if ( state == self.curState ) {
				return;
			}
			self.$container.html( self.partsStates[ state ] );
			self.curState = state;
		},

		/**
		 * Slightly modified Wagner-Fischer algorithm to obtain the shortest edit distance with intermediate states
		 *
		 * @param initial string The initial string
		 * @param final string The final string
		 * @returns {[]}
		 */
		getStates: function( initial, final ) {
			var min = Math.min,
				dist = [],
				i, j;
			for ( i = 0; i <= initial.length; i ++ ) {
				dist[ i ] = [ i ];
			}
			for ( j = 1; j <= final.length; j ++ ) {
				dist[ 0 ][ j ] = j;
				for ( i = 1; i <= initial.length; i ++ ) {
					dist[ i ][ j ] = ( initial[ i - 1 ] === final[ j - 1 ] ) ? dist[ i - 1 ][ j - 1 ] : ( Math.min( dist[ i - 1 ][ j ], dist[ i ][ j - 1 ], dist[ i - 1 ][ j - 1 ] ) + 1 );
				}
			}
			// Obtaining the intermediate states
			var states = [ final ];
			for ( i = initial.length, j = final.length; i > 0 || j > 0; i --, j -- ) {
				var min = dist[ i ][ j ];
				if ( i > 0 ) {
					min = Math.min( min, dist[ i - 1 ][ j ], ( j > 0 ) ? dist[ i - 1 ][ j - 1 ] : min );
				}
				if ( j > 0 ) {
					min = Math.min( min, dist[ i ][ j - 1 ] );
				}
				if ( min >= dist[ i ][ j ] ) {
					continue;
				}
				if ( min == dist[ i ][ j - 1 ] ) {
					// Remove
					states.unshift( states[ 0 ].substring( 0, j - 1 ) + states[ 0 ].substring( j ) );
					i ++;
				} else if ( min == dist[ i - 1 ][ j - 1 ] ) {
					// Modify
					states.unshift( states[ 0 ].substring( 0, j - 1 ) + initial[ i - 1 ] + states[ 0 ].substring( j ) );
				} else if ( min == dist[ i - 1 ][ j ] ) {
					// Insert
					states.unshift( states[ 0 ].substring( 0, j ) + initial[ i - 1 ] + states[ 0 ].substring( j ) );
					j ++;
				}
			}
			return states;
		}
	};

	/**
	 * @param container
	 * @constructor
	 */
	var USCounter = function( container ) {
		var self = this;

		// Commonly used DOM elements
		self.$container = $( container );
		self.parts = [];
		self.duration = _parseFloat( self.$container.data( 'duration' ) || 2 ) * 1000;
		self.$container.find( '.w-counter-value-part' ).each( function( index, part ) {
			var $part = $( part );
			// Skipping the ones that won't be changed
			if ( $part.html() + '' == $part.data( 'final' ) + '' ) {
				return;
			}
			var type = $part.usMod( 'type' );
			if ( type == 'number' ) {
				self.parts.push( new USCounterNumber( $part ) );
			} else {
				self.parts.push( new USCounterText( $part ) );
			}
		} );
		if ( _window.$us !== _undefined && _window.$us.scroll !== _undefined ) {
			// Animate element when it becomes visible
			$us.waypoints.add( self.$container, /* offset */'15%', self.animate.bind( self ) );
		} else {
			// No waypoints available: animate right from the start
			self.animate();
		}
	};
	/**
	 * Export API
	 */
	USCounter.prototype = {
		animate: function( duration ) {
			var self = this;
			self.$container.css( 'w-counter', 0 ).animate( { 'w-counter': 1 }, {
				duration: self.duration,
				step: self.step.bind( self )
			} );
		},

		/**
		 * Function to be called at each animation frame
		 *
		 * @param now float Relative state between 0 and 1
		 */
		step: function( now ) {
			var self = this;
			for ( var i = 0; i < self.parts.length; i ++ ) {
				self.parts[ i ].step( now );
			}
		}
	};

	$.fn.wCounter = function( options ) {
		return this.each( function() {
			var self = this;
			$( self ).data( 'wCounter', new USCounter( self, options ) );
		} );
	};

	$( function() {
		$( '.w-counter' ).wCounter();
	} );
}( jQuery );
