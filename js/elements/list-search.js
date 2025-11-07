/**
 * UpSolution Element: List Search
 */
! function( $, _undefined ) {
	"use strict";

	const DELETE_FILTER = null;
	const urlManager = $ush.urlManager();
	const urlParam = '_s';

	/**
	 * @param {Node} container.
	 */
	function usListSearch( container ) {
		const self = this;

		// Bondable events
		self._events = {
			searchTextChanged: self._searchTextChanged.bind( self ),
			formSubmit: self._formSubmit.bind( self ),
		};

		// Elements
		self.$container = $( container );
		self.$input = $( 'input', container );
		self.$pageContent = $( 'main#page-content' );
		self.$message = $( '.w-search-message', container );

		// Private "Variables"
		self.name = self.$input.attr( 'name' );

		// Sets value from URL
		if ( self.changeURLParams() ) {
			let urlValue = urlManager.get( urlParam );
			if ( ! $ush.isUndefined( urlValue ) ) {
				self.$input.val( urlValue );
			}
		}

		// Events
		self.$container
			.on( 'input', 'input', $ush.throttle( self._events.searchTextChanged, /* wait */300, /* no_trailing */false ) )
			.on( 'click', 'buttom', self._events.searchTextChanged )
			.on( 'submit', 'form', self._events.formSubmit );

		// Defines enter presses in field
		$us.$document.on( 'keypress', ( e ) => {
			if ( self.$input.is( ':focus' ) && e.keyCode === $ush.ENTER_KEYCODE ) {
				e.preventDefault();
				self._events.searchTextChanged( e );
			}
		});
	}

	// List Search API
	$.extend( usListSearch.prototype, {

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
		_formSubmit: function( e ) {
			e.preventDefault();
			this._events.searchTextChanged( e );
		},

		/**
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM.
		 */
		_searchTextChanged: function( e ) {
			const self = this;

			const $firstList = $( `
				.w-grid.us_post_list:visible,
				.w-grid.us_product_list:visible,
				.w-grid-none:visible
			`, self.$pageContent ).first();

			if ( $firstList.hasClass( 'w-grid' ) ) {
				self.$message.addClass( 'hidden' ).text('');
				$firstList.addClass( 'used_by_list_search' );

			} else if ( ! $firstList.hasClass( 'w-grid-none' ) ) {
				self.$message
					.html( 'No suitable list found. Add <b>Post List</b> or <b>Product List</b> elements.' ) // do not need to translate
					.removeClass( 'hidden' );
			}
			if ( e.type === 'input' && ! self.$container.hasClass( 'live_search' ) ) {
				return;
			}
			let value = self.$input.val();
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

			$firstList.trigger( 'usListSearch', [ urlParam, value ] );
		}

	} );

	$.fn.usListSearch = function() {
		return this.each( function() {
			$( this ).data( 'usListSearch', new usListSearch( this ) );
		} );
	};

	$( () => {
		$( '.w-search.for_list' ).usListSearch();
	} );

}( jQuery );
