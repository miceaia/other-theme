/**
 * UpSolution Element: Leaflet Maps
 *
 * Used for [us_gmaps] shortcode
 *
 * Leaflet JS Official Docs https://leafletjs.com/
 * @requires jQuery
 */
! function( $, undefined ) {
	"use strict";

	// Private variables that are used only in the context of this function, it is necessary to optimize the code
	var _document = document,
		_window = window,
		_null = null;

	// Check for is set objects
	_window.$us = _window.$us || {};

	/**
	 * @type {RegExp} Regular expression to check or extract coordinates.
	 */
	const _REGEXP_EXTRACT_COORDINATES_ = /^(-?[\d\.]+),(-?[\d\.]+)$/;

	/**
	 * @class wLmaps
	 * @param {Node} container The node container
	 * @param {{}} options The map options
	 */
	$us.wLmaps = function( container, options ) {
		var self = this;

		// Elements
		self.$container = $( container );

		// Prevent double init
		if ( self.$container.data( '_inited' ) ) {
			return;
		}
		self.$container.data( '_inited', 1 );

		// Variables
		self._mapInstance = _null;
		self.cookieName = self.$container.data( 'cookie-name' );
		self.options = options || {};

		/**
		 * @var {{}} Bondable events
		 */
		self._events = {
			confirmInit: self._confirmInit.bind( self ),
			redraw: self._redraw.bind( self )
		};

		// Confirm initialization
		if ( self.cookieName ) {
			self.$container.on( 'click', '.action_confirm_load', self._events.confirmInit );
			return;
		}

		self._init();
	};

	/**
	 * Export API
	 */
	$.extend( $us.wLmaps.prototype, {

		/**
		 * Map initialization handler after confirmation
		 *
		 * @event handler
		 */
		_confirmInit: function() {
			var self = this;

			// Save permission to loading maps in cookies
			if ( $( 'input[name^=' + self.cookieName + ']:checked', self.$container ).length ) {
				$ush.setCookie( self.cookieName, /* value */1, /* days */365 );
			}

			self.$container
				// Add map html markup to element
				.html( $ush.base64Decode( $( 'script[type="text/template"]', self.$container ).text() ) )
				.removeAttr( 'data-cookie-name' );

			self._init();
		},

		/**
		 * Map the init
		 */
		_init: function() {
			var self = this;

			// Get map options
			var $mapJson = $( '.w-map-json', self.$container );
			if ( $mapJson.is( '[onclick]' ) ) {
				$.extend( self.options, $mapJson[0].onclick() || {} );
				$mapJson.remove();
			}

			$us.$canvas.on( 'contentChange', self._events.redraw );
			self._beforeRender();
		},

		/**
		 * Get data before rendering the map
		 */
		_beforeRender: function() {
			var self = this,
				address = ( '' + self.options.address ),
				matches = $ush.removeSpaces( address ) // Remove all spaces and tabs
					.match( _REGEXP_EXTRACT_COORDINATES_ ); // Example: -0.00000,0.00000

			if ( matches ) {
				self.center = [ matches[1], matches[2] ];
				self._render();
			} else {
				self._geocoder( address );
			}
		},

		/**
		 * Map render
		 */
		_render: function() {
			var self = this,
				mapId = self.$container.attr( 'id' ),
				// Basic Map setup
				lmapsOptions = {
					center: self.center,
					zoom: self.options.zoom
				};

			if ( self.options.hideControls ) {
				lmapsOptions.zoomControl = false; // Hide zooming buttons
			}
			if ( self.options.disableZoom ) {
				lmapsOptions.scrollWheelZoom = false; // Disable Mouse Zooming
			}

			// Create an instance of the L.map class
			self._mapInstance = L.map( mapId, lmapsOptions );

			// Add a Raster layer to the map. Copyright layer required by OSM https://www.openstreetmap.org/copyright
			L.tileLayer(
				self.options.style,
				{
					attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				}
			).addTo( self._mapInstance );

			// Add all markers to the map
			self._renderMarkers();

			if (
				$us.usbPreview()
				|| self.options.disableDragging && ! $us.$html.hasClass( 'no-touch' )
			) {
				// Disable dragging on mobiles
				self._mapInstance.dragging.disable();
			}
		},

		/**
		 * Set a markers at an address
		 *
		 * @param {String} text The request text
		 * @param {{}} markerOptions The marker options
		 * @param {String} popup The popup
		 */
		_geocoder: function( text, markerOptions, popup ) {
			var self = this,
				osmUrl = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURI( text );

			// Get coordinates from the search engine
			$.getJSON( osmUrl, /* First Success */$.noop ).done( function( json ) {
				if ( ! json.length ) {
					// Return in case no coordinates were found
					return;
				}
				// Get Coordinates
				var boundingBox = json[0].boundingbox;
				if ( ! markerOptions ) {
					// Get coordinates to set map center and add 1st marker
					self.center = [ boundingBox[/* latitude */1], boundingBox[/* longitude */3] ];
					self._render();
				} else {
					self.marker = L
						.marker( [ boundingBox[/* latitude */1], boundingBox[/* longitude */3] ], markerOptions )
						.addTo( self._mapInstance );
					// Add marker popups
					if ( popup ) {
						self.marker.bindPopup( popup );
					}
				}
			});
		},

		/**
		 * Map redraw
		 *
		 * @event handler
		 */
		_redraw: function() {
			var self = this;
			if ( ! self._mapInstance || self.$container.is( ':hidden' ) ) {
				return;
			}
			$ush.timeout( self._mapInstance.invalidateSize.bind( self._mapInstance, /* animate */true ), 100 );
		},

		/**
		 * Add all markers to the map
		 */
		_renderMarkers: function() {
			var self = this;
			if ( ! self.options.markers.length ) {
				return;
			}
			// Add markers
			var mainOptions = {};
			for ( var i = 0; i < self.options.markers.length; i++ ) {
				var item = self.options.markers[ i ];
				if ( i == 0 ) {
					// Handle first marker separately
					if ( self.options.icon != _null ) {
						var mainMarkerSizes = self.options.icon.size[0],
							markerImg = L.icon( {
								iconUrl: self.options.icon.url,
								iconSize: mainMarkerSizes,
							} );
						// Set icon offset
						markerImg.options.iconAnchor = [ mainMarkerSizes / 2, mainMarkerSizes ];
						// Set popup offset
						markerImg.options.popupAnchor = [ 0, - mainMarkerSizes ];
						// Push Marker Icons to Options object
						mainOptions.icon = markerImg;
					}
					// Add main marker with calculated coordinates
					var marker = L.marker( self.center, mainOptions ).addTo( self._mapInstance );
					// Add a popup to the 1st marker
					if ( item.html ) {
						if ( item.infowindow ) {
							marker.bindPopup( item.html ).openPopup();
						} else {
							marker.bindPopup( item.html );
						}
					}
				}
				else {
					var markerOptions = {};
					// All markers but first
					if ( item.marker_img != _null ) {
						var markerSizes = item.marker_size[0],
							markerImg = L.icon( {
								iconUrl: item.marker_img[0],
								iconSize: markerSizes,
							} );
						// Set icon offset
						markerImg.options.iconAnchor = [ markerSizes / 2, markerSizes ];
						// Set popup offset
						markerImg.options.popupAnchor = [ 0, - markerSizes ];
						markerOptions.icon = markerImg;
					} else {
						markerOptions = mainOptions;
					}
					var matches = $ush.removeSpaces( item.address ) // Remove all spaces and tabs
						.match( _REGEXP_EXTRACT_COORDINATES_ );
					if ( matches ) {
						self.marker = L.marker( [ matches[/* latitude */1], matches[/* longitude */2] ], markerOptions ).addTo( self._mapInstance );
						if ( item.html ) {
							// Add a popup if marker has some text
							self.marker.bindPopup( item.html )
						}
					} else {
						self._geocoder( item.address, markerOptions, item.html );
					}
				}
			}
		}

	} );

	/**
	 * Wrapper for jQuery
	 *
	 * @param {{}} options The map options
	 * @return self
	 */
	$.fn.wLmaps = function( options ) {
		options = options || {};
		return this.each( function() {
			this._wLmaps = new $us.wLmaps( this, $ush.clone( options ) );
		} );
	};

	// Initializing an element after loading a document
	$( function() {
		$( '.w-map.provider_osm' ).wLmaps();
	} );

}( jQuery );
