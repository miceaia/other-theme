/**
 * UpSolution Element: Add to Favorites
 */
! function( $, _undefined ) {
	"use strict";

	window.$us = window.$us || {};

	/**
	 * @class AddToFavorites
	 * @param {String|Node} container
	 */
	function AddToFavorites( container ) {
		const self = this;

		self.$wrapperFavs = $( container );
		self.$btnFavs = $( '.w-btn.us_add_to_favs', container );
		self.$tooltipNotLoggedIn = $( '.us-add-to-favs-tooltip.not-logged-in', container );
		self.$tooltipAfterAdding = $( '.us-add-to-favs-tooltip.message-after-adding', container );
		self.$btnFavsLabel = $( '.w-btn-label', self.$btnFavs );

		self.xhr = _undefined;
		self.data = {
			post_ID: 0,
			labelAfterAdding: '',
			labelBeforeAdding: '',
		};
		if ( self.$btnFavs.is( '[onclick]' ) ) {
			$.extend( self.data, self.$btnFavs[0].onclick() || {} );
		}

		// Delete data everywhere except for the preview of the usbuilder,
		// the data may be needed again to restore the elements.
		if ( ! $us.usbPreview() ) {
			self.$btnFavs.removeAttr( 'onclick' );
		}

		self._events = {
			toggleFavorites: self._toggleFavorites.bind( self ),
		};

		self.$btnFavs.on( 'click', self._events.toggleFavorites);

		self.setButtonState( self.getPostIDs().includes( self.data.post_ID ) );
	};

	// Add to Favorites API
	$.extend( AddToFavorites.prototype, {

		getPostIDs: function() {
			return $ush.toString( $us.userFavoritePostIds )
				.split( ',' )
				.map( $ush.parseInt )
				.filter( ( v ) => { return v } );
		},

		setButtonState: function( isAdded ) {
			let self = this;
			self.$btnFavs
				.removeAttr( 'disabled' )
				.removeClass( 'loading' );
			if ( isAdded ) {
				self.$btnFavs.addClass( 'added' );
				if ( self.$btnFavsLabel.length ) {
					self.$btnFavsLabel.text( self.data.labelAfterAdding );
				}
			} else {
				self.$btnFavs.removeClass( 'added' );
				if ( self.$btnFavsLabel.length ) {
					self.$btnFavsLabel.text( self.data.labelBeforeAdding );
				}
			}
		},

		_toggleFavorites: function( e ) {
			const self = this;

			e.preventDefault();
			e.stopPropagation();

			const notLoggedIn = self.data.userLoggedIn === false;
			const isAdded = ! self.$btnFavs.hasClass( 'added' );

			if ( notLoggedIn && ! self.data.allowGuests ) {
				self.toggleTooltip( self.$tooltipNotLoggedIn );
				return;
			}

			// For Favorites Counter element
			$us.$document.trigger( 'usToggleFavorites', isAdded );


			let postIDs = self.getPostIDs(),
				index = postIDs.indexOf( self.data.post_ID );
			if ( index > -1 ) {
				postIDs.splice( index, 1 );
			} else {
				postIDs.push( self.data.post_ID );
			}
			$us.userFavoritePostIds = postIDs.join( ',' );

			if ( notLoggedIn && self.data.allowGuests ) {
				$ush.setCookie( 'us_favorite_post_ids', postIDs.join( ',' ), 365 );
			}

			self.setButtonState( isAdded );
			self.toggleAriaLabel( isAdded );

			if ( self.$btnFavs.hasClass( 'added' ) && self.$tooltipAfterAdding.length ) {
				self.toggleTooltip( self.$tooltipAfterAdding );
			} else {
				self.$tooltipAfterAdding.removeClass( 'show' );
			}

			if ( ! $ush.isUndefined( self.xhr ) ) {
				self.xhr.abort();
			}
			self.xhr = $.ajax( {
				url: $us.ajaxUrl,
				type: 'POST',
				data: {
					action: 'us_add_post_to_favorites',
					post_id: self.data.post_ID,
				}
			} );
		},

		toggleTooltip: function( tooltip ) {
			const removeTooltip = () => {
				$us.$window.off( 'click', removeTooltip );
				if ( tooltip.hasClass( 'show' ) ) {
					tooltip.removeClass( 'show' );
				}
			};

			tooltip.addClass( 'show' );

			$ush.timeout( () => {
				$us.$window.on( 'click', removeTooltip );
			}, 1 );
		},

		toggleAriaLabel: function( isAdded ) {
			const self = this;
			if ( ! self.$btnFavs.hasClass( 'text_none' ) ) {
				return;
			}
			if ( isAdded ) {
				self.$btnFavs.attr( 'aria-label', self.data.labelAfterAdding );
			} else {
				self.$btnFavs.attr( 'aria-label', self.data.labelBeforeAdding );
			}
		}
	} );

	$.fn.usAddToFavorites = function() {
		return this.each( function() {
			$( this ).data( 'usAddToFavorites', new AddToFavorites( this ) );
		} );
	};

	/**
	 * @class FavoritesCounter
	 * @param {String|Node} container
	 */
	function FavoritesCounter( container ) {
		const self = this;

		self.$wrapperFavsCounter = $( container );
		self.$favsCounter = $( '.w-favs-counter-quantity', self.$wrapperFavsCounter );
		self.$favsCounterQuantity = self.$favsCounter.text() * 1;

		$us.$document.on( 'usToggleFavorites', self._changeCount.bind( self ) );
	}

	$.extend( FavoritesCounter.prototype, {

		_changeCount: function( _, isAdded ) {
			const self = this;

			if ( isAdded ) {
				self.$favsCounterQuantity++;
				self.$favsCounter.text( self.$favsCounterQuantity );
			} else {
				self.$favsCounterQuantity--;
				self.$favsCounter.text( self.$favsCounterQuantity );
			}

			if ( self.$favsCounterQuantity < 1 ) {
				self.$wrapperFavsCounter.addClass( 'empty' );
			} else {
				self.$wrapperFavsCounter.removeClass( 'empty' );
			}
		},
	} );

	$.fn.usFavoritesCounter = new FavoritesCounter( '.w-favs-counter' );

	$( () => {
		$( '.w-btn-wrapper.for_add_to_favs' ).usAddToFavorites();
	} );

	// Init in Post\Product List or Grid context
	$us.$document.on( 'usPostList.itemsLoaded usGrid.itemsLoaded', ( _, $items ) => {
		$( '.w-btn-wrapper.for_add_to_favs', $items ).usAddToFavorites();
	} );

}( jQuery );
