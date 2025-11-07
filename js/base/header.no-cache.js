/**
 * Script that needed to be exluded for JS delay execution
 */
! ( function( $, _undefined ) {
	"use strict";

	const _window = window;
	const _document = document;

	_window.$us = _window.$us || {};

	function isNode( node ) {
		return ( node && node.nodeType );
	}

	function hasClass( node, className ) {
		if ( isNode( node ) ) {
			return node.classList.contains( className );
		}
		return false;
	}

	function getAt( node ) {
		if ( isNode( node ) ) {
			return ( node.className.match( 'at_([\dA-z_-]+)' ) || [] )[1];
		}
		return;
	}

	// Retrieve/set/erase dom modificator class <mod>_<value>
	function usMod( node, mod, value ) {
		if ( ! isNode( node ) || ! mod ) {
			return;
		}
		if ( value ) {
			value = `${mod}_${value}`;
		}
		var className = String( node.className );
		className = className.replace( new RegExp( `${mod}_([a-z]+)` ), value );
		if ( value && ! className.includes( value )  ) {
			className += ` ${value}`;
		}
		if ( node.className !== className ) {
			node.className = className;
		}
	}

	function USHeader_NoCache() {
		const self = this;

		// Elements
		const lHeader = _document.querySelector( '.l-header' );
		if ( ! isNode( lHeader ) ) {
			return;
		}

		self.places = {
			hidden: lHeader.querySelector( '.l-subheader.for_hidden' )
		};
		self.elms = {};
		self.state = 'default';

		// Private "Variables"
		self.settings = $us.headerSettings || {};

		// Screen breakpoints
		self.breakpoints = {
			laptops: 1280,
			tablets: 1024,
			mobiles: 600
		};
		for ( const k in self.breakpoints ) {
			self.breakpoints[ k ] = parseInt( ( ( self.settings[ k ] || {} ).options || {} ).breakpoint ) || self.breakpoints[ k ];
		}

		// Bondable events
		self._events = {
			resize: self.resize.bind( self ),
		};

		// Get all places in the header
		lHeader.querySelectorAll( '.l-subheader-cell' ).forEach( ( node ) => {
			self.places[ getAt( node.parentNode.parentNode ) + '_' + getAt( node ) ] = node;
		} );

		// Get all header elements and save them into the this.$elms list
		lHeader.querySelectorAll( '[class*=ush_]' ).forEach( ( node ) => {
			// Regular expression to find elements in the header via class names
			const matches = /(^| )ush_([a-z_]+)_([\d]+)(\s|$)/.exec( node.className );
			if ( ! matches ) {
				return;
			}
			const id = matches[2] + ':' + matches[3];
			// If the element is a wrapper, store it into the this.$places list.
			if ( hasClass( node, 'w-vwrapper' ) || hasClass( node, 'w-hwrapper' ) ) {
				self.places[ id ] = node;
			}
			self.elms[ id ] = node;
		} );

		// Events
		_window.addEventListener( 'resize', self._events.resize );

		self.setView( 'default' );
		self.resize();
	}

	/**
	 * Set view for current screen.
	 *
	 * @param {String} newState
	 */
	USHeader_NoCache.prototype.setView = function( newState ) {
		const self = this;

		if ( newState !== self.state ) {
			usMod( _document.body, 'state', self.state = newState );
		}

		const orientation = ( ( self.settings[ newState ] || {} ).options || {} ).orientation || 'hor';
		if ( orientation !== self.orientation ) {
			usMod( _document.body, 'header', self.orientation = orientation );
		}

		if ( [ 'default', 'laptops' ].includes( newState ) ) {
			_document.body.classList.remove( 'header-show' );
		}
	};

	/**
	 * Set the layout.
	 *
	 * @param {String} value New layout.
	 */
	USHeader_NoCache.prototype.setLayout = function( newState ) {
		const self = this;
		const layout = ( self.settings[ newState ] || {} ).layout || {};
		for ( const place in layout ) {
			if ( ! layout[ place ] || ! self.places[ place ] ) {
				// The case when the wrapper is hidden on all states,
				// but has elements that can be visible on a certain state
				if ( place.indexOf( 'wrapper' ) > -1 ) {
					self.places[ place ] = self.places['hidden'];
				} else {
					continue;
				}
			}
			self._placeElements( layout[ place ], self.places[ place ] );
		}
	};

	/**
	 * Recursive function to place elements based on their ids.
	 *
	 * @param {[]} elms This is a list of all the elements in the header.
	 * @param {Node} place
	 */
	USHeader_NoCache.prototype._placeElements = function( elms, place ) {
		const self = this;
		for ( var i = 0; i < elms.length; i ++ ) {
			var elmId;
			if ( typeof elms[ i ] == 'object' ) {
				// Wrapper
				elmId = elms[ i ][0];
				if ( ! self.places[ elmId ] || ! self.elms[ elmId ] ) {
					continue;
				}
				place.append( self.elms[ elmId ] );
				self._placeElements( elms[ i ].shift(), self.places[ elmId ] );
			} else {
				elmId = elms[ i ];
				if ( ! self.elms[ elmId ] ) {
					continue;
				}
				place.append( self.elms[ elmId ] );
			}
		}
	};

	/**
	 * This method is called every time the browser window is resized.
	 */
	USHeader_NoCache.prototype.resize = function() {
		const self = this;
		// Determine the state based on the current size of the browser window.
		var newState = 'default';
		for ( const state in self.breakpoints ) {
			if ( _window.innerWidth <= self.breakpoints[ state ] ) {
				newState = state;
			} else {
				break;
			}
		}
		if ( self.state !== newState ) {
			self.setLayout( newState );
			self.setView( newState );
			if ( $us.header && typeof $us.header.setView == 'function' ) {
				$us.header.setView( newState );
			}
		}
	};


	$us.headerNoCache = new USHeader_NoCache;

} ) ();
