/**
 * Remove Video Overlay on click
 */
;( function( $, _undefined ) {
	"use strict";

	// Global variable for YouTube player API objects
	window.$us.YTPlayers = window.$us.YTPlayers || {};

	/* @class wVideo */
	$us.wVideo = function( container ) {
		const self = this;

		// Elements
		self.$container = $( container );
		self.$videoH = $( '.w-video-h', self.$container );

		// Cookies for the GDPR Compliance
		self.cookieName = self.$container.data( 'cookie-name' );

		// Determines if video has overlay
		self.isWithOverlay = self.$container.hasClass( 'with_overlay' );

		// Fix Safari Video Thumbnail before play
		if ( $ush.isSafari ) {
			( self.getVideoElement() || { load: $.noop } ).load();
		}

		// Prevent action
		if (
			! self.cookieName
			&& ! self.isWithOverlay
		) {
			return;
		}

		// Private "Variables"
		self.data = {};

		// Get data for initializing the player
		if ( self.$container.is( '[onclick]' ) ) {
			self.data = self.$container[0].onclick() || {};
			// Delete data everywhere except for the preview of the USBuilder, the data may be needed again to restore the elements.
			if ( ! $us.usbPreview() ) self.$container.removeAttr( 'onclick' );
		}

		// Bondable events
		self._events = {
			hideOverlay: self._hideOverlay.bind( self ),
			confirm: self._confirm.bind( self )
		};

		// Initialization via confirmations
		if ( self.cookieName ) {
			self.$container
				.on( 'click', '.action_confirm_load', self._events.confirm );
		}

		self.$container.one( 'click', '> *', self._events.hideOverlay );
	};

	// Export API
	$.extend( $us.wVideo.prototype, {

		/**
		 * Get video element
		 */
		getVideoElement: function() {
			return $( 'video', this.$videoH )[0] || null;
		},

		/**
		 * Video Player initialization handler after confirmation
		 *
		 * @event handler
		 */
		_confirm: function() {
			const self = this;

			// Save permission to loading maps in cookies
			if ( $( 'input[name^=' + self.cookieName + ']:checked', self.$container ).length ) {
				$ush.setCookie( self.cookieName, /* value */1, /* days */365 );
			}

			if ( self.isWithOverlay ) {
				self.insertPlayer();
			} else {
				self.$videoH
					// Add video html markup to element
					.html( $ush.base64Decode( '' + $( 'script[type="text/template"]', self.$container ).text() ) )
					.removeAttr( 'data-cookie-name' );
			}
		},

		/**
		 * @param {Event} e The Event interface represents an event which takes place in the DOM.
		 */
		_hideOverlay: function( e ) {
			const self = this;

			e.preventDefault();

			// Remove overlay.
			if ( self.$container.is( '.with_overlay' ) ) {
				self.$container
					.removeAttr( 'style' )
					.removeClass( 'with_overlay' );
			}

			// Add player to document.
			if ( ! self.cookieName ) {
				self.insertPlayer();
			}
		},

		/**
		 * Add player to document.
		 */
		insertPlayer: function() {
			const self = this;

			var data = $.extend( { player_id: '', player_api: '', player_html: '' }, self.data || {} );

			// If there is no API in the document yet, then add to the head.
			if ( data.player_api && ! $( 'script[src="'+ data.player_api +'"]', document.head ).length ) {
				$( 'head' ).append( '<script src="'+ data.player_api +'"></script>' );
			}

			// Add player to document
			self.$videoH.html( data.player_html );

			// Play "<video>"
			const videoElement = self.getVideoElement();
			if ( ! data.player_api && $ush.isNode( videoElement ) ) {
				// Fix video playback in Safari
				if ( self.isWithOverlay && $ush.isSafari ) {
					videoElement.setAttribute( 'preload', 'metadata' );
				}
				videoElement.play();
			}
		}
	});

	$.fn.wVideo = function() {
		return this.each( function() {
			$( this ).data( 'wVideo', new $us.wVideo( this ) );
		} );
	};

	$( () => $( '.w-video' ).wVideo() );

	// Init in Post\Product List or Grid context
	$us.$document.on( 'usPostList.itemsLoaded usGrid.itemsLoaded', ( _, $items ) => {
		$( '.w-video', $items ).wVideo();
	} );

} )( jQuery );
