/**
 * UpSolution Element: Google Maps
 *
 * Used for [us_gmaps] shortcode
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
	 * @var {Function} The handler is called when Maps API is ready to use
	 */
	_window.usGmapLoaded = function() {
		$us.$document.trigger( 'usGmapLoaded' );
	};

	/**
	 * @var {{}}
	 */
	$us._wGmapsGeocodes = {
		_maxAttempts: 5, // maximum number of attempts
		_tasks: {}, // task stack

		/**
		 * Add a new task
		 *
		 * @param {String} key The unique key
		 * @param {Function} callback The callback
		 * @return {Function} self.run()
		 */
		add: function( key, callback ) {
			var self = this;
			self._tasks[ '' + key ] = {
				counter: 0,
				running: false,
				callback: callback,
			};
			return self.run.bind( self, key );
		},

		/**
		 * Remove task by key
		 *
		 * @param {String} key The unique key
		 */
		remove: function( key ) {
			var self = this;
			if ( self._tasks[ key ] ) {
				delete self._tasks[ key ];
			}
		},

		/**
		 * Run a task from the stack by key
		 *
		 * @param {String} key The unique key
		 */
		run: function( key ) {
			var self = this, task = self._tasks[ key ];
			if ( $ush.isUndefined( task ) || task.running ) {
				return;
			}
			if ( task.counter >= self._maxAttempts ) {
				self.remove( key );
			}
			if ( typeof task.callback === 'function' ) {
				task.counter++;
				task.running = true;
				task.callback( /* stopGeocodeTask */function() {
					task.running = false;
				} );
			}
		}
	};

	/**
	 * @class wGmaps
	 * @param {Node} container The node container
	 * @param {{}} options The map options
	 */
	$us.wGmaps = function ( container, options ) {
		var self = this;

		// Elements
		self.$container = $( container );

		// Prevent double init
		if ( self.$container.data( '_inited' ) ) {
			return;
		}
		self.$container.data( '_inited', 1 );

		// Variables
		self._mapInstance = _null; // An instance of the Google Maps object
		self.cookieName = self.$container.data( 'cookie-name' ); // The cookie name to save the load consent
		self.options = options || {}; // Main options of the element
		self.style = {}; // Setting styles derived from the frontend
		self.uniqid = $ush.uniqid(); // Unique element id

		// Get a key to connect to the Google API
		var attributeName = 'data-api-key';
		if ( self.$container.is( '[' + attributeName + ']' ) ) {
			self._apiKey = self.$container.attr( attributeName );
			self.$container.removeAttr( attributeName );
		}

		/**
		 * @var {{}} Bondable events
		 */
		self._events = {
			confirm: self._confirm.bind( self ),
			redraw: self._redraw.bind( self ),
			init: self._init.bind( self ),
		};

		// Events
		$us.$document
			// The handler is called when Maps API is ready to use
			.on( 'usGmapLoaded', self._events.init );

		// Initialization via confirmations
		if ( self.cookieName ) {
			self.$container.on( 'click', '.action_confirm_load', self._events.confirm );
			return;
		}

		// Init the map
		if ( ! self.cookieName || $ush.getCookie( self.cookieName ) ) {
			self[ self.isGmapLoaded() ? '_init' : '_initAftetGmapLoaded' ](); // Init map
		};
	};

	/**
	 * Export API
	 */
	$.extend( $us.wGmaps.prototype, {

		/**
		 * Determines if gmap loaded
		 *
		 * @return {Boolean} True if Maps API loaded, False otherwise
		 */
		isGmapLoaded: function() {
			return !! ( _window['google'] || {} )['maps'];
		},

		/**
		 * Map initialization handler after confirmation
		 *
		 * @event handler
		 */
		_confirm: function() {
			var self = this;

			// Save permission to loading maps in cookies
			if ( $( 'input[name^=' + self.cookieName + ']:checked', self.$container ).length ) {
				$ush.setCookie( self.cookieName, /* value */1, /* days */365 );
			}

			self.$container
				// Add map html markup to element
				.html( $ush.base64Decode( '' + $( 'script[type="text/template"]', self.$container ).text() ) )
				.removeAttr( 'data-cookie-name' );

			// Init the map
			self[ self.isGmapLoaded() ? '_init' : '_initAftetGmapLoaded' ]();
		},

		/**
		 * Init the map
		 *
		 * @event handler
		 * @link https://developers.google.com/maps/documentation/javascript/overview
		 */
		_init: function() {
			var self = this;

			if (
				// If there is an attribute, stop initialization because it is not a validated map
				self.$container.is( '[data-cookie-name]' )
				// If the google.maps object is not loaded, stop the initialization
				|| ! self.isGmapLoaded()
			) {
				return;
			}

			// Get map options
			var $mapJson = $( '.w-map-json', self.$container );
			if ( $mapJson.is( '[onclick]' ) ) {
				$.extend( self.options, $mapJson[0].onclick() || {} );
				$mapJson.remove();
			}

			// Get style options
			var $styleJson = $( '.w-map-style-json', self.$container );
			if ( $styleJson.is( '[onclick]' ) ) {
				self.style = $styleJson[0].onclick() || [];
				$styleJson.remove();
			}

			/**
			 * @var {{}} Map options
			 */
			var mapOptions = {
				el: '#' + self.$container.attr( 'id' ),
				lat: 0,
				lng: 0,
				mapTypeId: google.maps.MapTypeId[ self.options.maptype ],
				type: self.options.type,
				zoom: self.options.zoom
			};

			if ( self.options.hideControls ) {
				mapOptions.disableDefaultUI = true;
			}
			if ( self.options.disableZoom ) {
				mapOptions.scrollwheel = false;
			}
			if ( self.options.disableDragging && ( ! $us.$html.hasClass( 'no-touch' ) ) ) {
				mapOptions.draggable = false;
			}

			// Create an instance of the GMaps class
			self._mapInstance = new GMaps( mapOptions );

			// Set map style
			if ( self.style != _null && Array.isArray( self.style ) ) {
				self._mapInstance.map.setOptions( { styles: self.style } );
			}

			var shouldRunGeoCode,
				matches = $ush.removeSpaces( '' + self.options.address ) // Remove all spaces and tabs
					.match( _REGEXP_EXTRACT_COORDINATES_ ); // Example: -0.00000,0.00000

			if ( matches ) {
				self.options.latitude = matches[/* latitude */1];
				self.options.longitude = matches[/* longitude */2];
				$ush.timeout( function() {
					self._mapInstance.setCenter( self.options.latitude, self.options.longitude );
				}, 1 );
			} else {
				// Get the address coordinates through the reverse call function
				$us._wGmapsGeocodes.add( self.uniqid, function( stopGeocodeTask ) {
					self._mapGeoCode(
						self.uniqid,
						self.options.address,
						function( latitude, longitude ) {
							self.options.latitude = latitude;
							self.options.longitude = longitude;
							self._mapInstance.setCenter( latitude, longitude );
							if ( typeof stopGeocodeTask === 'function' ) {
								stopGeocodeTask();
							}
						},
						self.uniqid
					)
				} )/* run */();
			}

			// Map Markers
			$.each( self.options.markers, function( i, _ ) {
				var markerOptions = {};
				if ( self.options.icon != _null || self.options.markers[ i ].marker_img != _null ) {
					var url, width, height;
					if ( self.options.markers[ i ].marker_img != _null ) {
						url = self.options.markers[ i ].marker_img[0];
						width = self.options.markers[ i ].marker_size[/* width */0];
						height = self.options.markers[ i ].marker_size[/* height */1];
					} else {
						url = self.options.icon.url;
						width = self.options.icon.size[/* width */0];
						height = self.options.icon.size[/* height */1];
					}
					var size = new google.maps.Size(
						$ush.parseInt( width ),
						$ush.parseInt( height )
					);
					markerOptions.icon = {
						url: url,
						size: size,
						scaledSize: size,
					};
				}

				if ( self.options.markers[ i ] != _null ) {
					var matches = $ush.removeSpaces( self.options.markers[ i ].address ) // Remove all spaces and tabs
						.match( _REGEXP_EXTRACT_COORDINATES_ );
					if ( matches ) {
						markerOptions.lat = matches[/* latitude */1];
						markerOptions.lng = matches[/* longitude */2];
						// Do not output empty tooltips
						if ( self.options.markers[ i ].html ) {
							markerOptions.infoWindow = { content: self.options.markers[ i ].html };
						}
						var marker = self._mapInstance.addMarker( markerOptions );
						if ( self.options.markers[ i ].infowindow ) {
							marker.infoWindow.open( self._mapInstance.map, marker );
						}
					} else {
						var markerGeocodeId = self.uniqid + ':' + i; // the unique marker id
						// Get the address coordinates through the reverse call function
						$us._wGmapsGeocodes.add( markerGeocodeId, function( stopGeocodeTask ) {
							self._mapGeoCode(
								markerGeocodeId,
								self.options.markers[i].address,
								function( latitude, longitude ) {
									markerOptions.lat = latitude;
									markerOptions.lng = longitude;
									if ( self.options.markers[ i ].html ) {
										markerOptions.infoWindow = { content: self.options.markers[ i ].html };
									}
									var marker = self._mapInstance.addMarker( markerOptions );
									if ( self.options.markers[ i ].infowindow ) {
										marker.infoWindow.open( $ush.clone( self._mapInstance.map, /* default */{ shouldFocus: false } ), marker );
									}
									if ( typeof stopGeocodeTask === 'function' ) {
										stopGeocodeTask();
									}
								}
							);
						} )/* run */();
					}
				}
			});

			$us.$canvas.on( 'contentChange', self._events.redraw );

			// Note: In case some toggler was opened before the actual page load
			$us.$window.on( 'load', self._events.redraw );
		},

		/**
		 * Get the address coordinates through the reverse call function
		 *
		 * @param {String} uniqid The unique iteration id
		 * @param {String} address The address
		 * @param {Function} callback The callback
		 *
		 * @link https://developers.google.com/maps/documentation/javascript/geocoding
		 */
		_mapGeoCode: function( uniqid, address, callback ) {
			var self = this;
			GMaps.geocode( {
				address: address,
				callback: function( results, status ) {
					if ( status == 'OK' ) {
						var location = results[0].geometry.location;
						if ( typeof callback === 'function' ) {
							callback.call( _null, location.lat(), location.lng(), results );
						}
						$us._wGmapsGeocodes.remove( uniqid );
					} else if ( status == 'OVER_QUERY_LIMIT' ) {
						$ush.timeout( $us._wGmapsGeocodes.bind( _null, uniqid ), 2000 );
					}
				}
			} );
		},

		/**
		 * Map redraw
		 * Note: Fixing hidden and other breaking-cases maps
		 *
		 * @event handler
		 */
		_redraw: function() {
			var self = this;
			if ( self.$container.is( ':hidden' ) ) {
				return;
			}
			self.$container.css( { height: '', width: '' } );
			self._mapInstance.refresh();
			var latitude = $ush.parseFloat( self.options.latitude ),
				longitude = $ush.parseFloat( self.options.longitude );
			if ( latitude && longitude ) {
				self._mapInstance.setCenter( latitude, longitude );
			}
		},

		/**
		 * Initializes the Maps API load, which calls `self._init()`
		 */
		_initAftetGmapLoaded: function() {
			var $script = $( 'script#us-google-maps:first' );
			if ( ! $script.is( '[data-src]' ) ) { // Check if there is a data-src to the script
				return;
			}
			$script
				.attr( 'src', ( '' + $script.data( 'src' ) ).replace( '&#038;', '&' ) )
				.removeAttr( 'data-src' );
		}
	} );

	/**
	 * Wrapper for jQuery
	 *
	 * @param {{}} options The map options
	 * @return self
	 */
	$.fn.wGmaps = function( options ) {
		options = options || {};
		return this.each( function() {
			this._wGmaps = new $us.wGmaps( this, $ush.clone( options ) );
		} );
	};

	// Initializing an element after loading a document
	$( function() {
		$( '.w-map.provider_google' ).wGmaps();
	} );

}( jQuery );
