var _document = document,
	_navigator = navigator,
	_undefined = undefined,
	_window = window;

/*!
 * imagesLoaded PACKAGED v4.1.4
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */
!function(a,b){"function"==typeof define&&define.amd?define("ev-emitter/ev-emitter",b):"object"==typeof module&&module.exports?module.exports=b():a.EvEmitter=b()}("undefined"==typeof window?this:window,function(){function a(){}var b=a.prototype;return b.on=function(a,b){if(a&&b){var c=this._events=this._events||{},d=c[a]=c[a]||[];return-1==d.indexOf(b)&&d.push(b),this}},b.once=function(a,b){if(a&&b){this.on(a,b);var c=this._onceEvents=this._onceEvents||{},d=c[a]=c[a]||{};return d[b]=!0,this}},b.off=function(a,b){var c=this._events&&this._events[a];if(c&&c.length){var d=c.indexOf(b);return-1!=d&&c.splice(d,1),this}},b.emitEvent=function(a,b){var c=this._events&&this._events[a];if(c&&c.length){c=c.slice(0),b=b||[];for(var d=this._onceEvents&&this._onceEvents[a],e=0;e<c.length;e++){var f=c[e],g=d&&d[f];g&&(this.off(a,f),delete d[f]),f.apply(this,b)}return this}},b.allOff=function(){delete this._events,delete this._onceEvents},a}),function(a,b){"use strict";"function"==typeof define&&define.amd?define(["ev-emitter/ev-emitter"],function(c){return b(a,c)}):"object"==typeof module&&module.exports?module.exports=b(a,require("ev-emitter")):a.imagesLoaded=b(a,a.EvEmitter)}("undefined"==typeof window?this:window,function(b,c){function f(a,b){for(var c in b)a[c]=b[c];return a}function g(b){if(Array.isArray(b))return b;var c="object"==typeof b&&"number"==typeof b.length;return c?a.call(b):[b]}function j(a,b,c){if(!(this instanceof j))return new j(a,b,c);var d=a;return"string"==typeof a&&(d=document.querySelectorAll(a)),d?(this.elements=g(d),this.options=f({},this.options),"function"==typeof b?c=b:f(this.options,b),c&&this.on("always",c),this.getImages(),l&&(this.jqDeferred=new l.Deferred),void setTimeout(this.check.bind(this))):void m.error("Bad element for imagesLoaded "+(d||a))}function i(a){this.img=a}function k(a,b){this.url=a,this.element=b,this.img=new Image}var l=b.jQuery,m=b.console,a=Array.prototype.slice;j.prototype=Object.create(c.prototype),j.prototype.options={},j.prototype.getImages=function(){this.images=[],this.elements.forEach(this.addElementImages,this)},j.prototype.addElementImages=function(a){"IMG"==a.nodeName&&this.addImage(a),!0===this.options.background&&this.addElementBackgroundImages(a);var b=a.nodeType;if(b&&d[b]){for(var c,e=a.querySelectorAll("img"),f=0;f<e.length;f++)c=e[f],this.addImage(c);if("string"==typeof this.options.background){var g=a.querySelectorAll(this.options.background);for(f=0;f<g.length;f++){var h=g[f];this.addElementBackgroundImages(h)}}}};var d={1:!0,9:!0,11:!0};return j.prototype.addElementBackgroundImages=function(a){var b=getComputedStyle(a);if(b)for(var c,d=/url\((['"])?(.*?)\1\)/gi,e=d.exec(b.backgroundImage);null!==e;)c=e&&e[2],c&&this.addBackground(c,a),e=d.exec(b.backgroundImage)},j.prototype.addImage=function(a){var b=new i(a);this.images.push(b)},j.prototype.addBackground=function(a,b){var c=new k(a,b);this.images.push(c)},j.prototype.check=function(){function a(a,c,d){setTimeout(function(){b.progress(a,c,d)})}var b=this;return this.progressedCount=0,this.hasAnyBroken=!1,this.images.length?void this.images.forEach(function(b){b.once("progress",a),b.check()}):void this.complete()},j.prototype.progress=function(a,b,c){this.progressedCount++,this.hasAnyBroken=this.hasAnyBroken||!a.isLoaded,this.emitEvent("progress",[this,a,b]),this.jqDeferred&&this.jqDeferred.notify&&this.jqDeferred.notify(this,a),this.progressedCount==this.images.length&&this.complete(),this.options.debug&&m&&m.log("progress: "+c,a,b)},j.prototype.complete=function(){var a=this.hasAnyBroken?"fail":"done";if(this.isComplete=!0,this.emitEvent(a,[this]),this.emitEvent("always",[this]),this.jqDeferred){var b=this.hasAnyBroken?"reject":"resolve";this.jqDeferred[b](this)}},i.prototype=Object.create(c.prototype),i.prototype.check=function(){var a=this.getIsImageComplete();return a?void this.confirm(0!==this.img.naturalWidth,"naturalWidth"):(this.proxyImage=new Image,this.proxyImage.addEventListener("load",this),this.proxyImage.addEventListener("error",this),this.img.addEventListener("load",this),this.img.addEventListener("error",this),void(this.proxyImage.src=this.img.src))},i.prototype.getIsImageComplete=function(){return this.img.complete&&this.img.naturalWidth},i.prototype.confirm=function(a,b){this.isLoaded=a,this.emitEvent("progress",[this,this.img,b])},i.prototype.handleEvent=function(a){var b="on"+a.type;this[b]&&this[b](a)},i.prototype.onload=function(){this.confirm(!0,"onload"),this.unbindEvents()},i.prototype.onerror=function(){this.confirm(!1,"onerror"),this.unbindEvents()},i.prototype.unbindEvents=function(){this.proxyImage.removeEventListener("load",this),this.proxyImage.removeEventListener("error",this),this.img.removeEventListener("load",this),this.img.removeEventListener("error",this)},k.prototype=Object.create(i.prototype),k.prototype.check=function(){this.img.addEventListener("load",this),this.img.addEventListener("error",this),this.img.src=this.url;var a=this.getIsImageComplete();a&&(this.confirm(0!==this.img.naturalWidth,"naturalWidth"),this.unbindEvents())},k.prototype.unbindEvents=function(){this.img.removeEventListener("load",this),this.img.removeEventListener("error",this)},k.prototype.confirm=function(a,b){this.isLoaded=a,this.emitEvent("progress",[this,this.element,b])},j.makeJQueryPlugin=function(a){a=a||b.jQuery,a&&(l=a,l.fn.imagesLoaded=function(a,b){var c=new j(this,a,b);return c.jqDeferred.promise(l(this))})},j.makeJQueryPlugin(),j});

/*
 * jQuery Easing v1.4.1 - http://gsgd.co.uk/sandbox/jquery/easing/
 * Open source under the BSD License.
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 * https://raw.github.com/gdsmith/jquery-easing/master/LICENSE
*/
jQuery.easing.jswing=jQuery.easing.swing;var pow=Math.pow;jQuery.extend(jQuery.easing,{def:"easeOutExpo",easeInExpo:function(a){return 0===a?0:pow(2,10*a-10)},easeOutExpo:function(a){return 1===a?1:1-pow(2,-10*a)},easeInOutExpo:function(a){return 0===a?0:1===a?1:.5>a?pow(2,20*a-10)/2:(2-pow(2,-20*a+10))/2}});

// UpSolution Theme Core
_window.$us = _window.$us || {};

// UpSolution Helper Library
_window.$ush = _window.$ush || {};

/**
 * Determines if the device is iOS
 *
 * @return {Boolean} True if iOS device, False otherwise
 */
$us.iOS = (
	/^iPad|iPhone|iPod/.test( _navigator.platform )
	// iPad on iOS 13 detection
	|| (
		_navigator.userAgent.indexOf( 'Mac' ) > -1
		&& _navigator.maxTouchPoints > 1
		&& $ush.isTouchend
	)
);

// Note: The variable is needed for the page-scroll.js file which changes only in menu.js
$us.mobileNavOpened = 0;

// The parameters that are in the code but not applied in the absence of a header
// When connecting header, correct parameters will be loaded
$us.header = {};
[
	'getCurrentHeight',
	'getHeaderInitialPos',
	'getHeight',
	'getScrollDirection',
	'getScrollTop',
	'isFixed',
	'isHidden',
	'isHorizontal',
	'isStatic',
	'isSticky',
	'isStickyAutoHidden',
	'stickyAutoHideEnabled',
	'stickyEnabled',
	'isTransparent',
	'isVertical',
	'on'
].map( ( name ) => {
	$us.header[ name ] = jQuery.noop;
} );

/**
 * Retrieve/set/erase dom modificator class <mod>_<value> for UpSolution CSS Framework
 * @param {String} mod Modificator namespace
 * @param {String} [value] Value
 * @returns {String|self}
 */
jQuery.fn.usMod = function( mod, value ) {
	const self = this;
	if ( self.length == 0 ) return self;
	// Retrieve modificator (The modifier will only be obtained from the first node)
	if ( value === _undefined ) {
		const pcre = new RegExp( '^.*?' + mod + '_([\dA-z_-]+).*?$' );
		return ( pcre.exec( self.get( 0 ).className ) || [] )[ 1 ] || false;
	}
	// Set/Remove class modificator
	self.each( ( _, item ) => {
		// Remove class modificator
		item.className = item.className.replace( new RegExp( '(^| )' + mod + '_[\dA-z_-]+( |$)' ), '$2' );
		if ( value !== false ) {
			item.className += ' ' + mod + '_' + value;
		}
	} );
	return self;
};

/**
 * Determines whether animation is available or not
 * @param {String} animationName The ease animation name
 * @param {String} defaultAnimationName The default animation name
 * @return {String}
 */
$us.getAnimationName = function( animationName, defaultAnimationName ) {
	if ( jQuery.easing.hasOwnProperty( animationName ) ) {
		return animationName;
	}
	return defaultAnimationName
		? defaultAnimationName
		: jQuery.easing._default;
};

// Prototype mixin for all classes working with events
// TODO: Replace with $ush.mixinEvents
$us.mixins = {};
$us.mixins.Events = {
	/**
	 * Attach a handler to an event for the class instance
	 * @param {String} eventType A string containing event type, such as 'beforeShow' or 'change'
	 * @param {Function} handler A function to execute each time the event is triggered
	 */
	on: function( eventType, handler ) {
		const self = this;
		if ( self.$$events === _undefined ) {
			self.$$events = {};
		}
		if ( self.$$events[ eventType ] === _undefined ) {
			self.$$events[ eventType ] = [];
		}
		self.$$events[ eventType ].push( handler );
		return self;
	},
	/**
	 * Remove a previously-attached event handler from the class instance
	 * @param {String} eventType A string containing event type, such as 'beforeShow' or 'change'
	 * @param {Function} [handler] The function that is to be no longer executed.
	 * @chainable
	 */
	off: function( eventType, handler ) {
		const self = this;
		if ( self.$$events === _undefined || self.$$events[ eventType ] === _undefined ) {
			return self;
		}
		if ( handler !== _undefined ) {
			var handlerPos = jQuery.inArray( handler, self.$$events[ eventType ] );
			if ( handlerPos != - 1 ) {
				self.$$events[ eventType ].splice( handlerPos, 1 );
			}
		} else {
			self.$$events[ eventType ] = [];
		}
		return self;
	},
	/**
	 * Execute all handlers and behaviours attached to the class instance for the given event type
	 * @param {String} eventType A string containing event type, such as 'beforeShow' or 'change'
	 * @param {Array} extraParameters Additional parameters to pass along to the event handler
	 * @chainable
	 */
	trigger: function( eventType, extraParameters ) {
		const self = this;
		if ( self.$$events === _undefined || self.$$events[ eventType ] === _undefined || self.$$events[ eventType ].length == 0 ) {
			return self;
		}
		var args = arguments,
			params = ( args.length > 2 || ! Array.isArray( extraParameters ) )
				? Array.prototype.slice.call( args, 1 )
				: extraParameters;
		// First argument is the current class instance
		params.unshift( self );
		for ( var index = 0; index < self.$$events[ eventType ].length; index ++ ) {
			self.$$events[ eventType ][ index ].apply( self.$$events[ eventType ][ index ], params );
		}
		return self;
	}
};

/**
 * Determines if mobile
 * Note: Fixing hovers for devices with both mouse and touch screen
 *
 * @return {Boolean} True if mobile, False otherwise
 */
jQuery.isMobile = (
	/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test( _navigator.userAgent )
	|| ( _navigator.platform == 'MacIntel' && _navigator.maxTouchPoints > 1 )
);

/**
 * Commonly used jQuery objects
 */
! function( $ ) {
	$us.$window = $( _window );
	$us.$document = $( _document );
	$us.$html = $( 'html' );
	$us.$body = $( '.l-body:first' );
	$us.$htmlBody = $us.$html.add( $us.$body );
	$us.$canvas = $( '.l-canvas:first' );

	/**
	 * Determines if context of Live Builder.
	 *
	 * @return {Boolean} True if context of Live Builder, False otherwise.
	 */
	$us.usbPreview = () => {
		return _document.body.className.includes( 'usb_preview' );
	};

	// Add class to define touch devices
	if ( $us.iOS ) {
		// For all iOS devices
		$us.$html.removeClass( 'no-touch' ).addClass( 'ios-touch' );

	} else if ( $.isMobile || $ush.isTouchend ) {
		// For all mobile or supported touch devices
		$us.$html.removeClass( 'no-touch' ).addClass( 'touch' );
	} else {
		// All other devices without touch support
	}

}( jQuery );

/**
 * Helper Global Methods
 */
! function( $ ) {
	/**
	 * Get the current state.
	 *
	 * @return {String} Returns the current state (default|laptops|tablets|mobiles).
	 */
	$us.getCurrentState = () => {
		return $ush.toString( $us.$body.usMod( 'state' ) );
	};

	/**
	 * Checks if given state is current state.
	 *
	 * @param {String|[]} state State to be compared with.
	 * @return {Boolean} True if the state matches, False otherwise.
	 */
	$us.currentStateIs = ( state ) => {
		if ( ! state ) {
			return false;
		}
		if ( ! Array.isArray( state ) ) {
			state = [ $ush.toString( state ) ];
		}
		return state.includes( $us.getCurrentState() );
	};

	/**
	 * Get the admin bar height.
	 *
	 * @return {Number} Returns the height of the admin bar if it exists.
	 */
	$us.getAdminBarHeight = () => {
		return ( _document.getElementById('wpadminbar') || {} ).offsetHeight || 0;
	};
} ( jQuery );

/**
 * $us.canvas
 *
 * All the needed data and functions to work with overall canvas.
 *
 * TODO: Check all data that is linked from `$us.header` and use the functionality
 * of object `$us.header` and clear the current object.
 */
! function( $ ) {
	"use strict";

	function USCanvas( options ) {
		const self = this;

		// Setting options
		const defaults = {
			disableEffectsWidth: 900,
			backToTopDisplay: 100
		};

		self.options = $.extend( {}, defaults, options || {} );

		// Commonly used dom elements
		self.$header = $( '.l-header', $us.$canvas );
		self.$main = $( '.l-main', $us.$canvas );
		// Content sections
		self.$sections = $( '> *:not(.l-header) .l-section', $us.$canvas );
		self.$firstSection = self.$sections.first();
		self.$secondSection = self.$sections.eq( 1 );
		self.$stickySections = self.$sections.filter( '.type_sticky:visible' );
		self.$fullscreenSections = self.$sections.filter( '.full_height' );
		self.$topLink = $( '.w-toplink' );

		// Canvas modificators
		self.type = $us.$canvas.usMod( 'type' );
		// Initial header position
		self._headerPos = self.$header.usMod( 'pos' );
		// Current header position
		self.headerPos = self._headerPos;
		self.headerBg = self.$header.usMod( 'bg' );
		self.rtl = $us.$body.hasClass( 'rtl' );

		// Used to prevent resize events on scroll for Android browsers
		self.isScrolling = false;
		self.isAndroid = /Android/i.test( _navigator.userAgent );

		// Bondable events
		self._events = {
			scroll: self.scroll.bind( self ),
			resize: self.resize.bind( self ),
			toggleClassIsSticky: self.toggleClassIsSticky.bind( self ),
		}

		// If in iframe...
		if ( $us.$body.hasClass( 'us_iframe' ) ) {
			// change links so they lead to main window
			$( 'a:not([target])' ).each( ( _, node ) => $( node ).attr( 'target', '_parent' ) );
			// hide preloader
			$( () => $( '.l-popup-box-content .g-preloader', _window.parent.document ).hide() );
		}

		// Class assignments for adjusting header position via css.
		if ( self.hasStickyFirstSection() ) {
			$us.$body.addClass( 'sticky_first_section' );
		}

		// Events
		$us.$window
			.on( 'scroll.noPreventDefault', self._events.scroll )
			.on( 'resize load', self._events.resize )
			.on( 'scroll.noPreventDefault resize load', self._events.toggleClassIsSticky );

		// Complex logics requires two initial renders: before inner elements render and after
		$ush.timeout( self._events.resize, 25 );
		$ush.timeout( self._events.resize, 75 );
	}

	USCanvas.prototype = {

		/**
		 * Get the offset top.
		 *
		 * @return {Number} The offset top.
		 */
		getOffsetTop: function() {
			var top = Math.ceil( $us.$canvas.offset().top );
			if ( $us.currentStateIs( 'mobiles' ) ) {
				top -= $us.getAdminBarHeight();
			}
			return top;
		},

		/**
		 * Determines if sticky section.
		 *
		 * @return {Boolean} True if sticky section, False otherwise.
		 */
		isStickySection: function() {
			return this.$stickySections.length > 0;
		},

		/**
		 * Determines if there is a sticky active section
		 *
		 * @return {Boolean} True if sticky section, False otherwise.
		 */
		hasStickySection: function () {
			const self = this;
			if ( self.isStickySection() ) {
				return self.$stickySections.hasClass( 'is_sticky' );
			}
			return false
		},

		/**
		 * Determines if position sticky sections.
		 *
		 * @return {Boolean} True if position sticky sections, False otherwise.
		 */
		hasPositionStickySections: function() {
			const self = this;
			if ( self.isStickySection() ) {
				return self.$stickySections
					.filter( ( _, node ) => { return $( node ).css( 'position' ) == 'sticky' } )
					.length > 0;
			}
			return false;
		},

		/**
		 * Get the height first sticky section.
		 *
		 * @return {Number} The height first sticky section.
		 */
		getStickySectionHeight: function() {
			const self = this;
			var stickySectionHeight = 0;
			if ( self.isStickySection() ) {
				var header = $us.header,
					$stickySection = self.$stickySections.first();
				stickySectionHeight = $stickySection.outerHeight( true );
				// If the first section on page is sticky, it has header height added to its padding
				// Subtracting the header height from function return value in this case
				if ( self.hasStickyFirstSection() && header.isHorizontal() && ! header.isStatic() ) {
					stickySectionHeight -= header.getCurrentHeight();
				}
			}
			return stickySectionHeight;
		},

		/**
		 * Determines if sticky first section.
		 *
		 * @return {boolean} True if first sticky section, False otherwise.
		 */
		hasStickyFirstSection: function() {
			const self = this;
			const $first = self.$stickySections.first();
			return self.isStickySection() && $first.index() === 0 && $first.hasClass( 'is_sticky' );
		},

		/**
		 * Checks that the specified section is after the sticky section.
		 *
		 * @param {*} node Start node
		 * @return {Boolean} True if after sticky section, False otherwise.
		 */
		isAfterStickySection: function( node ) {
			var $node = $( node );
			if ( $node.length == 0 ) {
				return false;
			}
			if ( ! $node.hasClass( 'l-section' ) ) {
				$node = $node.closest( '.l-section' );
			}
			return $node.index() > this.$stickySections.index();
		},

		/**
		 * Gets the height first section.
		 *
		 * @return {number} The height first section.
		 */
		getHeightFirstSection: function() {
			return this.$firstSection.length > 0
				? parseFloat( this.$firstSection.outerHeight( true ) )
				: 0;
		},

		/**
		 * Scroll-driven logics
		 *
		 * @event handler
		 */
		scroll: function() {
			const self = this;
			const scrollTop = parseInt( $us.$window.scrollTop() );

			// Show/hide go to top link
			self.$topLink
				.toggleClass( 'active', ( scrollTop >= self.winHeight * self.options.backToTopDisplay / 100 ) );

			if ( self.isAndroid ) {
				if ( self.pid ) {
					$ush.clearTimeout( self.pid );
				}
				self.isScrolling = true;
				self.pid = $ush.timeout( () => {
					self.isScrolling = false;
				}, 100 );
			}
		},

		/**
		 * Resize-driven logics
		 *
		 * @event handler
		 */
		resize: function() {
			const self = this;

			// Window dimensions
			self.winHeight = parseInt( $us.$window.height() );
			self.winWidth = parseInt( $us.$window.width() );

			// Disabling animation on mobile devices
			$us.$body.toggleClass( 'disable_effects', ( self.winWidth < self.options.disableEffectsWidth ) );

			// If the page is loaded in iframe
			if ( $us.$body.hasClass( 'us_iframe' ) ) {
				var $frameContent = $( '.l-popup-box-content', _window.parent.document ),
					outerHeight = $us.$body.outerHeight( true );
				if ( outerHeight > 0 && $( _window.parent ).height() > outerHeight ) {
					$frameContent.css( 'height', outerHeight );
				} else {
					$frameContent.css( 'height', '' );
				}
			}

			// Fix scroll glitches that could occur after the resize
			self.scroll();
		},

		/**
		 * Determining whether a section is fixed sticky or not
		 *
		 * @event handler
		 */
		toggleClassIsSticky: function() {
			const self = this;
			if ( ! self.isStickySection() ) {
				return;
			}
			self.$stickySections.each( ( _, section ) => {
				const $section = $( section );
				const offsetTop = section.getBoundingClientRect().top - parseInt( $section.css( 'top' ) );
				$section
					.toggleClass( 'is_sticky', ( parseInt( offsetTop ) === 0 && $section.css( 'position' ) == 'sticky' ) );
			} );
		}
	};

	$us.canvas = new USCanvas( $us.canvasOptions || {} );

}( jQuery );

/**
 * CSS-analog of jQuery slideDown/slideUp/fadeIn/fadeOut functions (for better rendering)
 */
! function( $ ) {

	/**
	 * Remove the passed inline CSS attributes.
	 *
	 * Usage: `$node.resetInlineCSS( 'height', 'width' )` or `$node.resetInlineCSS( [ 'height', 'width' ] )`
	 */
	$.fn.resetInlineCSS = function() {
		const self = this;
		var args = [].slice.call( arguments );
		if ( args.length > 0 && Array.isArray( args[0] ) ) {
			args = args[0];
		}
		for ( var index = 0; index < args.length; index++ ) {
			self.css( args[ index ], '' );
		}
		return self;
	};

	$.fn.clearPreviousTransitions = function() {
		const self = this;
		// Stopping previous events, if there were any
		const prevTimers = ( self.data( 'animation-timers' ) || '' ).split( ',' );
		if ( prevTimers.length >= 2 ) {
			self.resetInlineCSS( 'transition' );
			prevTimers.map( clearTimeout );
			self.removeData( 'animation-timers' );
		}
		return self;
	};

	/**
	 *
	 * @param {Object} css key-value pairs of animated css
	 * @param {Number} duration in milliseconds
	 * @param {Function} onFinish
	 * @param {String} easing CSS easing name
	 * @param {Number} delay in milliseconds
	 */
	$.fn.performCSSTransition = function( css, duration, onFinish, easing, delay ) {
		const self = this;

		var transition = [];

		duration = duration || 250;
		delay = delay || 25;
		easing = easing || 'ease';

		self.clearPreviousTransitions();

		for ( const attr in css ) {
			if ( ! css.hasOwnProperty( attr ) ) {
				continue;
			}
			transition.push( attr + ' ' + ( duration / 1000 ) + 's ' + easing );
		}
		transition = transition.join( ', ' );
		self.css( {
			transition: transition
		} );

		// Starting the transition with a slight delay for the proper application of CSS transition properties
		const timer1 = setTimeout( () => self.css( css ), delay );
		const timer2 = setTimeout( () => {
			self.resetInlineCSS( 'transition' );
			if ( typeof onFinish === 'function' ) {
				onFinish();
			}
		}, duration + delay );

		self.data( 'animation-timers', timer1 + ',' + timer2 );
	};

	// Height animations
	$.fn.slideDownCSS = function( duration, onFinish, easing, delay ) {
		const self = this;
		if ( self.length == 0 ) {
			return;
		}
		self.clearPreviousTransitions();
		// Grabbing paddings
		self.resetInlineCSS( 'padding-top', 'padding-bottom' );
		const timer1 = setTimeout( () => {
			const paddingTop = parseInt( self.css( 'padding-top' ) );
			const paddingBottom = parseInt( self.css( 'padding-bottom' ) );
			// Grabbing the "auto" height in px
			self.css( {
				visibility: 'hidden',
				position: 'absolute',
				height: 'auto',
				'padding-top': 0,
				'padding-bottom': 0,
				display: 'block'
			} );
			var height = self.height();
			self.css( {
				overflow: 'hidden',
				height: '0px',
				opacity: 0,
				visibility: '',
				position: ''
			} );
			self.performCSSTransition( {
				opacity: 1,
				height: height + paddingTop + paddingBottom,
				'padding-top': paddingTop,
				'padding-bottom': paddingBottom
			}, duration, () => {
				self.resetInlineCSS( 'overflow' ).css( 'height', 'auto' );
				if ( typeof onFinish == 'function' ) {
					onFinish();
				}
			}, easing, delay );
		}, 25 );
		self.data( 'animation-timers', timer1 + ',null' );
	};

	$.fn.slideUpCSS = function( duration, onFinish, easing, delay ) {
		const self = this;
		if ( self.length == 0 ) {
			return;
		}
		self.clearPreviousTransitions();
		self.css( {
			height: self.outerHeight(),
			overflow: 'hidden',
			'padding-top': self.css( 'padding-top' ),
			'padding-bottom': self.css( 'padding-bottom' )
		} );
		self.performCSSTransition( {
			height: 0,
			opacity: 0,
			'padding-top': 0,
			'padding-bottom': 0
		}, duration, () => {
			self.resetInlineCSS( 'overflow', 'padding-top', 'padding-bottom' ).css(
				{
					display: 'none'
				}
			);
			if ( typeof onFinish == 'function' ) {
				onFinish();
			}
		}, easing, delay );
	};

	// Opacity animations
	$.fn.fadeInCSS = function( duration, onFinish, easing, delay ) {
		const self = this;
		if ( self.length == 0 ) {
			return;
		}
		self.clearPreviousTransitions();
		self.css( { opacity: 0, display: 'block' } );
		self.performCSSTransition( { opacity: 1 }, duration, onFinish, easing, delay );
	};

	$.fn.fadeOutCSS = function( duration, onFinish, easing, delay ) {
		const self = this;
		if ( self.length == 0 ) {
			return;
		}
		self.performCSSTransition( {
			opacity: 0
		}, duration, () => {
			self.css( 'display', 'none' );
			if ( typeof onFinish === 'function' ) {
				onFinish();
			}
		}, easing, delay );
	};

}( jQuery );

jQuery( function( $ ) {
	"use strict";

	if ( _document.cookie.indexOf( 'us_cookie_notice_accepted=true' ) !== -1 ) {
		$( '.l-cookie' ).remove();

	} else {
		$us.$document .on( 'click', '#us-set-cookie', ( e ) => {
			e.preventDefault();
			e.stopPropagation();
			const d = new Date();
			d.setFullYear( d.getFullYear() + 1 );
			_document.cookie = `us_cookie_notice_accepted=true; expires=${d.toUTCString()}; path=/;`;
			if ( location.protocol === 'https:' ) {
				_document.cookie += ' secure;';
			}
			$( '.l-cookie' ).remove();
		} );
	}

	// Color Scheme Switch
	$( '.w-color-switch input[name=us-color-scheme-switch]' )
		.prop( 'checked', $ush.getCookie( 'us_color_scheme_switch_is_on' ) === 'true' );

	$us.$document.on( 'change', '[name=us-color-scheme-switch]', ( e ) => {
		if ( $ush.getCookie( 'us_color_scheme_switch_is_on' ) === 'true' ) {
			$us.$html.removeClass( 'us-color-scheme-on' );
			$ush.removeCookie( 'us_color_scheme_switch_is_on' );
		} else {
			$us.$html.addClass( 'us-color-scheme-on' );
			$ush.setCookie( 'us_color_scheme_switch_is_on', 'true', 30 );
		}
	} );

	// Force popup opening on links with ref
	function usPopupLink( context, opts ) {
		const $links = $( 'a[ref=magnificPopup][class!=direct-link]:not(.inited)', context || _document );
		const defaultOptions = {
			fixedContentPos: true,
			mainClass: 'mfp-fade',
			removalDelay: 300,
			type: 'image'
		};
		if ( $links.length > 0 ) {
			$links
				.addClass( 'inited' )
				.magnificPopup( $.extend( {}, defaultOptions, opts || {} ) );
		}
	};
	$.fn.wPopupLink = function( opts ) {
		return this.each( function() {
			$( this ).data( 'usPopupLink', new usPopupLink( this, opts ) );
		} );
	};

	$( () => $us.$document.wPopupLink() );

	// Footer Reveal handler
	( function() {
		const $footer = $( '.l-footer' );

		if ( $us.$body.hasClass( 'footer_reveal' ) && $footer.length > 0 && $footer.html().trim().length > 0 ) {
			function usFooterReveal() {
				var footerHeight = $footer.innerHeight();
				if ( _window.innerWidth > parseInt( $us.canvasOptions.columnsStackingWidth ) -1 ) {
					$us.$canvas.css( 'margin-bottom', Math.round( footerHeight ) -1 );
				} else {
					$us.$canvas.css( 'margin-bottom', '' );
				}
			};

			usFooterReveal();
			$us.$window.on( 'resize load', usFooterReveal );
		}
	} )();

	/* YouTube/Vimeo background */
	const $usYTVimeoVideoContainer = $( '.with_youtube, .with_vimeo' );
	if ( $usYTVimeoVideoContainer.length > 0 ) {
		$us.$window.on( 'resize load', () => {
			$usYTVimeoVideoContainer.each( function() {
				var $container = $( this ),
					$frame = $container.find( 'iframe' ).first(),
					cHeight = $container.innerHeight(),
					cWidth = $container.innerWidth(),
					fWidth = '',
					fHeight = '';

				if ( cWidth / cHeight < 16 / 9 ) {
					fWidth = cHeight * ( 16 / 9 );
					fHeight = cHeight;
				} else {
					fWidth = cWidth;
					fHeight = fWidth * ( 9 / 16 );
				}

				$frame.css( {
					'width': Math.round( fWidth ),
					'height': Math.round( fHeight ),
				} );
			} );
		} );
	}
} );

/**
 * $us.waypoints
 */
;( function( $ ) {
	"use strict";

	function USWaypoints() {
		const self = this;

		// Waypoints that will be called at certain scroll position
		self.waypoints = [];

		// Recount scroll waypoints on any content changes
		$us.$canvas
			.on( 'contentChange', self._countAll.bind( self ) );
		$us.$window
			.on( 'resize load', self._events.resize.bind( self ) )
			.on( 'scroll scroll.waypoints', self._events.scroll.bind( self ) );

		$ush.timeout( self._events.resize.bind( self ), 75 );
		$ush.timeout( self._events.scroll.bind( self ), 75 );
	}
	/**
	 * Export API
	 */
	USWaypoints.prototype = {
		// Handler's
		_events: {
			/**
			 * Scroll handler
			 */
			scroll: function() {
				const self = this;
				var scrollTop = parseInt( $us.$window.scrollTop() );

				// Safari negative scroller fix
				scrollTop = ( scrollTop >= 0 ) ? scrollTop : 0;

				// Handling waypoints
				for ( var i = 0; i < self.waypoints.length; i ++ ) {
					if ( self.waypoints[ i ].scrollPos < scrollTop ) {
						self.waypoints[ i ].fn( self.waypoints[ i ].$node );
						self.waypoints.splice( i, 1 );
						i --;
					}
				}
			},
			/**
			 * Resize handler
			 */
			resize: function() {
				const self = this;
				// Delaying the resize event to prevent glitches
				$ush.timeout( () => {
					self._countAll.call( self );
					self._events.scroll.call( self );
				}, 150 );
				self._countAll.call( self );
				self._events.scroll.call( self );
			}
		},
		/**
		 * Add new waypoint
		 *
		 * @param {jQuery} $node object with the element
		 * @param {*} offset Offset from bottom of screen in pixels ('100') or percents ('20%')
		 * @param {Function} fn The function that will be called
		 */
		add: function( $node, offset, fn ) {
			const self = this;
			$node = ( $node instanceof $ ) ? $node : $( $node );
			if ( $node.length == 0 ) {
				return;
			}
			if ( typeof offset != 'string' || offset.indexOf( '%' ) == - 1 ) {
				// Not percent: using pixels
				offset = parseInt( offset );
			}
			// Determining whether an element is already in the scope,
			// if it is visible, reset offset
			if ( $node.offset().top < ( $us.$window.height() + $us.$window.scrollTop() ) ) {
				offset = 0;
			}
			var waypoint = {
				$node: $node, offset: offset, fn: fn
			};
			self._count( waypoint );
			self.waypoints.push( waypoint );
		},
		/**
		 * Count target for proper scrolling
		 *
		 * @param {{}} waypoint
		 */
		_count: function( waypoint ) {
			const elmTop = waypoint.$node.offset().top, winHeight = $us.$window.height();
			if ( typeof waypoint.offset == 'number' ) {
				// Offset is defined in pixels
				waypoint.scrollPos = elmTop - winHeight + waypoint.offset;
			} else {
				// Offset is defined in percents
				waypoint.scrollPos = elmTop - winHeight + winHeight * parseInt( waypoint.offset ) / 100;
			}
		},
		/**
		 * Count all targets for proper scrolling
		 */
		_countAll: function() {
			const self = this;
			// Counting waypoints
			for ( var i = 0; i < self.waypoints.length; i ++ ) {
				self._count( self.waypoints[ i ] );
			}
		}
	};
	$us.waypoints = new USWaypoints;
})( jQuery );

;( function() {
	var lastTime = 0;
	const vendors = ['ms', 'moz', 'webkit', 'o'];
	for ( var x = 0; x < vendors.length && ! _window.requestAnimationFrame; ++ x ) {
		_window.requestAnimationFrame = _window[ vendors[ x ] + 'RequestAnimationFrame' ];
		_window.cancelAnimationFrame = _window[ vendors[ x ] + 'CancelAnimationFrame' ] || _window[ vendors[ x ] + 'CancelRequestAnimationFrame' ];
	}
	if ( ! _window.requestAnimationFrame ) {
		_window.requestAnimationFrame = ( callback, element ) => {
			const currTime = new Date().getTime();
			const timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
			const id = _window.setTimeout( () => callback( currTime + timeToCall ), timeToCall );
			lastTime = currTime + timeToCall;
			return id;
		};
	}
	if ( ! _window.cancelAnimationFrame ) {
		_window.cancelAnimationFrame = ( id ) => clearTimeout( id );
	}
}() );

/*
 * Remove empty space before content for video post type with active preview
 */
! function( $ ) {
	if ( $us.$body.hasClass( 'single-format-video' ) ) {
		$( 'figure.wp-block-embed div.wp-block-embed__wrapper', $us.$body ).each( ( _, node ) => {
			if ( node.firstElementChild === null ) {
				node.remove();
			}
		} );
	}
}( jQuery );

/*
 * With "Show More" link, used in Text Block and Post Content elements
 */
! function( $ ) {
	"use strict";

	function usCollapsibleContent( container ) {
		const self = this;

		/**
		 * @var {{}} Bondable events.
		 */
		self._events = {
			showContent: self.showContent.bind( self ),
		};

		// Elements
		self.$container = $( container );
		self.$firstElement = $( '> *:first', self.$container );
		self.collapsedHeight = self.$container.data( 'content-height' ) || 200;

		// Events
		self.$container
			.on( 'click', '.collapsible-content-more, .collapsible-content-less', self._events.showContent );

		// Init if not in Owl Carousel context
		if ( self.$container.closest( '.owl-carousel' ).length == 0 ) {
			self.setHeight.call( self );
		}
	};

	// Collapsible Content API
	usCollapsibleContent.prototype = {

		setHeight: function() {
			const self = this;

			// Set the height to the element in any unit of measurement and get the height in pixels
			let collapsedHeight = self.$firstElement.css( 'height', self.collapsedHeight ).height();
			self.$firstElement.css( 'height', '' );
			let heightFirstElement = self.$firstElement.height();

			if ( heightFirstElement && heightFirstElement <= collapsedHeight ) {
				$( '.toggle-links', self.$container ).hide();
				self.$firstElement.css( 'height', '' );
				self.$container.removeClass( 'with_collapsible_content' );
			} else {
				$( '.toggle-links', self.$container ).show();
				self.$firstElement.css( 'height', self.collapsedHeight );
			}
		},

		/**
		 * Toggle show or hide content.
		 *
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 */
		showContent: function( e ) {
			const self = this;

			e.preventDefault();
			e.stopPropagation();

			self.$container
				.toggleClass( 'show_content', $( e.target ).hasClass( 'collapsible-content-more' ) )
				.trigger( 'showContent' );
			$ush.timeout( () => {
				$us.$canvas.trigger( 'contentChange' );
				if ( $.isMobile && ! $ush.isNodeInViewport( self.$container[0] ) ) {
					$us.$htmlBody
						.stop( true, false )
						.scrollTop( self.$container.offset().top - $us.header.getCurrentHeight( /* adminBar */true ) );
				}
			}, 1 );
		}
	};

	$.fn.usCollapsibleContent = function() {
		return this.each( function() {
			$( this ).data( 'usCollapsibleContent', new usCollapsibleContent( this ) );
		} );
	};

	$( '[data-content-height]', $us.$canvas ).usCollapsibleContent();

	// Init in Post\Product List or Grid context
	$us.$document.on( 'usPostList.itemsLoaded usGrid.itemsLoaded', ( _, $items ) => {
		$( '[data-content-height]', $items ).usCollapsibleContent();
	} );

	/**
	 * Additional event validation for scanned Owl Carousel items
	 */
	if ( $( '.owl-carousel', $us.$canvas ).length > 0 ) {
		$us.$canvas.on( 'click', '.collapsible-content-more, .collapsible-content-less', ( e ) => {
			const $target = $( e.target );
			const $container = $target.closest( '[data-content-height]' );
			if ( ! $container.data( 'usCollapsibleContent' ) ) {
				$container.usCollapsibleContent();
				$target.trigger( 'click' );
			}
		} );
	}

}( jQuery );

/**
 * Will fire the original resize event so that the video element
 * recalculates the width and height of the player in WPopup
 */
! function( $ ) {
	$us.$window.on( 'us.wpopup.afterShow', ( _, WPopup ) => {
		if ( WPopup instanceof $us.WPopup && $( 'video.wp-video-shortcode', WPopup.$box ).length > 0 ) {
			const handle = $ush.timeout( () => {
				$ush.clearTimeout( handle );
				_window.dispatchEvent( new Event( 'resize' ) );
			}, 1 );
		}
	} );
}( jQuery );

/**
 * Scrollbar settings for all popups
 */
! function( $ ) {
	"use strict";

	$us.scrollbarWidth = function( force ) {
		const self = this;
		if ( $ush.isUndefined( self.width ) || force ) {
			const scrollDiv = _document.createElement( 'div' );
			scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
			_document.body.appendChild( scrollDiv );
			self.width = scrollDiv.offsetWidth - scrollDiv.clientWidth;
			_document.body.removeChild( scrollDiv );
		}
		return self.width;
	};

	if ( $.magnificPopup ) {

		// Override MagnificPopup methods
		const origMfpOpen = $.magnificPopup.proto.open;
		const origMfpClose = $.magnificPopup.proto.close;

		$.magnificPopup.proto.open = function() {
			const result = origMfpOpen.apply( this, arguments );
			$us.$html.removeAttr( 'style' );
			$us.$document.trigger( 'usPopupOpened', this );
			return result;
		};

		$.magnificPopup.proto.close = function() {
			const result = origMfpClose.apply( this, arguments );
			$us.$document.trigger( 'usPopupClosed', this );
			return result;
		};
	}

	$us.$document.on( 'usPopupOpened', () => {
		$us.$html.addClass( 'us_popup_is_opened' );
		if ( ! $.isMobile && $us.$html[0].scrollHeight > $us.$html[0].clientHeight ) {
			const scrollbarWidth = $us.scrollbarWidth();
			if ( scrollbarWidth ) {
				$us.$html.css( '--scrollbar-width', scrollbarWidth + 'px' );
			}
		}
	} );

	$us.$document.on( 'usPopupClosed', () => {
		$us.$html.removeClass( 'us_popup_is_opened' );
		if ( ! $.isMobile ) {
			$us.$html.css( '--scrollbar-width', '' );
		}
	} );

}( jQuery );
