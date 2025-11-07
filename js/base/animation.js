// Animation of elements appearance
;( function( $ ) {
	"use strict";

	/**
	 * @class USAnimate (name)
	 * @param mixed container The container
	 * @return self
	 */
	var USAnimate = function( container ) {
		var self = this;

		// Elements
		self.$container = $( container );
		self.$items = $( '[class*="us_animate_"]:not(.off_autostart)', self.$container );

		// Init waypoints
		self.$items.each( function( _, item ) {
			var $item = $( item );
			if ( $item.data( '_animate_inited' ) || $item.hasClass( 'off_autostart' ) ) {
				return;
			}

			// Always add "start" class to elements inside Carousel.
			// Because its elements should be animated on sliding carousel (not scrolling a page)
			if ( $item.parents('.owl-carousel').length ) {
				$item.addClass( 'start' );
			}

			$item.data( '_animate_inited', true );
			$us.waypoints.add( $item, /* offset */'12%', function( $node ) {
				if ( ! $node.hasClass( 'start' ) ) {
					$ush.timeout( function() {
						$node.addClass( 'start' );
					}, 20 );
				}
			} );
			// Event handler to initialize animation from outside
			$item.one( 'us_startAnimate', function() {
				if ( ! $item.hasClass( 'start' ) ) {
					$item.addClass( 'start' );
				}
			} )
		} );
	};

	// Export API
	window.USAnimate = USAnimate;

	// Init for loaded document
	new USAnimate( document );

	// Start animation for WPB elements that use their own animation options
	$( '.wpb_animate_when_almost_visible' ).each( function() {
		$us.waypoints.add( $( this ), /* offset */'12%', function( $node ) {
			if ( ! $node.hasClass( 'wpb_start_animation' ) ) {
				$ush.timeout( function() {
					$node.addClass( 'wpb_start_animation' );
				}, 20 );
			}
		} );
	} );
} )( jQuery );
