/**
 * Passive Events Listening v1.0.0.
 * To enable passive event listening, you need to make sure that the handler does
 * not use "e.preventDefault()" and add ".noPreventDefault" to the end of the name.
 *
 * Usage:
 * 	jQuery().on( 'scroll.noPreventDefault', () => {} );
 * 	jQuery().on( 'scroll.namespace.noPreventDefault', () => {} );
 */
! function( $, _undefined ) {
	"use strict";

	// Check support for passive events
	const supportsPassive = (() => {
		var supported = false;
		try {
			const opts = Object.defineProperty( {}, 'passive', {
				get() {
					supported = true;
				}
			});
			window.addEventListener( 'testPassive', null, opts );
			window.removeEventListener( 'testPassive', null, opts );
		} catch (e) {}
		return supported;
	})();

	if ( ! supportsPassive ) {
		return;
	}

	const REGEXP_NO_PREVENT_DEFAULT = /^(.*)\.noPreventDefault$/;

	// Supported event types
	[ 'scroll', 'wheel', 'mousewheel', 'touchstart', 'touchmove', 'touchend', ].map( ( eventType ) => {
		jQuery.event.special[ eventType ] = {
			setup: function( _, ns, handle ) {
				const options = {};
				if ( ns.includes( 'noPreventDefault' ) && ! REGEXP_NO_PREVENT_DEFAULT.test( eventType ) ) {
					options.passive = true
				}

				if ( document.documentMode ) {
					this.addEventListener( eventType, handle, options );
				} else {
					// Return false to allow normal processing in the caller
					return false;
				}
			},
		};
	} );

	// Begin of code for debugging
	// const originalAddEvent = EventTarget.prototype.addEventListener;
	// EventTarget.prototype.addEventListener = function( type, listener, options ) {
	// 	const eventTypes = [
	// 		'scroll', 'wheel',
	// 		'touchstart', 'touchmove', 'touchenter', 'touchend', 'touchleave',
	// 		'mouseout', 'mouseleave', 'mouseup', 'mousedown', 'mousemove', 'mouseenter', 'mousewheel', 'mouseover',
	// 	];
	// 	if ( eventTypes.includes( type ) ) {
	// 		console.log( 'testPassive:', [ type, { passive: ( options || {} ).passive, capture: ( options || {} ).capture } ] ) ;
	// 	}
	// 	originalAddEvent.call( this, type, listener, options );
	// };
	// // End of code for debugging

}( jQuery );
