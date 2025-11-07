/**
 * UpSolution Element: Grid Filter
 */
! function( $, _undefined ) {
	"use strict";

	const _document = document;

	// Math API
	const abs = Math.abs;

	/**
	 * @class usGridFilter
	 * @param {String} container The container
	 * @param {{}} options The options
	 */
	function usGridFilter( container, options ) {
		const self = this;

		// Related params for get data, number of records for taxonomy, price range for WooCommerce, etc.
		self.filtersArgs = {};

		// The default options
		self.options = {
			filterPrefix: 'filter', // default prefix
			gridNotFoundMessage: false,
			gridPaginationSelector: '.w-grid-pagination',
			gridSelector: '.w-grid[data-filterable="true"]:first',
			layout: 'hor',
			mobileWidth: 600,
			use_grid: 'first' // default
		};

		// Elements
		self.$container = $( container );
		self.$filtersItem = $( '.w-filter-item', container );

		// Load json data
		if ( self.$container.is( '[onclick]' ) ) {
			$.extend( self.options, self.$container[0].onclick() || {} );
			// Delete data everywhere except for the preview of the Live Builder, the data may be needed again to restore the elements
			if ( ! $us.usbPreview() ) {
				self.$container.removeAttr( 'onclick' );
			}
		}

		// Connect use grid if it is set in options
		if ( self.options.use_grid !== 'first' ) {
			const $use_grid = $( self.options.use_grid );
			if ( $use_grid.length && $use_grid.hasClass( 'w-grid' ) ) {
				self.$grid = $use_grid;
			}
		}

		// Finds the filter Grid
		if ( $ush.isUndefined( self.$grid ) ) {
			self.$grid = $( '.l-main ' + self.options.gridSelector, $us.$canvas );
		}

		// Load filters args
		var $filtersArgs = $( '.w-filter-json-filters-args:first', self.$container );
		if ( $filtersArgs.length ) {
			self.filtersArgs = $filtersArgs[0].onclick() || {};
			$filtersArgs.remove();
		}

		// Show the message when suitable Grid is not found
		if ( ! self.$grid.length && self.options.gridNotFoundMessage ) {
			self.$container.prepend( '<div class="w-filter-message">' + self.options.gridNotFoundMessage + '</div>' );
		}

		/**
		 * @var {{}} Bondable events.
		 */
		self._events = {
			changeFilter: self.changeFilter.bind( self ),
			closeMobileFilters: self._closeMobileFilters.bind( self ),
			openMobileFilters: self._openMobileFilters.bind( self ),
			hideItemDropdown: self._hideItemDropdown.bind( self ),
			loadPageNumber: self._loadPageNumber.bind( self ),
			resetItemValues: self._resetItemValues.bind( self ),
			resize: self._resize.bind( self ),
			toggleItemSection: self._toggleItemSection.bind( self ),
			showItemDropdown: self._showItemDropdown.bind( self ),
			changeItemAtts: self._changeItemAtts.bind( self ),
			updateItemsAmount: self._updateItemsAmount.bind( self ),
			woocommerceOrdering: self._woocommerceOrdering.bind( self ),
			navUsingKeyPress: self.navUsingKeyPress.bind( self ),
		};

		// Set class to define the grid is used by Grid Filter
		self.$grid.addClass( 'used_by_grid_filter' );

		// Events
		self.$container
			.on( 'click', '.w-filter-opener', self._events.openMobileFilters )
			.on( 'click', '.w-filter-list-closer, .w-filter-list-panel > .w-btn', self._events.closeMobileFilters );

		// Item events
		self.$filtersItem
			.on( 'change', 'input, select', self._events.changeFilter ) // exclude [type="number"] these types for range
			.on( 'click', '.w-filter-item-reset', self._events.resetItemValues );

		// Pagination
		$( self.options.gridPaginationSelector, self.$grid )
			.on( 'click', '.page-numbers', self._events.loadPageNumber );
		$us.$window.on( 'resize load', $ush.debounce( self._events.resize, 10 ) );

		// Built-in private event system
		self.on( 'changeItemAtts', self._events.changeItemAtts );

		// Show or Hide filter item
		if ( self.$container.hasClass( 'drop_on_click' ) ) {
			self.$filtersItem.on( 'click', '.w-filter-item-title', self._events.showItemDropdown );
			$( _document ).on( 'mouseup', self._events.hideItemDropdown );
		}

		$us.$document.on( 'keydown', self._events.navUsingKeyPress );

		// Add filter options to Woocommerce ordering
		$( 'form.woocommerce-ordering', $us.$canvas )
			.off( 'change', 'select.orderby' )
			.on( 'change', 'select.orderby', self._events.woocommerceOrdering );

		// Range Slider
		$( '.ui-slider', self.$container ).each( function( _, node ) {
			var $node = $( node ),
				$parent = $node.parent(),
				valueFormat = function( value ) {
					value = $ush.toString( value );
					if ( options.priceFormat ) {
						var priceFormat = $ush.toPlainObject( options.priceFormat ),
							decimals = $ush.parseInt( abs( priceFormat.decimals ) );
						if ( decimals ) {
							value = $ush.toString( $ush.parseFloat( value ).toFixed( decimals ) )
								.replace( /^(\d+)(\.)(\d+)$/, '$1' + priceFormat.decimal_separator + '$3' );
						}
						value = value.replace( /\B(?=(\d{3})+(?!\d))/g, priceFormat.thousand_separator );
					}
					return $ush.toString( options.unitFormat ).replace( '%d', value );
				},
				showRangeResult = function( e, ui ) {
					$( '.for_min_value', $parent ).html( valueFormat( ui.values[ 0 ] ) );
					$( '.for_max_value', $parent ).html( valueFormat( ui.values[ 1 ] ) );
				};
			var options = $.extend( /* deep */true, {
				// https://api.jqueryui.com/slider/#options
				slider: {
					animate: true,
					max: 100,
					min: 0,
					range: true,
					step: 1,
					values: [ 0, 100 ],
				},
				unitFormat: '%d', // example: $0 000.00
				priceFormat: null, // example: 0 000.00
			}, node.onclick() || {} );
			$node
				.data( 'defautlValues', [ options.slider.min, options.slider.max ].join( '-' ) )
				.removeAttr( 'onclick' )
				.slider( $.extend( options.slider, {
					slide: showRangeResult,
					change: $ush.debounce( function( e, ui ) {
						showRangeResult( e, ui );
						$( 'input[type=hidden]', $parent )
							.val( ui.values.join( '-' ) )
							.trigger( 'change' );
					} ),
				} ) );
		} );

		// Change item values
		self.checkItemValues();

		// If there are selected params then add the class `active` to main container
		self.$container.toggleClass( 'active', self.$filtersItem.hasClass( 'has_value' ) );

		// Subscription to receive data on recounts of amounts
		self.on( 'us_grid_filter.update-items-amount', self._events.updateItemsAmount );

		// Set state to fix mobile Safari issue
		self._events.resize();

		if ( self.$container.hasClass( 'togglable' ) ) {
			self.$filtersItem.on( 'click', '.w-filter-item-title', self._events.toggleItemSection );
		}

		self.setupTabindex();
	};

	// Export API
	$.extend( usGridFilter.prototype, $us.mixins.Events, {

		/**
		 * Determines if mobile.
		 *
		 * @return {Boolean} True if mobile, False otherwise.
		 */
		isMobile: function() {
			return $ush.parseInt( $us.$window.width() ) <= $ush.parseInt( this.options.mobileWidth );
		},

		/**
		 * Change values.
		 *
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM.
		 */
		changeFilter: function( e ) {
			const self = this;
			const $target = $( e.target );
			const $item = $target.closest( '.w-filter-item' );
			const type = $ush.toString( $item.usMod( 'type' ) );

			// Locked filters
			$item.removeClass( 'loading' );
			self.$filtersItem
				.not( $item )
				.addClass( 'loading' );

			if ( [ 'radio', 'checkbox' ].includes( type ) ) {
				// Reset All
				if ( type === 'radio' ) {
					$( '.w-filter-item-value', $item )
						.removeClass( 'selected' );
				}
				$target
					.closest( '.w-filter-item-value' )
					.toggleClass( 'selected', $target.is( ':checked ') );

			} else if ( type === 'range' ) {
				var $inputs = $( 'input[type!=hidden]', $item ),
					rangeValues = [];
				$inputs.each( ( i, input ) => {
					let $input = $( input ),
						value = $ush.parseInt( input.value ),
						name = $ush.toString( input.dataset['name'] );
					// If no value, check placeholders
					if ( ! value && name == [ 'min_value', 'max_value' ][ i ] && rangeValues.length == i ) {
						value = $input.attr( 'placeholder' );
					}
					rangeValues.push( $ush.parseInt( value ) );
				} );

				rangeValues = rangeValues.join( '-' );
				$( 'input[type="hidden"]', $item ).val( rangeValues !== '0-0' ? rangeValues : '' );

			} else if ( type === 'range_slider' ) {
				var $input = $( 'input[type="hidden"]', $item );
				if ( $input.val() == $ush.toString( $( '.ui-slider', $item ).data( 'defautlValues' ) ) ) {
					$input.val( '' );
				}
			}

			var value = self.getValue();
			$ush.debounce_fn_1ms( self.URLSearchParams.bind( self, value ) );

			self.triggerGrid( 'us_grid.updateState', [ value, /*page*/1, self ] );

			// Change item values
			self.trigger( 'changeItemAtts', $item );

			// If there are selected params then add the class `active` to the main container
			self.$container.toggleClass( 'active', self.$filtersItem.hasClass( 'has_value' ) );
		},

		/**
		 * Load a grid page via AJAX.
		 *
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM.
		 */
		_loadPageNumber: function ( e ) {
			e.preventDefault();
			e.stopPropagation();
			var self = this,
				$target = $( e.currentTarget ),
				href = $ush.toString( $target.attr( 'href' ) ),
				page = $ush.parseInt( ( href.match( /page(=|\/)(\d+)(\/?)/ ) || [] )[2] || /* default first page */1 );

			history.replaceState( _document.title, _document.title, href );
			self.triggerGrid( 'us_grid.updateState', [ self.getValue(), page, self ] );
		},

		/**
		 * Reset item selected.
		 *
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM.
		 */
		_resetItemValues: function( e ) {
			e.preventDefault();
			e.stopPropagation();

			var self = this,
				$item = $( e.currentTarget ).closest( '.w-filter-item' ),
				type = $ush.toString( $item.usMod( 'type' ) );

			if ( ! type ) {
				return;
			}

			// Reset checkboxes and radio buttons.
			if ( [ 'checkbox', 'radio' ].indexOf( type ) > -1 ) {
				$( 'input:checked', $item ).prop( 'checked', false );
				$( 'input[value="*"]:first', $item ).each( function( _, input ) {
					$( input )
						.prop( 'checked', true )
						.closest( '.w-filter-item' )
						.addClass( 'selected' );
				} );
			}
			// Reset range values
			if ( type === 'range' ) {
				$( 'input', $item ).val( '' );
			}
			// Reset select option
			if ( type === 'dropdown' ) {
				$( 'option', $item ).prop( 'selected', false );
			}
			// Reset slider
			if ( type === 'range_slider' ) {
				var $uiSlider = $( '.ui-slider', $item );
				$uiSlider.slider( 'values', $ush.toString( $uiSlider.data( 'defautlValues' ) ).split( '-' ) );
			}

			$( '.w-filter-item-value', $item ).removeClass( 'selected' );

			// Change item values
			self.trigger( 'changeItemAtts', $item );

			// If there are selected params then add the class `active` to the main container
			self.$container.toggleClass( 'active', self.$filtersItem.hasClass( 'has_value' ) );

			// Update URL
			var value = self.getValue();
			$ush.debounce_fn_1ms( self.URLSearchParams.bind( self, value ) );
			self.URLSearchParams( value );
			self.triggerGrid( 'us_grid.updateState', [ value, /*page*/1, self ] );
		},

		/**
		 * Change item class and title for visual indication
		 *
		 * @event handler
		 * @param {{}} _ self
		 * @param {*} item
		 */
		_changeItemAtts: function( _, item ) {
			var self = this,
				$item = $( item ),
				title = '',
				hasValue = false,
				type = $ush.toString( $item.usMod( 'type' ) ),
				$selected = $( 'input:not([value="*"]):checked', $item );

			if ( ! type ) {
				return;
			}
			// Get title from radio buttons and checkboxes
			if ( [ 'checkbox', 'radio' ].indexOf( type ) > -1 ) {
				hasValue = $selected.length;

				// For a horizontal filter, if there are selected params, display either the selected parameter or quantity
				if ( self.options.layout == 'hor' ) {
					var title = '';
					if ( $selected.length === 1 ) {
						title += $selected.nextAll( '.w-filter-item-value-label:first' ).text();
					} else if( $selected.length > 1 ) {
						title += $selected.length;
					}
				}
			}

			if ( type === 'dropdown' ) {
				var value = $( 'select:first', $item ).val();
				hasValue = ( value !== '*' )
					? value
					: '';
			}
			// Get title from range inputs
			if ( type === 'range' ) {
				var value = $( 'input[type="hidden"]:first', $item ).val();
				hasValue = value;
				if ( self.options.layout == 'hor' && value ) {
					title += value;
				}
			}
			if ( type === 'range_slider' ) {
				var value = $( 'input[type="hidden"]:first', $item ).val();
				hasValue = value && value != $ush.toString( $( '.ui-slider', $item ).data( 'defautlValues' ) );
			}

			// Add of `has_value` class when selecting options
			$item.toggleClass( 'has_value', !! hasValue );

			// Add open class when selecting options
			if (
				self.$container.hasClass( 'togglable' )
				&& hasValue
			) {
				$item.addClass( 'expand' );
			}

			// Set title
			$( '> .w-filter-item-title > span:not(.w-filter-item-reset)', item ).html( title );
		},

		/**
		 * Changes when resizing the screen.
		 *
		 * @event handler
		 */
		_resize: function() {
			var self = this;
			self.$container.usMod( 'state', self.isMobile() ? 'mobile' : 'desktop' );
			if ( ! self.isMobile() ) {
				$us.$body.removeClass( 'us_filter_open' );
				self.$container.removeClass( /*filter opener*/'open_for_mobile' );
			}
		},

		/**
		 * Open Mobile Filter.
		 *
		 * @event handler
		 */
		_openMobileFilters: function() {
			$us.$body.addClass( 'us_filter_open' );
			this.$container.addClass( 'open_for_mobile' );
		},

		/**
		 * Close Mobile Filter.
		 *
		 * @event handler
		 */
		_closeMobileFilters: function() {
			$us.$body.removeClass( 'us_filter_open' );
			this.$container.removeClass( 'open_for_mobile' );
		},

		/**
		 * Show vertical items.
		 *
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM.
		 */
		_showItemDropdown: function( e ) {
			// Close all other items (extra check for accessibility browsing)
			this._hideItemDropdown( e );
			// Show current item
			$( e.currentTarget )
				.closest( '.w-filter-item' )
				.addClass( 'expand' );
		},

		/**
		 * Hide vertical items when click outside the item.
		 *
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM.
		 */
		_hideItemDropdown: function( e ) {
			var self = this;
			if ( self.$filtersItem.hasClass( 'expand' ) ) {
				self.$filtersItem.filter( '.expand' ).each( function( _, node ) {
					var $node = $( node );
					if ( ! $node.is( e.target ) && $node.has( e.target ).length === 0 ) {
						$node.removeClass( 'expand' );
					}
				} );
			}
		},

		/**
		 * Show or hide accordion item on click .w-filter-item-title.
		 *
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM.
		 */
		_toggleItemSection: function( e ) {
			$( e.currentTarget )
				.closest( '.w-filter-item' )
				.toggleClass( 'expand' );
		},

		/**
		 * Add grid filter options to sort request.
		 *
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM.
		 */
		_woocommerceOrdering: function( e ) {
			e.stopPropagation();

			var self = this,
				$form = $( e.currentTarget ).closest( 'form' );
			$( 'input[name^="'+ self.options.filterPrefix +'"]', $form )
				.remove();
			$.each( self.getValue().split( '&' ), function( _, value ) {
				value = value.split( '=' );
				if ( value.length === 2 ) {
					$form.append( '<input type="hidden" name="'+ value[0] +'" value="'+ value[1] +'"/>' );
				}
			} );
			$form.trigger( 'submit' );
		},

		/**
		 * Update amount items.
		 *
		 * @event handler
		 * @param {usGridFilter} _
		 * @param {{}} data
		 */
		_updateItemsAmount: function( _, data ) {
			const self = this;

			// Taxonomy updates
			$.each( ( data.taxonomies_query_args || {} ), function( key, items ) {
				var $item = self.$filtersItem.filter( '[data-source="'+ key +'"]' ),
					type = $ush.toString( $item.usMod( 'type' ) ),
					numActiveValues = 0;
				$.each( items, function( value, amount ) {
					var disabled = ! amount;
					if ( ! disabled ) {
						numActiveValues++;
					}
					// For dropdowns
					if ( type === 'dropdown' ) {
						var $option = $( 'select:first option[value="'+ value +'"]', $item ),
							template = $option.data( 'template' ) || '';
						// Apply option template
						if ( template ) {
							template = template
								.replace( '%s', ( amount ? '(' + amount + ')' : '' ) );
							$option.text( template );
						}
						$option
							.prop( 'disabled', disabled )
							.toggleClass( 'disabled', disabled );

						// For inputs
					} else {
						var $input = $( 'input[value="'+ value +'"]', $item );

						$input
							.prop( 'disabled', disabled )
							.nextAll( '.w-filter-item-value-amount' )
							.text( amount );
						$input
							.closest( '.w-filter-item-value' )
							.toggleClass( 'disabled', disabled );

						// Disable option if there are no entries for it
						if ( disabled && $input.is( ':checked' ) ) {
							$input.prop( 'checked', false );
						}
					}
				} );

				$item.removeClass( 'loading' );
				$item.toggleClass( 'disabled', numActiveValues < 1 );
			} );

			// Prices range update
			if (
				data.hasOwnProperty( 'wc_min_max_price' )
				&& data.wc_min_max_price instanceof Object
			) {
				const $price = self.$filtersItem.filter( '[data-source$="|_price"]' );
				$.each( ( data.wc_min_max_price || {} ), function( name, value ) {
					var $input = $( 'input.type_' + name, $price );
					$input.attr( 'placeholder', value ? value : $input.attr( 'aria-label' ) );
				} );
				$price.removeClass( 'loading' );
			}

			// Update URL
			if ( ! $.isEmptyObject( data ) ) {
				if ( self.handle ) {
					$ush.clearTimeout( self.handle );
				}
				self.handle = $ush.timeout( function() {
					$ush.debounce_fn_1ms( self.URLSearchParams.bind( self, self.getValue() ) );
					self.checkItemValues();
				}, 100 );
			}

			self.setupTabindex();
		},

		/**
		 * Raises a private event in the grid.
		 *
		 * @param {String} eventType
		 * @param {*} extraParams
		 */
		triggerGrid: function ( eventType, extraParams ) {
			$ush.debounce_fn_10ms( function() { $us.$body.trigger( eventType, extraParams ); } );
		},

		/**
		 * Check item values.
		 */
		checkItemValues: function() {
			var self = this;
			self.$filtersItem.each( function( _, node ) {
				self.trigger( 'changeItemAtts', node );
			} );
		},

		/**
		 * Get the value.
		 *
		 * @return {String}
		 */
		getValue: function() {
			var value = '',
				filters = {};
			$.each( this.$container.serializeArray(), function( _, filter ) {
				if ( filter.value === /* all */'*' || ! filter.value ) {
					return;
				}
				if ( ! filters.hasOwnProperty( filter.name ) ) {
					filters[ filter.name ] = [];
				}
				filters[ filter.name ].push( filter.value );
			} );
			// Convert params in a string
			for ( var k in filters ) {
				if ( value ) {
					value += '&';
				}
				if ( Array.isArray( filters[ k ] ) ) {
					value += k + '=' + filters[ k ].join( ',' );
				}
			}

			return encodeURI( value );
		},

		/**
		 * Set search queries in the url.
		 *
		 * @param {String} params The url params.
		 */
		URLSearchParams: function( params ) {
			var url = location.origin + location.pathname + ( location.pathname.slice( -1 ) != '/' ? '/' : '' ),
				// Get current search and remove filter params
				search = location.search.replace( new RegExp( this.options.filterPrefix + "(.+?)(&|$)", "g" ), '' );
			if ( ! search || search.substr( 0, 1 ) !== '?' ) {
				search += '?';
			} else if ( '?&'.indexOf( search.slice( -1 ) ) === -1 ) {
				search += '&';
			}
			// Remove last ?&
			if ( ! params && '?&'.indexOf( search.slice( -1 ) ) !== -1 ) {
				search = search.slice( 0, -1 );
			}
			history.replaceState( _document.title, _document.title, url + search + params );
		},

		/**
		 * Navigation using key press.
		 *
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM.
		 */
		navUsingKeyPress: function( e ) {
			const self = this;
			const keyCode = e.keyCode;

			if ( keyCode == $ush.ESC_KEYCODE ) {
				self._hideItemDropdown( {} );
			}

			if (
				keyCode === $ush.ENTER_KEYCODE
				&& $.contains( self.$container[0], e.target )
			) {
				const $target = $( e.target );
				if ( $target.hasClass( 'w-filter-item-value' ) ) {
					$( 'input[type=radio], input[type=checkbox]', $target ).trigger( 'click' );
				}
			}
		},

		/**
		 * Setup tabindex for horizontal layout and switch style
		 */
		setupTabindex: function() {
			const self = this;
			if ( self.options.layout === 'hor' && /\sstyle_switch_/.test( self.$container[0].className ) ) {
				self.$filtersItem.each( ( _, filter ) => {
					if ( filter.classList.contains( 'type_radio' ) || filter.classList.contains( 'type_checkbox' ) ) {
						$( '.w-filter-item-value', filter ).each( ( _,  itemValue ) => {
							const $itemValue = $( itemValue );
							if ( $itemValue.hasClass( 'disabled' ) ) {
								$itemValue.removeAttr( 'tabindex' );
							} else {
								$itemValue.attr( 'tabindex', 0 );
							}
						} );
					}
				} );
			}
		}

	} );

	$.fn.usGridFilter = function ( options ) {
		return this.each( function () {
			$( this ).data( 'usGridFilter', new usGridFilter( this, options ) );
		} );
	};

	$( () => $( '.w-filter.for_grid', $us.$canvas ).usGridFilter() );

}( jQuery );
