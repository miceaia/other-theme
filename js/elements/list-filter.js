/**
 * UpSolution Element: List Filter
 */
! function( $, _undefined ) {
	"use strict";

	const abs = Math.abs;
	const max = Math.max;
	const min = Math.min;
	const urlManager = $ush.urlManager();
	const PREFIX_FOR_URL_PARAM = '_';
	const FACETED_PARAM = '_f';
	const RANGE_VALUES_BY_DEFAULT = [ 0, 1000 ];
	const DELETE_FILTER = null;

	var hasFacetedFilters;

	/**
	 * @param {String} values The values.
	 * @return {[]} Returns an array of range values.
	 */
	function parseValues( values ) {
		values = $ush.toString( values );
		if ( ! values || ! values.includes( '-' ) ) {
			return RANGE_VALUES_BY_DEFAULT;
		}
		return values.split( '-' ).map( $ush.parseFloat );
	}

	/**
	 * @param {Node|String} container.
	 */
	function usListFilter( container ) {
		const self = this;

		// Bondable events
		self._events = {
			applyFilterToList: $ush.debounce( self.applyFilterToList.bind( self ), 1 ),
			checkScreenStates: $ush.debounce( self.checkScreenStates.bind( self ), 10 ),
			closeMobileVersion: self.closeMobileVersion.bind( self ),
			getItemValues: $ush.debounce( self.getItemValues.bind( self ), 0 ),
			hideItemDropdown: self.hideItemDropdown.bind( self ),
			openMobileVersion: self.openMobileVersion.bind( self ),
			resetItemValues: self.resetItemValues.bind( self ),
			searchItemValues: self.searchItemValues.bind( self ),
			toggleItemSection: self.toggleItemSection.bind( self ),
			navUsingKeyPress: $ush.debounce( self.navUsingKeyPress.bind( self ), 0 ),
		};

		// Elements
		self.$container = $( container );
		self.$pageContent = $( 'main#page-content' );

		if ( ! self.isVisible() ) {
			return;
		}

		self.$titles = $( '.w-filter-item-title', self.$container );
		self.$listCloser = $( '.w-filter-list-closer', self.$container );
		self.$opener = $( '.w-filter-opener', self.$container );

		// Private "Variables"
		self.data = {
			mobileWidth: 600,
			listSelectorToFilter: null,
			ajaxData: {},
		};
		self.filters = {};
		self.result = {};
		self.lastResult; // default value _undefined
		self.xhr; // XMLHttpRequests instance
		self.isFacetedFiltering = self.$container.hasClass( 'faceted_filtering' );
		self.hidePostCount = self.$container.hasClass( 'hide_post_count' );

		// Get element settings
		if ( self.$container.is( '[onclick]' ) ) {
			$.extend( self.data, self.$container[0].onclick() || {} );
		}

		// Init DatePicker https://api.jqueryui.com/datepicker
		$( '.type_date_picker', self.$container ).each( ( _, filter ) => {
			var $start = $( 'input:eq(0)', filter ),
				$end = $( 'input:eq(1)', filter ),
				$startContainer = $start.parent(),
				$endContainer = $start.parent(),
				startOptions = {},
				endOptions = {};

			if ( $startContainer.is( '[onclick]' ) ) {
				startOptions = $startContainer[0].onclick() || {};
			}
			if ( $endContainer.is( '[onclick]' ) ) {
				endOptions = $endContainer[0].onclick() || {};
			}

			$start.datepicker( $.extend( true, {
				isRTL: $ush.isRtl(),
				dateFormat: $start.data( 'date-format' ),
				beforeShow: ( _, inst ) => {
					inst.dpDiv.addClass( 'for_list_filter' );
				},
				onSelect: () => {
					$start.trigger( 'change' );
				},
				onClose: ( _, inst ) => {
					$end.datepicker( 'option', 'minDate', inst.input.datepicker( 'getDate' ) || null );
				},
			}, startOptions ) );

			$end.datepicker( $.extend( true, {
				isRTL: $ush.isRtl(),
				dateFormat: $end.data( 'date-format' ),
				beforeShow: ( _, inst ) => {
					inst.dpDiv.addClass( 'for_list_filter' );
				},
				onSelect: () => {
					$start.trigger( 'change' );
				},
				onClose: ( _, inst ) => {
					$start.datepicker( 'option', 'maxDate', inst.input.datepicker( 'getDate' ) || null );
				},
			}, endOptions ) );
		} );

		// Init Range Slider https://api.jqueryui.com/slider
		$( '.type_range_slider', self.$container ).each( ( _, filter ) => {
			function showFormattedResult( _, ui ) {
				$( '.for_min_value, .for_max_value', filter ).each( ( i, node ) => {
					$( node ).html( self.numberFormat( ui.values[ i ], opts ) );
				} );
			}
			const $slider = $( '.ui-slider', filter );
			var opts = {
				slider: {
					animate: true,
					min: RANGE_VALUES_BY_DEFAULT[0],
					max: RANGE_VALUES_BY_DEFAULT[1],
					range: true,
					step: 10,
					values: RANGE_VALUES_BY_DEFAULT,
					slide: showFormattedResult,
					change: showFormattedResult,
					stop: $ush.debounce( ( _, ui ) => {
						$( 'input[type=hidden]', filter )
							.val( ui.values.join( '-' ) )
							.trigger( 'change' );
					} ),
				},
				unitFormat: '%d', // example: $0 000.00
				numberFormat: null, // example: 0 000.00
			};
			if ( $slider.is( '[onclick]' ) ) {
				opts = $.extend( true, opts, $slider[0].onclick() || {} );
			}
			$slider.removeAttr( 'onclick' )
				.slider( opts.slider )
				.fixSlider();

			$( filter ).data( 'opts', opts );
		} );

		// Setup the UI
		if ( self.changeURLParams() ) {
			$( '[data-name]', self.$container ).each( ( _, filter ) => {

				const $filter = $( filter );
				const compare = $ush.toString( $filter.data( 'value-compare' ) );

				var name = $filter.data( 'name' );

				if ( compare ) {
					name += `|${compare}`;
				}
				self.filters[ name ] = $filter;
			} );
			self.setupFields();
			urlManager.on( 'popstate', () => {
				self.setupFields();
				self.applyFilterToList();
			} );
		}

		// Faceted Filtering
		if ( self.isFacetedFiltering && ! hasFacetedFilters ) {

			hasFacetedFilters = true;

			self._events.itemsLoaded = ( _, $items, applyFilter ) => {
				if ( applyFilter && self.isVisible() ) {
					self.setPostCount( self.firstListData().facetedFilter.post_count );
				}
			};
			$us.$document.on( 'usPostList.itemsLoaded', self._events.itemsLoaded );

			var listFilters = {};
			$.each( self.filters, ( name, $filter ) => {
				listFilters[ name ] = $ush.toString( $filter.usMod( 'type' ) );
			} );
			listFilters = JSON.stringify( listFilters );

			self.listToFilter().trigger( 'usListFilter', { list_filters: listFilters } );

			self.$container.addClass( 'loading' );

			const data = $.extend( true,
				{
					list_filters: listFilters,
					_s: urlManager.get( '_s' ), // value from List Search
 				},
				self.firstListData().facetedFilter,
				self.result,
				self.data.ajaxData
			);

			data[ FACETED_PARAM ] = 1;

			self.xhr = $.ajax( {
				type: 'post',
				url: $us.ajaxUrl,
				dataType: 'json',
				cache: false,
				data: data,
				success: ( res ) => {
					if ( ! res.success ) {
						console.error( res.data.message );
					}
					self.setPostCount( res.success ? res.data : {} );
				},
				complete: () => {
					self.$container.removeClass( 'loading' );
				}
			} );
		}

		// Remove "f" param from URL
		else if ( ! self.isFacetedFiltering && urlManager.has( FACETED_PARAM, '1' ) ) {
			urlManager.remove( FACETED_PARAM ).push();
		}

		// Events
		$( '.w-filter-item', self.$container )
			.on( 'change', 'input:not([name=search_values]), select', self._events.getItemValues )
			.on( 'input change', 'input[name=search_values]', self._events.searchItemValues )
			.on( 'click', '.w-filter-item-reset', self._events.resetItemValues )
			.on( 'click', '.w-filter-item-title', self._events.toggleItemSection );
		self.$container
			.on( 'mouseup', '.w-filter-opener', self._events.openMobileVersion )
			.on( 'mouseup', '.w-filter-list-closer, .w-filter-button-submit', self._events.closeMobileVersion )
			.on( 'keydown', self._events.navUsingKeyPress );

		$us.$window.on( 'resize', self._events.checkScreenStates );

		// Hide dropdowns of all items on click outside any item title
		if ( self.titlesAsDropdowns() ) {
			$us.$document.on( 'click', self._events.hideItemDropdown );
		}

		self.on( 'applyFilterToList', self._events.applyFilterToList );

		self.checkScreenStates();
		self.сheckActiveFilters();
	}

	// List Filter API
	$.extend( usListFilter.prototype, $ush.mixinEvents, {

		/**
		 * Titles as toggles.
		 *
		 * @return {Boolean}
		 */
		titlesAsToggles: function() {
			return this.$container.hasClass( 'mod_toggle' );
		},

		/**
		 * Titles as dropdowns.
		 *
		 * @return {Boolean}
		 */
		titlesAsDropdowns: function() {
			return this.$container.hasClass( 'mod_dropdown' );
		},

		/**
		 * Enabled URL.
		 *
		 * @return {Boolean} True if enabled url, False otherwise.
		 */
		changeURLParams: function() {
			return this.$container.hasClass( 'change_url_params' );
		},

		/**
		 * Determines if visible.
		 *
		 * @return {Boolean} True if visible, False otherwise.
		 */
		isVisible: function() {
			return this.$container.is( ':visible' );
		},

		/**
		 * Setup fields.
		 */
		setupFields: function() {
			const self = this;
			$.each( self.filters, ( name, $filter ) => {
				self.resetFields( $filter );

				name = PREFIX_FOR_URL_PARAM + name;
				if ( ! urlManager.has( name ) ) {
					delete self.result[ name ];
					return;
				}

				var values = $ush.toString( urlManager.get( name ) );
				values.split( ',' ).map( ( value, i ) => {
					if ( $filter.hasClass( 'type_dropdown' ) ) {
						$( `select`, $filter ).val( value );

					} else if ( $filter.hasClass( 'type_date_picker' ) ) {
						var $input = $( `input:eq(${i})`, $filter );
						if ( $input.length && /\d{4}-\d{2}-\d{2}/.test( value ) ) {
							$input.val( $.datepicker.formatDate( $input.data( 'date-format' ), $.datepicker.parseDate( 'yy-mm-dd', value ) ) );
						}

					} else if ( $filter.hasClass( 'type_range_input' ) ) {
						if ( /([\.?\d]+)-([\.?\d]+)/.test( value ) ) {
							$( 'input', $filter ).each( ( i, input ) => { input.value = parseValues( value )[ i ] } );
						}

					} else if ( $filter.hasClass( 'type_range_slider' ) ) {
						if ( ! self.isFacetedFiltering && /([\.?\d]+)-([\.?\d]+)/.test( value ) ) {
							$( '.ui-slider', $filter ).slider( 'values', parseValues( value ) );
							$( `input[type=hidden]`, $filter ).val( value );
						}

						// For type_checkbox and type_radio
					} else {
						$( `input[value="${value}"]`, $filter ).prop( 'checked', true );
					}
				} );

				self.result[ name ] = values;

				$filter
					.addClass( 'has_value' )
					.toggleClass( 'expand', self.titlesAsToggles() && self.$container.hasClass( 'layout_ver' ) );
			} );

			self.showSelectedValues();
		},

		/**
		 * Search field to narrow choices.
		 *
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM.
		 */
		searchItemValues: function( e ) {

			const $filter = $( e.delegateTarget );
			const $items = $( '[data-value]', $filter );
			const value = $ush.toLowerCase( e.target.value ).trim();

			$items
				.filter( ( _, node ) => { return ! $( 'input', node ).is( ':checked' ) } )
				.toggleClass( 'hidden', !! value );

			if ( $filter.hasClass( 'type_radio' ) ) {
				const $buttonAnyValue = $( '[data-value="*"]:first', $filter );
				if ( ! $( 'input', $buttonAnyValue ).is( ':checked' ) ) {
					$buttonAnyValue
						.toggleClass( 'hidden', ! $ush.toLowerCase( $buttonAnyValue.text() ).includes( value ) );
				}
			}

			if ( value ) {
				$items
					.filter( ( _, node ) => { return $ush.toLowerCase( $( node ).text() ).includes( value ) } )
					.removeClass( 'hidden' )
					.length;
			}

			$( '.w-filter-item-message', $filter ).toggleClass( 'hidden', $items.is( ':visible' ) );
		},

		/**
		 * Get result from single filter item.
		 *
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM.
		 */
		getItemValues: function( e ) {
			const self = this;

			const $filter = $( e.target ).closest( '.w-filter-item' );
			const compare = $filter.data( 'value-compare' );

			var name = PREFIX_FOR_URL_PARAM + $ush.toString( $filter.data( 'name' ) ),
				value = e.target.value,
				isExpand;

			if ( compare ) {
				name += `|${compare}`;
			}

			// TYPE: Checkboxes
			if ( $filter.hasClass( 'type_checkbox' ) ) {
				var values = [];
				$( 'input:checked', $filter ).each( ( _, input ) => {
					values.push( input.value );
				});

				if ( ! values.length ) {
					self.result[ name ] = DELETE_FILTER;
				} else {
					self.result[ name ] = values.toString();
				}

				// TYPE: Date Picker
			} else if ( $filter.hasClass( 'type_date_picker' ) ) {
				var values = [];
				$( 'input.hasDatepicker', $filter ).each( ( i, input ) => {
					values[ i ] = $.datepicker.formatDate( 'yy-mm-dd', $( input ).datepicker( 'getDate' ) );
				} );

				if ( ! values.length ) {
					self.result[ name ] = DELETE_FILTER;
				} else {
					self.result[ name ] = values.toString();
				}

				// TYPE: Range input
			} else if ( $filter.hasClass( 'type_range_input' ) ) {
				var defaultValues = [], values = [];
				$( 'input', $filter ).each( ( i, input ) => {
					defaultValues[ i ] = input.dataset.value;
					values[ i ] = input.value || defaultValues[ i ];
				} );
				if ( ! values.length || values.toString() === defaultValues.toString() ) {
					self.result[ name ] = DELETE_FILTER;
				} else {
					self.result[ name ] = values.join( '-' );
				}

				// TYPE: Radio buttons and Dropdown
			} else {
				if ( $ush.rawurldecode( value ) === '*' ) {
					self.result[ name ] = DELETE_FILTER;
				} else {
					self.result[ name ] = value;
				}
			}

			const hasValue = !! self.result[ name ];

			$filter.toggleClass( 'has_value', hasValue );

			if ( self.isFacetedFiltering ) {
				$filter.siblings().addClass( 'loading' );
			}

			self.trigger( 'applyFilterToList' );
			self.showSelectedValues();
		},

		/**
		 * Get the List for filtering by CSS selector
		 *
		 * @return {Node} Returns the node of the found Post List.
		 */
		listToFilter: function() {
			const self = this;

			var $lists;

			// Multiple lists can be used
			if ( self.data.listSelectorToFilter ) {
				$lists = $( self.data.listSelectorToFilter, self.$pageContent );

			} else {
				$lists = $( `
					.w-grid.us_post_list:visible,
					.w-grid.us_product_list:visible,
					.w-grid-none:visible
				`, self.$pageContent ).first();
			}

			if ( $lists.hasClass( 'w-grid-none' ) ) {
				$lists = $lists.prev();
			}

			return $lists;
		},

		/**
		 * Get data from first Post List.
		 *
		 * @return {{}}
		 */
		firstListData: function() {
			return $ush.toPlainObject( ( this.listToFilter().first().data( 'usPostList' ) || {} ).data );
		},

		/**
		 * Formats a number to the desired format.
		 *
		 * @param {Number|String} value
		 * @param {{}} options
		 * @return {String}
		 */
		numberFormat: function( value, options ) {
			const self = this;
			const defaultOpts = {
				unitFormat: '%d', // example: $0 000.00
				numberFormat: null, // example: 0 000.00
			};

			value = $ush.toString( value );
			options = $.extend( defaultOpts, $ush.toPlainObject( options ) );

			if ( options.numberFormat ) {
				var numberFormat = $ush.toPlainObject( options.numberFormat ),
					decimals = $ush.parseInt( abs( numberFormat.decimals ) );
				if ( decimals ) {
					value = $ush.toString( $ush.parseFloat( value ).toFixed( decimals ) )
						.replace( /^(\d+)(\.)(\d+)$/, '$1' + numberFormat.decimal_separator + '$3' );
				}
				value = value.replace( /\B(?=(\d{3})+(?!\d))/g, numberFormat.thousand_separator );
			}

			return $ush.toString( options.unitFormat ).replace( '%d', value );
		},

		/**
		 * Set the post count.
		 *
		 * @param {{}|undefined} data
		 */
		setPostCount: function( data ) {
			const self = this;
			if ( ! $.isPlainObject( data ) ) {
				data = {};
			}

			$.each( self.filters, ( filterName, filter ) => {
				const $filter = $( filter );
				const currentData = $ush.clone( data[ filterName.split( '|', 1 )[0] ] || {} );
				const isRangeType = $filter.hasClass( 'type_range_slider' ) || $filter.hasClass( 'type_range_input' );

				// For "Date Values Range" = yearly
				if ( $filter.hasClass( 'range_by_year' ) && ! isRangeType ) {
					for ( const k in currentData ) {
						const year = $ush.toString( k ).substring( 0, 4 );
						currentData[ year ] = $ush.parseInt( currentData[ year ] ) + currentData[ k ];
					}
				}

				var numActiveValues = 0;

				// TYPE: Checkboxes and Radio buttons
				if ( $filter.hasClass( 'type_checkbox' ) || $filter.hasClass( 'type_radio' ) ) {
					const compare = $filter.data( 'value-compare' );

					$( '[data-value]', filter ).each( ( _, node ) => {

						const $node = $( node );
						const value = $node.data( 'value' );

						if ( $filter.hasClass( 'type_radio' ) && value === '*' ) {
							return;
						}

						var postCount = 0;

						// For "Numeric Values Range" = num
						if ( compare == 'between' ) {
							const rangeValues = value.split( '-' ).map( $ush.parseFloat );
							$.each( data[ filterName.split('|')[0] ] || {}, ( val, count ) => {
								if ( val >= rangeValues[0] && val <= rangeValues[1] ) {
									postCount += count;
								}
							} );

						} else {
							postCount = $ush.parseInt( currentData[ value ] );
						}

						if ( postCount ) {
							numActiveValues++;
						}

						$node
							.toggleClass( 'disabled', postCount === 0 )
							.data( 'post-count', postCount )
							.find( '.w-filter-item-value-amount' )
							.text( postCount );

						// For navigation via Tab
						$( 'input', $node ).prop( 'disabled', postCount === 0 );
					} );

					// TYPE: Dropdown
				} else if ( $filter.hasClass( 'type_dropdown' ) ) {
					$( '.w-filter-item-value-select option', filter ).each( ( _, node ) => {
						const $node = $( node );
						const $formattedValue = $ush.rawurldecode( node.value )
							.replace( /\\/g, '' ) // remove backslash
							.replace( /[\u201A]/g, ',' ); // return comma instead of quotation mark '‚'
						const postCount = $ush.parseInt( currentData[ $formattedValue ] );

						if ( postCount ) {
							numActiveValues++;
						}

						if ( ! self.hidePostCount && $node.data( 'label-template' ) ) {
							$node.text( $ush.toString( $node.data( 'label-template' ) ).replace( '%d', postCount ) );
						}

						$node.prop( 'disabled', postCount === 0 )
							.toggleClass( 'disabled', postCount === 0 );

						// For navigation via Tab
						$( 'select', $node ).prop( 'disabled', postCount === 0 );
					} );

					// TYPE: Range Input/Slider
				} else if ( isRangeType ) {

					const minValue = $ush.parseFloat( currentData[0] );
					const maxValue = $ush.parseFloat( currentData[1] );
					const newValues = [ minValue, maxValue ];
					const currentValues = urlManager.get( `_${filterName}` );

					if ( minValue ) {
						numActiveValues++;
					}
					if ( maxValue ) {
						numActiveValues++;
					}

					if ( $filter.hasClass( 'type_range_slider' ) ) {

						$( '.ui-slider', $filter ).slider( 'option', {
							min: minValue,
							max: maxValue,
							values: currentValues ? parseValues( currentValues ) : newValues,
						} );

						$( `input[type=hidden]`, $filter ).val( newValues.join( '-' ) );

						// For Range Input
					} else {
						const opts = $( '.for_range_input_options', filter )[0].onclick() || {};

						$( '.for_min_value, .for_max_value', filter ).each( ( i, node ) => {
							const formattedValue = self.numberFormat( newValues[ i ], opts );
							const $node = $( node );

							$node.attr( 'placeholder', $ush.fromCharCode( formattedValue ) );
						} );
					}

					// other types
				} else {
					numActiveValues = 1;
				}

				const $focusableElements = $( 'input,select,button,.ui-slider-handle', filter );

				// Disable focusing from a keyboard when filter item is disabled
				if ( numActiveValues ) {
					$focusableElements.each( ( _, node ) => {
						const $node = $( node );
						if ( $node.hasClass( 'ui-slider-handle' ) ) {
							$node.attr( 'tabindex', '0' );
						} else {
							$node.removeAttr( 'tabindex' );
						}
					} );
				} else {
					$focusableElements.attr( 'tabindex', '-1' );
				}

				$filter.removeClass( 'loading' );
				$filter.toggleClass( 'disabled', numActiveValues < 1 );
			} );
		},

		/**
		 * Reset values of single item
		 *
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM.
		 */
		resetItemValues: function( e ) {
			const self = this;

			e.stopPropagation();
			e.preventDefault();

			const $filter = $( e.target ).closest( '.w-filter-item' );
			const compare = $filter.data( 'value-compare' );

			var name = PREFIX_FOR_URL_PARAM + $filter.data( 'name' );

			if ( compare ) {
				name += `|${compare}`;
			}

			self.result[ name ] = DELETE_FILTER;

			self.trigger( 'applyFilterToList' );
			self.resetFields( $filter );
		},

		/**
		 * Reset filter fields.
		 *
		 * @param {Node} $filter
		 */
		resetFields: function( $filter ) {
			const self = this;

			if ( $filter.hasClass( 'type_checkbox' ) ) {
				$( 'input[type=checkbox]', $filter ).prop( 'checked', false );

			} else if ( $filter.hasClass( 'type_radio' ) ) {
				$( 'input[type=radio]', $filter ).prop( 'checked', false );
				$( 'input[value="%2A"]', $filter ).prop( 'checked', true ); // check only the "*" value

			} else if ( $filter.hasClass( 'type_dropdown' ) ) {
				$( 'select', $filter ).prop( 'selectedIndex', 0 );

			} else if (
				$filter.hasClass( 'type_date_picker' )
				|| $filter.hasClass( 'type_range_input' )
			) {
				$( 'input', $filter ).val( '' );

			} else if ( $filter.hasClass( 'type_range_slider' ) ) {
				var $input = $( 'input[type=hidden]', $filter ),
					values = [
						$input.attr( 'min' ),
						$input.attr( 'max' )
					];
				$( '.ui-slider', $filter ).slider( 'values', values.map( $ush.parseFloat ) );
			}

			if ( self.titlesAsDropdowns() ) {
				$( '.w-filter-item-title span', $filter ).text( '' );
			}

			$filter.removeClass( 'has_value expand' );

			$( 'input[name="search_values"]', $filter ).val( '' );
			$( '.w-filter-item-value', $filter ).removeClass( 'hidden' );
		},

		/**
		 * Apply filters to first Post/Product List.
		 *
		 * @event handler
		 */
		applyFilterToList: function() {
			const self = this;
			if (
				! $ush.isUndefined( self.lastResult )
				&& $ush.comparePlainObject( self.result, self.lastResult )
			) {
				return;
			}
			self.lastResult = $ush.clone( self.result );

			self.сheckActiveFilters();

			const urlParams = $ush.clone( self.result );

			// Param "f" means that filter has enabled Faceted Filtering
			if ( self.isFacetedFiltering ) {
				var f_value = DELETE_FILTER;
				for ( const k in self.result ) {
					if ( k !== FACETED_PARAM && self.result[ k ] !== DELETE_FILTER ) {
						f_value = 1;
						break;
					}
				}
				urlParams[ FACETED_PARAM ] = f_value;
				self.result[ FACETED_PARAM ] = 1;
			}

			if ( self.changeURLParams() ) {
				urlManager.set( urlParams );
				urlManager.push( {} );
			}

			self.listToFilter().trigger( 'usListFilter', self.result );
		},

		/**
		 * Toggle a filter item section.
		 *
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM.
		 */
		toggleItemSection: function( e ) {
			const self = this;
			if (
				e.originalEvent.detail > 0
				&& self.$container.hasClass( 'drop_on_hover' )
			) {
				return;
			}
			if ( self.titlesAsToggles() || self.titlesAsDropdowns() ) {
				const $filter = $( e.delegateTarget );
				$filter.toggleClass( 'expand', ! $filter.hasClass( 'expand' ) );
			}
		},

		/**
		 * Open mobile version.
		 *
		 * @event handler
		 */
		openMobileVersion: function() {
			const self = this;
			$us.$body.addClass( 'us_filter_open' );
			self.$container.addClass( 'open_for_mobile' ).attr( 'aria-modal', 'true' );
			self.$opener.attr( 'tabindex', '-1' );
			if ( self.titlesAsDropdowns() ) {
				self.$titles.attr( 'tabindex', '-1' );
			}
		},

		/**
		 * Close mobile version.
		 *
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM.
		 */
		closeMobileVersion: function() {
			const self = this;
			$us.$body.removeClass( 'us_filter_open' );
			self.$container.removeClass( 'open_for_mobile' ).removeAttr( 'aria-modal' );
			self.$opener.removeAttr( 'tabindex' );
			if ( self.titlesAsDropdowns() ) {
				self.$titles.removeAttr( 'tabindex' );
			}
		},

		/**
		 * Shows the selected values.
		 */
		showSelectedValues: function() {
			const self = this;
			if ( ! self.titlesAsDropdowns() ) {
				return;
			}
			for ( const key in self.result ) {
				if ( key === FACETED_PARAM ) {
					continue; // skip "_f"
				}
				const name = ( key.charAt(0) === '_' )
					? key.substring(1)
					: key;
				var value = self.result[ key ];
				if ( ( self.lastResult || {} )[ key ] === value || $ush.isUndefined( value ) ) {
					continue
				}
				const $filter = self.filters[ name ];
				const $label = $( '.w-filter-item-title > span', $filter );
				if ( value === null ) {
					$label.text( '' );
					continue;

				} else {
					value = $ush.rawurldecode( value ); // decode сyrillic symbols
				}
				if ( $filter.hasClass( 'type_dropdown' ) ) {
					$label.text( $( `option[value="${value}"]`, $filter ).text() );

				} else if ( $filter.hasClass( 'type_range_slider' ) || $filter.hasClass( 'type_range_input' ) ) {

					const formattedLabel = $ush.toString( self.result[ key ] )
						.split( '-' )
						.map( ( v ) => self.numberFormat( v, $filter.data( 'opts' ) ) )
						.join( ' - ' );

					$label.text( `${$ush.fromCharCode( formattedLabel )}` );

				} else if ( $filter.hasClass( 'type_date_picker' ) ) {
					const values = [];
					$( 'input.hasDatepicker', $filter ).each( ( _, input ) => {
						if ( input.value ) {
							values.push( input.value );
						}
					} );
					$label.text( values.join( ' - ' ) );

				} else {
					// In case of several values and the first value length is bigger then 2, use the number of values as the final value
					if ( value.includes( ',' ) && value.split( ',' )[0].length > 2 ) {
						value = value.split( ',' ).length;
					} else {
						value = $( `[data-value="${value}"] .w-filter-item-value-label:first`, $filter ).html() || value;
					}
					$label.text( value );
				}
			}
		},

		/**
		 * Hide expand content of every filter item with Dropdown layout.
		 *
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM.
		 */
		hideItemDropdown: function( e ) {
			const self = this;
			const $openedFilters = $( '.w-filter-item.expand', self.$container );
			if ( ! $openedFilters.length ) {
				return;
			}
			$openedFilters.each( ( _, node ) => {
				const $node = $( node );
				if ( ! $node.is( e.target ) && $node.has( e.target ).length === 0 ) {
					$node.removeClass( 'expand' );
				}
			} );
		},

		/**
		 * Check screen states.
		 *
		 * @event handler
		 */
		checkScreenStates: function() {
			const self = this;
			const isMobile = $ush.parseInt( window.innerWidth ) <= $ush.parseInt( self.data.mobileWidth );

			if ( ! self.$container.hasClass( `state_${ isMobile ? 'mobile' : 'desktop' }` ) ) {
				self.$container.usMod( 'state', isMobile ? 'mobile' : 'desktop' );
				if ( ! isMobile ) {
					$us.$body.removeClass( 'us_filter_open' );
					self.$container.removeClass( 'open_for_mobile' );
				}
			}
		},

		/**
		 * Check active filters.
		 */
		сheckActiveFilters: function() {
			const self = this;
			self.$container.toggleClass( 'active', $( '.has_value:first', self.$container ).length > 0 );
		},

	} );

	$.extend( usListFilter.prototype, {

		/**
		 * Navigation using key press.
		 *
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM.
		 */
		navUsingKeyPress: function( e ) {
			const self = this;
			const keyCode = e.keyCode;

			if ( ! [ $ush.TAB_KEYCODE, $ush.ENTER_KEYCODE, $ush.SPACE_KEYCODE, $ush.ESC_KEYCODE ].includes( keyCode ) ) {
				return;
			}

			const focusableSelectors = [
				'a[href]',
				'input:not([disabled])',
				'select:not([disabled])',
				'textarea:not([disabled])',
				'button:not([disabled])',
				'[tabindex]',
			].join();

			const $target = $( e.target );
			const $activeElement = $( _document.activeElement ).filter( focusableSelectors );
			const isOpenMobileVersion = self.$container.hasClass( 'open_for_mobile' );

			function openMobileVersion() {
				if ( $target.hasClass( 'w-filter-opener' ) ) {
					self.openMobileVersion();
					self.$listCloser[0].focus();
				}
			}

			function closeMobileVersion() {
				self.closeMobileVersion();
				self.$opener[0].focus();
			}

			if ( keyCode === $ush.ESC_KEYCODE ) {

				$.each( self.filters, ( _, $filter ) => {
					if ( $filter.hasClass( 'expand' ) ) {
						$filter.removeClass( 'expand' );
						$( '.w-filter-item-title', $filter )[0].focus();
					}
				} );

				if ( isOpenMobileVersion ) {
					closeMobileVersion();
				}
			}

			if ( [ $ush.ENTER_KEYCODE, $ush.SPACE_KEYCODE ].includes( keyCode ) ) {

				// Reset filter
				if ( $target.hasClass( 'w-filter-item-reset' ) ) {

					if ( isOpenMobileVersion ) {
						$( focusableSelectors, $target.closest( '[data-name]' ) )
						.filter( ':visible:not([tabindex="-1"]):eq(0)' )[0]
						.focus();
					} else {
						$( '.w-filter-item-title', $target.closest( '.w-filter-item' ) )[0].focus();
						self.resetItemValues( e );
					}
				}

				openMobileVersion();

				if ( $target.hasClass( 'w-filter-list-closer' ) || $target.hasClass( 'w-filter-button-submit' ) ) {
					closeMobileVersion();
				}
			}

			if ( keyCode === $ush.TAB_KEYCODE ) {

				const isContainActiveElement = $.contains( self.$container[0], $activeElement[0] );

				// Close dropdowns when navigating outside the filter container
				if ( self.titlesAsDropdowns() && ! isOpenMobileVersion && ! isContainActiveElement ) {
					$( '.w-filter-item.expand', self.$container ).removeClass( 'expand' );
				}

				// Loop navigation for a popup
				if ( isOpenMobileVersion && ! isContainActiveElement ) {
					const $focusable = $( focusableSelectors, self.$container )
						.filter( ':visible:not([tabindex="-1"])' );

					if ( ! $focusable.length ) {
						e.preventDefault();
						self.$listCloser[0].focus();
						return;
					}

					const firstElement = $focusable.first()[0];
					const lastElement = $focusable.last()[0];

					if ( e.shiftKey && $target[0] === firstElement ) {
						e.preventDefault();
						lastElement.focus();

					} else if ( ! e.shiftKey && $target[0] === lastElement ) {
						e.preventDefault();
						firstElement.focus();
					}
				}
			}
		},
	} );

	$.fn.usListFilter = function() {
		return this.each( ( _, node ) => {
			$( node ).data( 'usListFilter', new usListFilter( node ) );
		} );
	};

	$( () => $( '.w-filter.for_list' ).usListFilter() );

}( jQuery );


! function( $, _undefined ) {
	"use strict";

	// Fixes shortcomings of standard functionality.
	$.fn.fixSlider = function() {
		this.each( ( _, node ) => {
			const inst = $( node ).slider( 'instance' );

			inst._original_refreshValue = inst._refreshValue;

			// 1. The maximum value is displayed only as a multiple of the step, and what is specified.
			inst._calculateNewMax = function() {
				this.max = this.options.max;
			};

			// 2. If the minimum and maximum values are equal, then an error occurs in the interface.
			inst._refreshValue = function() {
				const self = this;

				self._original_refreshValue();

				if ( self._hasMultipleValues() ) {
					var isFixed = false;
					self.handles.each( ( i, handle ) => {
						const valPercent = ( self.values( i ) - self._valueMin() ) / ( self._valueMax() - self._valueMin() ) * 100;
						if ( isNaN( valPercent ) ) {
							$( handle ).css( 'left', `${i*100}%` );
							isFixed = true;
						}
					});
					if ( isFixed ) {
						self.range.css( { left: 0, width: '100%' } );
					}
				}
			};
		} );
	};

}( jQuery );
