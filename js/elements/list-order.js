/**
 * UpSolution Element: List Order
 */
! function( $, _undefined ) {
	"use strict";

	const DELETE_FILTER = null;
	const urlManager = $ush.urlManager();
	const urlParam = '_orderby';

	/**
	 * @param {Node} container.
	 */
	function usListOrder( container ) {
		const self = this;

		// Bondable events
		self._events = {
			selectChanged: self._selectChanged.bind( self ),
		};

		// Elements
		self.$container = $( container );
		self.$pageContent = $( 'main#page-content' );

		// Sets value from URL
		if ( self.changeURLParams() ) {
			let urlValue = urlManager.get( urlParam );
			if ( ! $ush.isUndefined( urlValue ) ) {
				$( 'select', container ).val( urlValue );
			}
		}

		// Events
		self.$container.on( 'change', 'select', self._events.selectChanged );
	}

	// List Order API
	$.extend( usListOrder.prototype, {

		/**
		 * Determines if enabled URL.
		 *
		 * @return {Boolean} True if enabled url, False otherwise.
		 */
		changeURLParams: function() {
			return this.$container.hasClass( 'change_url_params' );
		},

		/**
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM.
		 */
		_selectChanged: function( e ) {
			const self = this;

			const $firstList = $( `
				.w-grid.us_post_list:visible,
				.w-grid.us_product_list:visible,
				.w-grid-none:visible
			`, self.$pageContent ).first();

			if ( $firstList.hasClass( 'w-grid' ) ) {
				$firstList.addClass( 'used_by_list_order' );
			}

			let value = e.target.value;
			if ( value === '' ) {
				value = DELETE_FILTER;
			}
			if ( value === self.lastValue ) {
				return;
			}
			self.lastValue = value;

			if ( self.changeURLParams() ) {
				urlManager.set( urlParam, value ).push();
			}

			$firstList.trigger( 'usListOrder', [ urlParam, value ] );
		}
	} );

	$.fn.usListOrder = function() {
		return this.each( function() {
			$( this ).data( 'usListOrder', new usListOrder( this ) );
		} );
	};

	$( () => {
		$( '.w-order.for_list' ).usListOrder();
	} );

}( jQuery );
