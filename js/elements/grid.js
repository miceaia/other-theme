/**
 * UpSolution Element: Grid
 */
;( function( $, _undefined ) {
	"use strict";

	const _window = window;

	$us.WGrid = function( container, options ) {
		const self = this;

		// Elements
		self.$container = $( container );
		self.$filters = $( '.g-filters-item', self.$container ); // Built-in filters
		self.$list = $( '.w-grid-list', self.$container );
		self.$loadmore = $( '.g-loadmore', self.$container );
		self.$pagination = $( '> .pagination', self.$container );
		self.$preloader = $( '.w-grid-preloader', self.$container );
		self.$style = $( '> style:first', self.$container );

		// Private "Variables"
		self.loading = false;
		self.changeUpdateState = false;
		self.gridFilter = null;

		self.curFilterTaxonomy = '';
		self.paginationType = self.$pagination.length
			? 'regular'
			: ( self.$loadmore.length ? 'ajax' : 'none' );
		self.filterTaxonomyName = self.$list.data( 'filter_taxonomy_name' )
			? self.$list.data( 'filter_taxonomy_name' )
			: 'category';

		// Prevent double init.
		if ( self.$container.data( 'gridInit' ) == 1 ) {
			return;
		}
		self.$container.data( 'gridInit', 1 );

		// Bondable events
		self._events = {
			updateState: self._updateState.bind( self ),
			updateOrderBy: self._updateOrderBy.bind( self ),
			initMagnificPopup: self._initMagnificPopup.bind( self ),
			usbReloadIsotopeLayout: self._usbReloadIsotopeLayout.bind( self ),
			scrollToGrid: $ush.debounce( self.scrollToGrid.bind( self ), 10 ),
		};

		var $jsonContainer = $( '.w-grid-json', self.$container );
		if ( $jsonContainer.length && $jsonContainer.is( '[onclick]' ) ) {
			self.ajaxData = $jsonContainer[ 0 ].onclick() || {};
			if ( ! $us.usbPreview() ) {
				$jsonContainer.remove();
			}
			// In case JSON data container isn't present.
		} else {
			self.ajaxData = {};
			self.ajaxUrl = '';
		}

		// Note: The Product List has its own handler for displaying products in the popup.
		if (
			self.$container.hasClass( 'open_items_in_popup' )
			&& ! self.$container.hasClass( 'us_post_list' )
			&& ! self.$container.hasClass( 'us_product_list' )
			&& ! $ush.isUndefined( self.ajaxData )
		) {

			// Private "Variables"
			self.lightboxOpened = false;
			self.lightboxTimer = null;
			self.originalURL = _window.location.href;

			// Elements
			self.$popup = $( '.l-popup', self.$container );
			self.$popupBox = $( '.l-popup-box', self.$popup );
			self.$popupContentPreloader = $( '.l-popup-box-content .g-preloader', self.$popup );
			self.$popupContentFrame = $( '.l-popup-box-content-frame', self.$popup );
			self.$popupNextArrow = $( '.l-popup-arrow.to_next', self.$popup );
			self.$popupPrevArrow = $( '.l-popup-arrow.to_prev', self.$popup );

			$us.$body.append( self.$popup );

			// Initializes the lightbox anchors
			self.initLightboxAnchors();

			// Events
			self.$popup
				.on( 'click', '.l-popup-closer', self.hideLightbox.bind( self ) )
				.on( 'click', '.l-popup-box', self.hideLightbox.bind( self ) )
				.on( 'click', '.l-popup-box-content', ( e ) => {
					e.stopPropagation();
				} );

			$us.$window.on( 'resize', () => {
				if ( self.lightboxOpened && $us.$window.width() < $us.canvasOptions.disableEffectsWidth ) {
					self.hideLightbox();
				}
			} );
		}

		if ( self.paginationType != 'none' || self.$filters.length ) {
			if ( self.ajaxData == _undefined ) {
				return;
			}

			self.templateVars = self.ajaxData.template_vars || {};
			if ( self.filterTaxonomyName ) {
				self.initialFilterTaxonomy = self.$list.data( 'filter_default_taxonomies' )
					? self.$list.data( 'filter_default_taxonomies' ).toString().split( ',' )
					: '';
				self.curFilterTaxonomy = self.initialFilterTaxonomy;
			}

			self.curPage = self.ajaxData.current_page || 1;
			self.infiniteScroll = self.ajaxData.infinite_scroll || 0;
		}

		if ( self.$container.hasClass( 'with_isotope' ) ) {

			self.$list.imagesLoaded( () => {
				var smallestItemSelector,
					isotopeOptions = {
						itemSelector: '.w-grid-item',
						layoutMode: ( self.$container.hasClass( 'isotope_fit_rows' ) ) ? 'fitRows' : 'masonry',
						isOriginLeft: ! $( '.l-body' ).hasClass( 'rtl' ),
						transitionDuration: 0
					};

				if ( self.$list.find( '.size_1x1' ).length ) {
					smallestItemSelector = '.size_1x1';
				} else if ( self.$list.find( '.size_1x2' ).length ) {
					smallestItemSelector = '.size_1x2';
				} else if ( self.$list.find( '.size_2x1' ).length ) {
					smallestItemSelector = '.size_2x1';
				} else if ( self.$list.find( '.size_2x2' ).length ) {
					smallestItemSelector = '.size_2x2';
				}
				if ( smallestItemSelector ) {
					smallestItemSelector = smallestItemSelector || '.w-grid-item';
					isotopeOptions.masonry = { columnWidth: smallestItemSelector };
				}

				// Launching CSS animation locally after building elements in isotope.
				self.$list.on( 'layoutComplete', () => {
					if ( _window.USAnimate ) {
						$( '.w-grid-item.off_autostart', self.$list )
							.removeClass( 'off_autostart' );
						new USAnimate( self.$list );
					}
					// Trigger scroll event to check the positions for $us.waypoints.
					$us.$window.trigger( 'scroll.waypoints' );
				} );

				self.$list.isotope( isotopeOptions );

				if ( self.paginationType == 'ajax' ) {
					self.initAjaxPagination();
				}
				$us.$canvas.on( 'contentChange', () => {
					self.$list.imagesLoaded( () => {
						self.$list.isotope( 'layout' );
					} );
				} );

			} );

			// Events
			self.$container.on( 'usbReloadIsotopeLayout', self._events.usbReloadIsotopeLayout );

		} else if ( self.paginationType == 'ajax' ) {
			self.initAjaxPagination();
		}

		self.$filters.each( ( index, filter ) => {
			var $filter = $( filter ),
				taxonomy = $filter.data( 'taxonomy' );
			$filter.on( 'click', () => {
				if ( taxonomy != self.curFilterTaxonomy ) {
					if ( self.loading ) {
						return;
					}
					self.setState( 1, taxonomy );
					self.$filters.removeClass( 'active' );
					$filter.addClass( 'active' );
				}
			} )
		} );

		// This is necessary for interaction from the Grid Filter or Grid Order.
		if ( self.$container.closest( '.l-main' ).length ) {
			$us.$body
				.on( 'us_grid.updateState', self._events.updateState )
				.on( 'us_grid.updateOrderBy', self._events.updateOrderBy );
		}

		// Events
		self.$container.on( 'scrollToGrid', self._events.scrollToGrid );
		self.$list.on( 'click', '[ref=magnificPopup]', self._events.initMagnificPopup );
	};

	// Grid API
	$us.WGrid.prototype = {

		/**
		 * Update Grid State.
		 *
		 * @param {Event} e
		 * @param {string} queryString Query string containing Grid Filter parameters
		 * @param {number} page
		 * @param {object} gridFilter
		 */
		_updateState: function( e, queryString, page, gridFilter ) {
			const self = this;
			var $container = self.$container;
			if (
				! $container.is( '[data-filterable="true"]' )
				|| ! $container.hasClass( 'used_by_grid_filter' )
				|| (
					! $container.is( ':visible' )
					&& ! $container.hasClass( 'hidden' )
				)
			) {
				return;
			}

			page = page || 1;
			self.changeUpdateState = true;
			self.gridFilter = gridFilter;

			// Is load grid content
			if ( self.ajaxData === _undefined ) {
				self.ajaxData = {};
			}

			if ( ! self.hasOwnProperty( 'templateVars' ) ) {
				self.templateVars = self.ajaxData.template_vars || {
					query_args: {}
				};
			}
			self.templateVars.us_grid_filter_query_string = queryString;
			if ( self.templateVars.query_args !== false ) {
				self.templateVars.query_args.paged = page;
			}

			// Related parameters for getting data, number of records for taxonomy, price range for WooCommerce,
			// etc.
			self.templateVars.filters_args = gridFilter.filtersArgs || {};
			self.setState( page );

			// Reset pagination
			if ( self.paginationType === 'regular' && /page(=|\/)/.test( location.href ) ) {
				var url = location.href.replace( /(page(=|\/))(\d+)(\/?)/, '$1' + page + '$2' );
				if ( history.replaceState ) {
					history.replaceState( document.title, document.title, url );
				}
			}
		},

		/**
		 * Update Grid orderby.
		 *
		 * @param {Event} e
		 * @param string orderby String for order by params.
		 * @param {number} page
		 * @param {object} gridOrder
		 */
		_updateOrderBy: function( e, orderby, page, gridOrder ) {
			const self = this;
			if (
				! self.$container.is( '[data-filterable="true"]' )
				|| ! self.$container.hasClass( 'used_by_grid_order' )
			) {
				return;
			}

			page = page || 1;
			self.changeUpdateState = true;
			if ( ! self.hasOwnProperty( 'templateVars' ) ) {
				self.templateVars = self.ajaxData.template_vars || {
					query_args: {}
				};
			}
			if ( self.templateVars.query_args !== false ) {
				self.templateVars.query_args.paged = page;
			}
			self.templateVars.grid_orderby = orderby;
			self.setState( page );
		},

		/**
		 * Initializing MagnificPopup for AJAX loaded items.
		 *
		 * @param {Event} e
		 */
		_initMagnificPopup: function( e ) {
			e.stopPropagation();
			e.preventDefault();
			var $target = $( e.currentTarget );
			if ( $target.data( 'magnificPopup' ) === _undefined ) {
				$target.magnificPopup( {
					type: 'image',
					mainClass: 'mfp-fade'
				} );
				$target.trigger( 'click' );
			}
		},

		/**
		 * Reload layout in the Live Builder context.
		 *
		 * @event handler
		 */
		_usbReloadIsotopeLayout: function() {
			const self = this;
			if ( self.$container.hasClass( 'with_isotope' ) ) {
				self.$list.isotope( 'layout' );
			}
		},

		/**
		 * Initializes the lightbox anchors
		 */
		initLightboxAnchors: function() {
			var self = this;
			$( '.w-grid-item-anchor:not(.lightbox_init)', self.$list ).on( 'click', ( e ) => {
				var $item = $( e.target ).closest( '.w-grid-item' ),
					url = $( '.w-grid-item-anchor', $item ).attr( 'href' );
				if ( ! $item.hasClass( 'custom-link' ) ) {
					if ( $us.$window.width() >= $us.canvasOptions.disableEffectsWidth ) {
						e.stopPropagation();
						e.preventDefault();
						self.openLightboxItem( url, $item );
						$item.addClass( 'lightbox_init' );
					}
				}
			} );
		},

		// Pagination and Filters functions.
		initAjaxPagination: function() {
			const self = this;
			self.$loadmore.on( 'click', () => {
				if ( self.curPage < self.ajaxData.max_num_pages ) {
					self.setState( self.curPage + 1 );
				}
			} );

			if ( self.infiniteScroll ) {
				$us.waypoints.add( self.$loadmore, /* offset */'-70%', () => {
					if ( ! self.loading ) {
						self.$loadmore.click();
					}
				} );
			}
		},

		setState: function( page, taxonomy ) {
			const self = this;
			if ( self.loading && ! self.changeUpdateState ) {
				return;
			}

			if (
				page !== 1
				&& self.paginationType == 'ajax'
				&& self.none !== _undefined
				&& self.none == true
			) {
				return;
			}

			self.none = false;
			self.loading = true;

			// Hide element by default
			self.$container
				.next( '.w-grid-none' )
				.addClass( 'hidden' );

			// Create params for built-in filter
			if ( self.$filters.length && ! self.changeUpdateState ) {
				taxonomy = taxonomy || self.curFilterTaxonomy;
				if ( taxonomy == '*' ) {
					taxonomy = self.initialFilterTaxonomy;
				}

				if ( taxonomy != '' ) {
					var newTaxArgs = {
							'taxonomy': self.filterTaxonomyName,
							'field': 'slug',
							'terms': taxonomy
						},
						taxQueryFound = false;
					if ( self.templateVars.query_args.tax_query == _undefined ) {
						self.templateVars.query_args.tax_query = [];
					} else {
						$.each( self.templateVars.query_args.tax_query, ( index, taxArgs ) => {
							if ( taxArgs != null && taxArgs.taxonomy == self.filterTaxonomyName ) {
								self.templateVars.query_args.tax_query[ index ] = newTaxArgs;
								taxQueryFound = true;
								return false;
							}
						} );
					}
					if ( ! taxQueryFound ) {
						self.templateVars.query_args.tax_query.push( newTaxArgs );
					}
				} else if ( self.templateVars.query_args.tax_query != _undefined ) {
					$.each( self.templateVars.query_args.tax_query, ( index, taxArgs ) => {
						if ( taxArgs != null && taxArgs.taxonomy == self.filterTaxonomyName ) {
							self.templateVars.query_args.tax_query[ index ] = null;
							return false;
						}
					} );
				}
			}

			if ( self.templateVars.query_args !== false ) {
				self.templateVars.query_args.paged = page;
			}

			if ( self.paginationType == 'ajax' ) {
				if ( page == 1 ) {
					self.$loadmore.addClass( 'hidden' );
				} else {
					self.$loadmore.addClass( 'loading' );
				}
				if ( ! self.infiniteScroll ) {
					self.prevScrollTop = $us.$window.scrollTop();
				}
			}

			if ( self.paginationType != 'ajax' || page == 1 ) {
				self.$preloader.addClass( 'active' );
				if ( self.$list.data( 'isotope' ) ) {
					self.$list.isotope( 'remove', self.$container.find( '.w-grid-item' ) );
					self.$list.isotope( 'layout' );
				} else {
					self.$container.find( '.w-grid-item' ).remove();
				}
			}

			self.ajaxData.template_vars = JSON.stringify( self.templateVars );

			var isotope = self.$list.data( 'isotope' );
			// Clear isotope elements on first page load
			if ( isotope && page == 1 ) {
				self.$list.html( '' );
				isotope.remove( isotope.items );
				isotope.reloadItems();
			}

			// Abort prev request
			if ( self.xhr !== _undefined ) {
				self.xhr.abort();
			}

			self.xhr = $.ajax( {
				type: 'post',
				url: $us.ajaxUrl,
				data: self.ajaxData,
				cache: false,
				beforeSend: function() {
					// Display the grid before submitting the request
					self.$container.removeClass( 'hidden' );
				},
				success: function( html ) {
					var $result = $( html ),
						// Note: Get the `first()` list since there may be several of them due to
						// the output of grids in `w-grid-none`
						$container = $( '.w-grid-list', $result ).first(),
						$pagination = $( '.pagination > *', $result ),
						$items = $container.children(),
						smallestItemSelector;

					// Hide the grid if there is no result if action 'Hide this Grid' is enabled
					self.$container
						.toggleClass( 'hidden', ! $items.length );

					$container.imagesLoaded( () => {
						self.beforeAppendItems( $items );
						//isotope.options.hiddenStyle.transform = '';
						$items.appendTo( self.$list );
						$container.html( '' );
						var $sliders = $items.find( '.w-slider' );

						if ( isotope ) {
							isotope.insert( $items );
							isotope.reloadItems();
						}

						if ( $sliders.length ) {
							$sliders.each( ( index, slider ) => {
								$( slider ).usImageSlider().find( '.royalSlider' ).data( 'royalSlider' ).ev.on( 'rsAfterInit', () => {
									if ( isotope ) {
										self.$list.isotope( 'layout' );
									}
								} );
							} );
						}

						if ( isotope ) {
							if ( self.$list.find( '.size_1x1' ).length ) {
								smallestItemSelector = '.size_1x1';
							} else if ( self.$list.find( '.size_1x2' ).length ) {
								smallestItemSelector = '.size_1x2';
							} else if ( self.$list.find( '.size_2x1' ).length ) {
								smallestItemSelector = '.size_2x1';
							} else if ( self.$list.find( '.size_2x2' ).length ) {
								smallestItemSelector = '.size_2x2';
							}
							if ( isotope.options.masonry ) {
								isotope.options.masonry.columnWidth = smallestItemSelector || '.w-grid-item';
							}
							self.$list.isotope( 'layout' );
							self.$list.trigger( 'layoutComplete' );
						}

						if ( self.paginationType == 'ajax' ) {

							if ( page == 1 ) {
								var $jsonContainer = $result.find( '.w-grid-json' );
								if ( $jsonContainer.length ) {
									var ajaxData = $jsonContainer[ 0 ].onclick() || {};
									self.ajaxData.max_num_pages = ajaxData.max_num_pages || self.ajaxData.max_num_pages;
								} else {
									self.ajaxData.max_num_pages = 1;
								}
							}

							if ( self.templateVars.query_args.paged >= self.ajaxData.max_num_pages || ! $items.length ) {
								self.$loadmore.addClass( 'hidden' );
							} else {
								self.$loadmore
									.removeClass( 'hidden' )
									.removeClass( 'loading' );
							}

							if ( self.infiniteScroll ) {
								$us.waypoints.add( self.$loadmore, /* offset */'-70%', () => {
									if ( ! self.loading ) {
										self.$loadmore.click(); // check none
									}
								} );

								// If the scroll value has changed, then scroll to the starting position,
								// as in some browsers this is not true. After loading the data, the scroll is not
								// calculated correctly.
							} else if ( Math.round( self.prevScrollTop ) != Math.round( $us.$window.scrollTop() ) ) {
								$us.$window.scrollTop( self.prevScrollTop );
							}

						} else if ( self.paginationType === 'regular' && self.changeUpdateState ) {
							// Pagination Link Correction
							$( 'a[href]', $pagination ).each( ( _, item ) => {
								var $item = $( item ),
									pathname = location.pathname.replace( /((\/page.*)?)\/$/, '' );
								$item.attr( 'href', pathname + $item.attr( 'href' ) );
							} );
							self.$pagination.html( $pagination );
						}

						// Initialize all new anchors for lightbox
						if ( self.$container.hasClass( 'open_items_in_popup' ) ) {
							self.initLightboxAnchors();
						}

						// The display a message in the absence of data.
						var $result_none = $result.next( '.w-grid-none' );
						if ( self.changeUpdateState && $result_none.length ) {
							var $none = self.$container.next( '.w-grid-none' );
							if ( $none.length ) {
								$none.removeClass( 'hidden' );
							} else {
								self.$container.after( $result_none );
							}
							// If the result contains a grid that can be Reusable Block, then we will initialize
							var $nextGrid = $( '.w-grid:first', self.$container.next( '.w-grid-none' ) );
							if ( $nextGrid.length ) {
								$nextGrid.wGrid();
							}
							self.none = true;
						}

						// Send the result to the filter grid.
						if ( self.changeUpdateState && self.gridFilter ) {
							var $jsonData = $result.filter( '.w-grid-filter-json-data:first' );
							if ( $jsonData.length ) {
								self.gridFilter
									.trigger( 'us_grid_filter.update-items-amount', $jsonData[ 0 ].onclick() || {} );
							}
							$jsonData.remove();
						}

						// Add custom styles to Grid.
						var customStyles = $( 'style#grid-post-content-css', $result ).html() || '';
						if ( customStyles ) {
							if ( ! self.$style.length ) {
								self.$style = $( '<style></style>' );
								self.$container.append( self.$style );
							}
							self.$style.text( self.$style.text() + customStyles );
						}

						// Resize canvas to avoid Parallax calculation issues.
						$us.$canvas.resize();
						self.$preloader.removeClass( 'active' );

						// Init load animation
						if ( _window.USAnimate && self.$container.hasClass( 'with_css_animation' ) ) {
							new USAnimate( self.$container );
						}

						// List items loaded
						$ush.timeout( () => {
							$us.$document.trigger( 'usGrid.itemsLoaded', [ $items ] );
						}, 1 );

					} );

					// Scroll to top of grid
					self.$container.trigger( 'scrollToGrid' );

					self.loading = false;

					// Trigger custom event on success, might be used by 3rd party devs
					// TODO: Remove the trigger and prompt customers to register at "usGrid.itemsLoaded".
					self.$container.trigger( 'USGridItemsLoaded' );

				},
				error: () => {
					self.$loadmore.removeClass( 'loading' );
				},
			} );

			self.curPage = page;
			self.curFilterTaxonomy = taxonomy;
		},

		/**
		 * Scroll to top of grid
		 *
		 * @event handler
		 */
		scrollToGrid: function() {
			const self = this;

			// Check, if it's not load more and orderby
			if ( self.curPage !== 1 ) {
				return;
			}

			var $container = self.$container;
			if ( $container.hasClass( 'hidden' ) ) {
				$container = $container.next();
			}

			const gridPos = $ush.parseInt( $container.offset().top );
			if ( ! gridPos ) {
				return;
			}

			const scrollTop = $us.$window.scrollTop();
			if (
				scrollTop >= gridPos
				|| gridPos >= ( scrollTop + _window.innerHeight )
			) {
				$us.$htmlBody
					.stop( true, false )
					.animate( { scrollTop: ( gridPos - $us.header.getCurrentHeight() ) }, 500 );
			}
		},
		// Lightbox Functions.
		openLightboxItem: function( itemUrl, $item ) {
			this.showLightbox();

			var prevIndex,
				nextIndex,
				currentIndex = 0,
				items = $( '.w-grid-item:visible:not(.custom-link)', this.$container ).toArray();
			for ( var i in items ) {
				if ( $item.is( items[ i ] ) ) {
					currentIndex = parseInt( i );
					break;
				}
			}
			// Get prev/next index
			if ( currentIndex > 0 ) {
				prevIndex = currentIndex - 1;
			}
			if ( currentIndex < items.length ) {
				nextIndex = currentIndex + 1;
			}

			var $prevItem = $( typeof prevIndex === 'number' ? items[ prevIndex ] : '' ),
				$nextItem = $( typeof nextIndex === 'number' ? items[ nextIndex ] : '' );

			if ( $nextItem.length > 0 ) {
				this.$popupNextArrow.removeClass( 'hidden' );
				this.$popupNextArrow.attr( 'title', $nextItem.find( '.w-grid-item-title' ).text() );
				this.$popupNextArrow.off( 'click' ).click( function( e ) {
					var $nextItemAnchor = $nextItem.find( '.w-grid-item-anchor' ),
						nextItemUrl = $nextItemAnchor.attr( 'href' );
					e.stopPropagation();
					e.preventDefault();

					this.openLightboxItem( nextItemUrl, $nextItem );
				}.bind( this ) );
			} else {
				this.$popupNextArrow.attr( 'title', '' );
				this.$popupNextArrow.addClass( 'hidden' );
			}

			if ( $prevItem.length > 0 ) {
				this.$popupPrevArrow.removeClass( 'hidden' );
				this.$popupPrevArrow.attr( 'title', $prevItem.find( '.w-grid-item-title' ).text() );
				this.$popupPrevArrow.off( 'click' ).on( 'click', function( e ) {
					var $prevItemAnchor = $prevItem.find( '.w-grid-item-anchor' ),
						prevItemUrl = $prevItemAnchor.attr( 'href' );
					e.stopPropagation();
					e.preventDefault();

					this.openLightboxItem( prevItemUrl, $prevItem );
				}.bind( this ) );
			} else {
				this.$popupPrevArrow.attr( 'title', '' );
				this.$popupPrevArrow.addClass( 'hidden' );
			}

			if ( itemUrl.indexOf( '?' ) !== - 1 ) {
				this.$popupContentFrame.attr( 'src', itemUrl + '&us_iframe=1' );
			} else {
				this.$popupContentFrame.attr( 'src', itemUrl + '?us_iframe=1' );
			}

			// Replace window location with item's URL
			if ( history.replaceState ) {
				history.replaceState( null, null, itemUrl );
			}
			this.$popupContentFrame.off( 'load' ).on( 'load', function() {
				this.lightboxContentLoaded();
			}.bind( this ) );

		},
		lightboxContentLoaded: function() {
			const self = this;
			self.$popupContentPreloader.css( 'display', 'none' );
			self.$popupContentFrame
				.contents()
				.find( 'body' )
				.off( 'keyup.usCloseLightbox' )
				.on( 'keyup.usCloseLightbox', ( e ) => {
					if ( e.keyCode === $ush.ESC_KEYCODE ) {
						self.hideLightbox();
					}
				} );
		},
		showLightbox: function() {
			const self = this;
			clearTimeout( self.lightboxTimer );
			self.$popup.addClass( 'active' );
			self.lightboxOpened = true;
			$us.$document.trigger( 'usPopupOpened' );

			self.$popupContentPreloader.css( 'display', 'block' );

			self.lightboxTimer = setTimeout( () => {
				self.afterShowLightbox();
			}, 25 );
		},
		afterShowLightbox: function() {
			const self = this;
			clearTimeout( self.lightboxTimer );

			self.$container.on( 'keyup', ( e ) => {
				if ( self.$container.hasClass( 'open_items_in_popup' ) ) {
					if ( $ush.toLowerCase( e.key ) === 'escape' ) {
						self.hideLightbox();
					}
				}
			} );

			self.$popupBox.addClass( 'show' );
			$us.$canvas.trigger( 'contentChange' );
			$us.$window.trigger( 'resize' );
		},
		hideLightbox: function() {
			const self = this;
			clearTimeout( self.lightboxTimer );
			self.lightboxOpened = false;
			self.$popupBox.removeClass( 'show' );
			self.$popup.removeClass( 'active' );

			// Replace window location back to original URL
			if ( history.replaceState ) {
				history.replaceState( null, null, self.originalURL );
			}

			self.lightboxTimer = setTimeout( () => {
				self.afterHideLightbox();
			}, 500 );
		},
		afterHideLightbox: function() {
			const self = this;
			self.$container.off( 'keyup' );
			clearTimeout( self.lightboxTimer );

			self.$popupContentFrame.attr( 'src', 'about:blank' );
			$us.$document.trigger( 'usPopupClosed' );
		},
		/**
		 * Overloadable function for themes.
		 *
		 * @param $items
		 */
		beforeAppendItems: function( $items ) {
			// Init `Show More` for grid items loaded by AJAX
			if ( $( '[data-content-height]', $items ).length ) {
				var handle = $ush.timeout( () => {
					$( '[data-content-height]', $items ).usCollapsibleContent();
					$ush.clearTimeout( handle );
				}, 1 );
			}
		}

	};

	$.fn.wGrid = function( options ) {
		return this.each( function() {
			$( this ).data( 'wGrid', new $us.WGrid( this, options ) );
		} );
	};

	$( () => $( '.w-grid.type_grid' ).wGrid() );

	$( '.w-grid-list:not(.owl-carousel)' ).each( ( _, node ) => {
		const $list = $( node );
		if ( ! $list.find( '[ref=magnificPopupGrid]' ).length ) {
			return;
		}
		const globalOpts = $us.langOptions.magnificPopup;
		$list.magnificPopup( {
			type: 'image',
			delegate: 'a[ref=magnificPopupGrid]:visible',
			gallery: {
				enabled: true,
				navigateByImgClick: true,
				preload: [0, 1],
				tPrev: globalOpts.tPrev, // Alt text on left arrow
				tNext: globalOpts.tNext, // Alt text on right arrow
				tCounter: globalOpts.tCounter // Markup for "1 of 7" counter
			},
			image: {
				titleSrc: 'aria-label'
			},
			removalDelay: 300,
			mainClass: 'mfp-fade',
			fixedContentPos: true,
		} );
	} );

} )( jQuery );
