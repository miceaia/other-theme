/**
 * UpSolution Element: Countdown Timer
 */
! ( function( $ ) {
	"use strict";

	const floor = Math.floor;

	function UsCountdown( container ) {
		this.$container = $( container );
		this.itemMap = {};
		this.data = {};

		if ( this.$container.hasClass( 'expired' ) ) {
			return;
		}

		if ( this.$container.is( '[onclick]' ) ) {
			$.extend( this.data, this.$container[0].onclick() || {} );
		}

		// Delete data everywhere except for the preview of the usbuilder,
		// the data may be needed again to restore the elements.
		if ( ! $us.usbPreview() ) {
			this.$container.removeAttr( 'onclick' );
		}

		this.remaining = $ush.parseInt( this.data.remainingTime );

		// Needed for optimization slide() function
		this.prev = {
			days: null,
			hours: null,
			minutes: null,
			seconds: null,
		};

		this.$container.find( '.w-countdown-item' ).each( ( i, item ) => {
			var type = $( item ).data( 'type' ),
				$itemNumber = $( item ).find( '.w-countdown-item-number' ),
				$value = $itemNumber.find( 'span' );
			this.itemMap[ type ] = { $itemNumber, $value };
		} );

		this.init();
	}

	$.extend( UsCountdown.prototype, {
		init: function() {
			this.slide( false );
			this.timer = $ush.timeout( this.tick.bind( this ), 1000 );
		},

		tick: function() {
			this.remaining --;
			if ( this.remaining < 0 ) {
				return this.finish();
			}
			this.slide( true );

			$ush.clearTimeout( this.timer );

			this.timer = $ush.timeout( this.tick.bind( this ), 1000 );
		},

		slide: function( animate ) {
			const values = {
				days: floor( this.remaining / 86400 ),
				hours: floor( ( this.remaining % 86400 ) / 3600 ),
				minutes: floor( ( this.remaining % 3600 ) / 60 ),
				seconds: this.remaining % 60,
			};

			Object.keys( values ).forEach( type => {
				const newVal = String( values[ type ] ).padStart( 2, '0' );

				// Reduce the number of calls if the value hasn't changed (actually for minutes, hours, days)
				if ( this.prev[ type ] === newVal ) {
					return;
				}
				this.prev[ type ] = newVal;

				const item = this.itemMap[ type ];
				if ( $us.usbPreview() && ! item ) {
					return;
				}
				const $old = item.$value;
				const oldVal = $old.text();

				// First slide
				if ( ! animate || oldVal === '' ) {
					$old.text( newVal );
					return;
				}

				const $new = $( '<span class="new">' )
					.text( newVal )
					.appendTo( item.$itemNumber );

				if ( ! this.$container.hasClass( 'animation_none' ) ) {
					$old.removeClass( 'old new is-updating' )
						.addClass( 'old is-updating' );
					$new.addClass( 'is-updating' );

					// When CSS animation is finished
					$new.one( 'animationend', () => {
						// Prevent visual glitch when switch browser tabs
						item.$itemNumber.find( 'span:not(:last)' ).remove();
						$old.remove();
						$new.removeClass( 'old new is-updating' );
						item.$value = $new;
					} );
				} else {
					// Prevent visual glitch when switch browser tabs
					item.$itemNumber.find( 'span:not(:last)' ).remove();
					$old.remove();
					item.$value = $new;
				}
			} );
		},

		finish: function() {
			$ush.clearTimeout( this.timer );
			this.$container.addClass( 'expired' );
		}
	} );

	$.fn.wCountdown = function() {
		return this.each( function() {
			$( this ).data( 'wCountdown', new UsCountdown( this ) );
		} );
	};

	$( () => $( '.w-countdown' ).wCountdown() );

} )( jQuery );
