! ( function( $, _undefined ) {

	const $ush = window.$ush || {};

	/**
	 * UpSolution WooCommerce elements
	 * Note: All classes and key elements from WooCommerce are retained
	 *
	 * The code depends on:
	 * 	- `../plugins/woocommerce/assets/js/frontend/cart.js`
	 * 	- `../plugins/woocommerce/assets/js/frontend/checkout.js`
	 *
	 * @param container
	 * @requires $us.$body
	 * @requires $us.$canvas
	 * @requires $ush.debounce
	 * @requires $ush.timeout
	 * @constructor
	 */
	function WooCommerce() {
		const self = this;

		// Elements
		self.$cart = $( '.w-cart' );
		self.$notice = $( '.w-wc-notices.woocommerce-notices-wrapper:first', $us.$canvas )
		self.$addToCart = $( '.w-post-elm.add_to_cart', $us.$canvas );

		// Private "Variables"
		self._activeJqXHR = {}; // This is the object of the last ajax request
		self._cartOpened = false;
		self._removeProcesses = 0; // Number of remove processes simultaneously

		// Event handlers
		self._events = {
			addToCart: self._addToCart.bind( self ),
			applyCouponCode: self._applyCouponCode.bind( self ),
			changeCartQuantity: self.changeCartQuantity.bind( self ),
			changedFragments: self._changedFragments.bind( self ),
			couponCodeChange: self._couponCodeChange.bind( self ),
			couponDisplaySwitch: self._couponDisplaySwitch.bind( self ),
			enterCouponCode: self._enterCouponCode.bind( self ),
			minusCartQuantity: self._minusCartQuantity.bind( self ),
			moveNotifications: self._moveNotifications.bind( self ),
			outsideClickEvent: self._outsideClickEvent.bind( self ),
			plusCartQuantity: self._plusCartQuantity.bind( self ),
			removeCartItem: self._removeCartItem.bind( self ),
			updateCart: self._updateCart.bind( self ),
			updatedCartTotals: self._updatedCartTotals.bind( self ),
			showLoginForm: self._showLoginForm.bind( self ),
			submitLoginForm: self._submitLoginForm.bind( self ),
			loginFieldKeydown: self._loginFieldKeydown.bind( self )
		};

		// Init cart elements
		if ( self.isCart() ) {
			// Cart elements
			self.$cartNotification = $( '.w-cart-notification', self.$cart );

			// Events
			self.$cartNotification.on( 'click', () => {
				self.$cartNotification.fadeOutCSS();
			} );

			// Handler of outside click for mobile devices
			if ( $.isMobile ) {
				self.$cart.on( 'click', '.w-cart-link', ( e ) => {
					if ( ! self._cartOpened ) {
						e.preventDefault();
						self.$cart.addClass( 'opened' );
						$us.$body.on( 'touchstart.noPreventDefault', self._events.outsideClickEvent );
					} else {
						self.$cart.removeClass( 'opened' );
						$us.$body.off( 'touchstart', self._events.outsideClickEvent );
					}
					self._cartOpened = ! self._cartOpened;
				} );
			}

			$us.$body
				// Events of `../plugins/woocommerce/assets/js/frontend/add-to-cart.js`,
				// `../plugins/woocommerce/assets/js/frontend/cart-fragments.js`
				.on( 'wc_fragments_loaded wc_fragments_refreshed', self._events.changedFragments )
				// Events of `../plugins/woocommerce/assets/js/frontend/add-to-cart.js`
				.on( 'added_to_cart', self._events.addToCart )
				.on( 'removed_from_cart', self._events.updateCart );
		}
		if ( self.isCartPage() ) {
			// Events
			$us.$body
				.on( 'change initControls', 'input.qty', self._events.changeCartQuantity )
				.on( 'change', '.w-wc-coupon-form input', self._events.couponCodeChange )
				.on( 'keyup', '.w-wc-coupon-form input', self._events.enterCouponCode )
				.on( 'click', '.w-wc-coupon-form button', self._events.applyCouponCode )
				.on( 'click', 'a.remove', self._events.removeCartItem )
				.on( 'click', 'input.minus', self._events.minusCartQuantity )
				.on( 'click', 'input.plus', self._events.plusCartQuantity )
				// Events of `../plugins/woocommerce/assets/js/frontend/cart.js`
				.on( 'applied_coupon removed_coupon', self._events.couponDisplaySwitch )
				.on( 'updated_cart_totals', self._events.updatedCartTotals );

			// Initializing controls after the ready document
			$( 'input.qty', $us.$canvas ).trigger( 'initControls' );

			// Get the last active request for cart updates
			$.ajaxPrefilter( ( _, originalOptions, jqXHR ) => {
				const data = $ush.toString( originalOptions.data );
				if ( data.indexOf( '&update_cart' ) > -1 ) {
					self._activeJqXHR.updateCart = jqXHR;
				}
				// Distance information updates in shortcode `[us_cart_shipping]`
				if ( data.indexOf( '&us_calc_shipping' ) > -1 ) {
					jqXHR.done( ( res ) => {
						$( '.w-cart-shipping .woocommerce-shipping-destination' )
							.html( $( '.w-cart-shipping:first .woocommerce-shipping-destination', res ).html() );
					} );
				}
			} );

			$( '.w-cart-shipping form.woocommerce-shipping-calculator', $us.$canvas )
				.append( '<input type="hidden" name="us_calc_shipping">' );
		}
		if ( self.isCheckoutPage() ) {
			// Events
			$us.$body
				.on( 'change', '.w-wc-coupon-form input', self._events.couponCodeChange )
				.on( 'keyup', '.w-wc-coupon-form input', self._events.enterCouponCode )
				.on( 'click', '.w-wc-coupon-form button', self._events.applyCouponCode )
				// Events of `../plugins/woocommerce/assets/js/frontend/checkout.js`
				.on( 'applied_coupon_in_checkout removed_coupon_in_checkout', self._events.couponDisplaySwitch )
				.on( 'applied_coupon_in_checkout removed_coupon_in_checkout checkout_error', self._events.moveNotifications )
				.on( 'click', '.w-checkout-login .showlogin', self._events.showLoginForm )
				.on( 'click', '.w-checkout-login button', self._events.submitLoginForm )
				.on( 'keydown', '.w-checkout-login input, .w-checkout-login button', self._events.loginFieldKeydown );

			// Blocks the form from being submitted if the coupon field is in focus
			// and the Enter key is pressed, this allows the coupon to be applied
			// correctly, otherwise the form will simply be submitted.
			const $couponField = $( '.w-wc-coupon-form input', $us.$canvas );
			$us.$document.on( 'keypress', ( e ) => {
				if ( e.keyCode === $ush.ENTER_KEYCODE && $couponField.is( ':focus' ) ) {
					e.preventDefault();
				}
			});
		}

		// Input quantity on product page
		if ( self.$addToCart.length > 0 ) {
			$us.$body
				.on( 'click', 'input.minus', self._events.minusCartQuantity )
				.on( 'click', 'input.plus', self._events.plusCartQuantity )
				.on( 'change initControls', 'input.qty', self._events.changeCartQuantity )
		}

		// Intercept messages after apply a coupon
		$us.$document.on( 'ajaxComplete', ( _, jqXHR, settings ) => {
			if ( ! $ush.toString( settings.url ).includes( 'wc-ajax=apply_coupon' ) ) {
				return;
			}
			const $fragment = $( new DocumentFragment ).append( jqXHR.responseText );
			const $message = $( '.woocommerce-error, .woocommerce-message', $fragment );
			if ( $message.length > 0 ) {
				self.$notice.html( $message.clone() );
			} else {
				self.$notice.html( '' );
			}
		} );
	};

	/**
	 * Export API
	 */
	$.extend( WooCommerce.prototype, {

		/**
		 * Determines if cart
		 *
		 * @return {boolean} True if cartesian, False otherwise.
		 */
		isCart: function() {
			return this.$cart.length > 0;
		},

		/**
		 * Determines if current cartesian page
		 *
		 * @return {boolean} True if current cartesian page, False otherwise.
		 */
		isCartPage: function() {
			return $us.$body.hasClass( 'woocommerce-cart' );
		},

		/**
		 * Determines if current checkout page
		 *
		 * @return {boolean} True if current checkout page, False otherwise
		 */
		isCheckoutPage: function() {
			return $us.$body.hasClass( 'woocommerce-checkout' );
		},

		/**
		 * Update cart element
		 */
		_updateCart: function() {
			const self = this;
			$.each( self.$cart, ( _, cart ) => {
				var $cart = $( cart ),
					$cartQuantity = $( '.w-cart-quantity', $cart ),
					miniCartAmount = $( '.us_mini_cart_amount:first', $cart ).text();

				if ( $cart.hasClass( 'opened' ) ) {
					$cart.removeClass( 'opened' );
				}

				if ( miniCartAmount !== _undefined ) {
					miniCartAmount = String( miniCartAmount ).match( /\d+/g );
					$cartQuantity.html( miniCartAmount > 0 ? miniCartAmount : '0' );
					$cart[ miniCartAmount > 0 ? 'removeClass' : 'addClass' ]( 'empty' );
				} else {
					// fallback in case our action wasn't fired somehow
					var total = 0;
					$( '.quantity', $cart ).each( ( _, quantity ) => {
						var matches = String( quantity.innerText ).match( /\d+/g );

						if ( matches ) {
							total += parseInt( matches[ 0 ], 10 );
						}
					} );
					$cartQuantity.html( total > 0 ? total : '0' );
					$cart[ total > 0 ? 'removeClass' : 'addClass' ]( 'empty' );
				}
			} );
		},

		/**
		 * Handler for tracking changed fragments
		 *
		 * @event handler
		 */
		_changedFragments: function() {
			const self = this;
			self._updateCart();
		},

		/**
		 * Add a product to the cart
		 *
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 * @param {{} fragments The fragments
		 * @param {node} $button The button
		 */
		_addToCart: function( e, fragments, _, $button ) {
			if ( $ush.isUndefined( e ) ) {
				return;
			}
			const self = this;

			// Update cart element
			self._updateCart();

			var $notification = self.$cartNotification,
				$productName = $( '.product-name', $notification ),
				productName = $productName.text();

			productName = $button
				.closest( '.product' )
				.find( '.woocommerce-loop-product__title' )
				.text();

			$productName.html( productName );

			$notification.addClass( 'shown' );
			$notification.on( 'mouseenter', () => {
				$notification.removeClass( 'shown' );
			} );

			$ush.timeout( () => {
				$notification
					.removeClass( 'shown' )
					.off( 'mouseenter' );
			}, 3000 );
		},

		/**
		 * Handler for outside click events for mobile devices
		 * Note: Designed for mobile devices
		 *
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 */
		_outsideClickEvent: function( e ) {
			const self = this;
			if ( $.contains( self.$cart[0], e.target ) ) {
				return;
			}
			self.$cart.removeClass( 'opened' );
			$us.$body.off( 'touchstart', self._events.outsideClickEvent );
			self._cartOpened = false;
		},

		/**
		 * Handler when remove a item
		 *
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 */
		_removeCartItem: function( e ) {
			var $item = $( e.target )
				.closest( '.cart_item' )
				.addClass( 'change_process' );
			// If the element is the last, then delete the table for correct operation `cart.js:update_wc_div`
			if ( ! $item.siblings( '.cart_item:not(.change_process)' ).length ) {
				$( '.w-cart-table', $us.$canvas ).remove();
			}
		},

		/**
		 * Check and set quantity
		 *
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 */
		changeCartQuantity: function( e ) {

			if ( $us.usbPreview() ) {
				return;
			}

			const self = this;

			const $input = $( e.target );
			const isGroupTable = $input.closest( '.cart' ).hasClass( 'grouped_form' );
			const max = $ush.parseInt( $input.attr( 'max' ) ) || -1;
			const min = $ush.parseInt( $input.attr( 'min' ) ) || ( isGroupTable ? 0 : 1 );

			var value = $ush.parseInt( $input.val() );

			if ( $input.is( ':disabled' ) ) {
				return;
			}
			if ( min >= value ) {
				value = min;
			}
			if ( max > 1 && value >= max ) {
				value = max;
			}
			if ( value != $input.val() ) {
				$input.val( value );
			}

			$input
				.siblings( 'input.plus:first' )
				.prop( 'disabled', ( max > 0 && value >= max ) );
			$input
				.siblings( 'input.minus:first' )
				.prop( 'disabled', ( value <= min ) );

			// If the event type is `initControls` then this is the
			// first init when loading the document
			if ( e.type == 'initControls' ) {
				return;
			}

			// Add a flag that there was a change in the quantity to the cart elements
			$( 'input[name=us_cart_quantity]', $us.$canvas ).val( true );

			// Update the cart by means of WooCommerce
			if ( ! $( '.w-cart-table', $us.$canvas ).hasClass( 'processing' ) ) {
				self.__updateCartForm_long( self._updateCartForm.bind( self ) );
			} else {
				self._updateCartForm();
			}
		},

		/**
		 * Decreasing quantity item in cart
		 *
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 */
		_minusCartQuantity: function( e ) {
			const self = this;

			var $target = $( e.target ),
				$input = $target.siblings( 'input.qty:first' );

			if ( ! $input.length ) {
				return;
			}

			const step = $ush.parseInt( $input.attr( 'step' ) || 1 );
			$input // Update quantity
				.val( $ush.parseInt( $input.val() ) - step )
				.trigger( 'change' );
		},

		/**
		 * Increasing quantity item in cart
		 *
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 */
		_plusCartQuantity: function( e ) {
			const self = this;

			var $target = $( e.target ),
				$input = $target.siblings( 'input.qty:first' );

			if ( ! $input.length ) {
				return;
			}

			const step = $ush.parseInt( $input.attr( 'step' ) || 1 );
			$input
				.val( $ush.parseInt( $input.val() ) + step )
				.trigger( 'change' );
		},

		/**
		 * Update the cart form by means of WooCommerce
		 * Note: The code is moved to a separate function since `debounced`
		 * must be initialized before calling
		 *
		 * @param {function} fn The function to be executed
		 * @type debounced
		 */
		__updateCartForm_long: $ush.debounce( $ush.fn, /* wait */50 ),

		/**
		 * Update the cart form by means of WooCommerce
		 */
		_updateCartForm: function() {
			const self = this;
			// Abort previous cart update request
			if ( typeof ( self._activeJqXHR.updateCart || {} ).abort === 'function' ) {
				self._activeJqXHR.updateCart.abort();
			}
			// Initialize cart update
			$( '.w-cart-table > button[name=update_cart]', $us.$canvas )
				.removeAttr( 'disabled' )
				.trigger( 'click' );
		},

		/**
		 * Updating cart totals
		 *
		 * @event handler
		 */
		_updatedCartTotals: function() {
			const self = this;
			// Reset last active request
			if ( !! self._activeJqXHR.updateCart ) {
				self._activeJqXHR.updateCart = _undefined;
			}
			// Removing animated class if any element had it
			var wooElementClasses = [
				'w-cart-shipping',
				'w-cart-table',
				'w-cart-totals',
				'w-checkout-billing',
				'w-checkout-order-review',
				'w-checkout-payment',
				'w-wc-coupon-form',
			];
			for ( const i in wooElementClasses ) {
				$( `.${wooElementClasses[i]}.us_animate_this`, $us.$canvas ).removeClass( 'us_animate_this' );
			}

			// Shipping element sync after totals update
			const $shipping = $( '.w-cart-shipping .shipping', $us.$canvas );
			if ( ! $shipping.length ) {
				return;
			}
			$shipping.html( $( '.w-cart-totals .shipping:first', $us.$canvas ).html() );
		},

		/**
		 * Entering the coupon code in the field
		 *
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 */
		_couponCodeChange: function( e ) {
			// Transit value to the cart form to add a coupon by WooCommerce logic
			$( '.w-cart-table, form.checkout_coupon:first', $us.$canvas )
				.find( 'input[name=coupon_code]' )
				.val( e.target.value );
		},

		/**
		 * Enters a coupon code
		 *
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 */
		_enterCouponCode: function( e ) {
			if ( e.keyCode === $ush.ENTER_KEYCODE ) {
				$( e.target )
					.trigger( 'change' )
					.siblings( 'button:first' )
					.trigger( 'click' );
			}
		},

		/**
		 * Click on the "Apply Coupon" button
		 *
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 */
		_applyCouponCode: function( e ) {
			// Stop event (Important on the checkout page)
			e.stopPropagation();
			e.preventDefault();
			// Initialize coupon additions using WooCommerce logic
			$( '.w-cart-table, form.checkout_coupon:first', $us.$canvas )
				.find( 'button[name=apply_coupon]' )
				.trigger( 'click' );
			// Clear input field
			$( e.target ).closest( '.w-wc-coupon-form' ).find( 'input:first' ).val( '' );
		},

		/**
		 * Coupon form display switch
		 *
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 */
		_couponDisplaySwitch: function( e ) {
			const $coupon = $( '.w-wc-coupon-form', $us.$canvas );
			if ( ! $coupon.length ) {
				return;
			}
			// Add a class if the coupon is applied
			if ( e.type.indexOf( 'applied_coupon' ) > -1 && ! $( '.woocommerce-error', $us.$canvas ).length ) {
				$coupon.addClass( 'coupon_applied' );
			}
			// Remove a class if all coupons were removed
			if ( e.type.indexOf( 'removed_coupon' ) > -1 && $( '.woocommerce-remove-coupon', $us.$canvas ).length <= 1 ) {
				$coupon.removeClass( 'coupon_applied' );
			}
		},

		/**
		 * Move notifications to `[wc_notices...]`
		 *
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 * @param {String} err_html The value is needed for checkout_error.
		 */
		_moveNotifications: function( e, err_html ) {
			const self = this;

			// Do not proceed with notices adjustment if there are no US Cart / Checkout elements on the page
			if ( ! self.$notice.length ) {
				var $cartTotals = $( '.w-cart-totals', $us.$canvas ),
					$checkoutPayment = $( '.w-checkout-payment', $us.$canvas );
				if ( ! $cartTotals.length && ! $checkoutPayment.length ) {
					return;
				}
			}

			// Get notice
			var $message;
			if ( e.type === 'checkout_error' && err_html ) {
				$message = $( err_html );
			} else {
				$message = $( '.woocommerce-error, .woocommerce-message', $us.$canvas );
			}

			// Show notification
			if ( $message.length > 0 ) {
				self.$notice.html( $message.clone() );
			}
			$message.remove();

			// Remove NoticeGroup
			if ( e.type === 'checkout_error' ) {
				$( '.woocommerce-NoticeGroup-checkout' ).remove();
			}
		},

		_showLoginForm: function() {
			$( '.woocommerce-form-login' ).toggleClass( 'hidden' );
			return false;
		},

		_submitLoginForm: function() {
			const self = this;
			// Prevent double sending
			if ( self.isSubmittingLoginForm ) {
				return false;
			}
			self.isSubmittingLoginForm = true;

			// Get the form substitute view and all its fields
			var $formView = $( '.w-checkout-login' ),
				$usernameField = $( '#us_checkout_login_username', $formView ),
				$passwordField = $( '#us_checkout_login_password', $formView ),
				$redirectField = $( '#us_checkout_login_redirect', $formView ),
				$nonceField = $( '#us_checkout_login_nonce', $formView );

			// Make sure all fields are present
			if (
				$usernameField.length == 0
				|| $passwordField.length == 0
				|| $redirectField.length == 0
				|| $nonceField.length == 0
			) {
				return false;
			}

			// Append a new form with needed fields to <body> and submit it
			var fields = {
					'login': 'Login',
					'rememberme': 'forever',
					'username': $usernameField.val(),
					'password': $passwordField.val(),
					'redirect': $redirectField.val(),
					'woocommerce-login-nonce': $nonceField.val(),
				},
				$form = $( '<form>', {
					method: 'post'
				} );
			$.each( fields, ( key, val ) => {
				$( '<input>' ).attr( {
					type: "hidden",
					name: key,
					value: val
				} ).appendTo( $form );
			} );

			$form.appendTo( 'body' ).submit();

			return false;
		},

		_loginFieldKeydown: function( e ) {
			if ( e.keyCode === $ush.ENTER_KEYCODE ) {
				e.stopPropagation();
				e.preventDefault();
				this._submitLoginForm();
			}
		}

	} );

	$us.woocommerce = new WooCommerce;

	/**
	 * Sets product images for the chosen variation.
	 * Note: Overriding a default function implemented in WooCommerce logic.
	 * https://github.com/woocommerce/woocommerce/blob/d4696f043710131d5bbf51455e070791eaa12cf9/plugins/woocommerce/client/legacy/js/frontend/add-to-cart-variation.js#L646
	 *
	 * @param {{}} variation The variation.
	 */
	function us_wc_variations_image_update( variation ) {
		var $slider = $( '.w-slider.for_product_image_gallery:not(.w-grid .w-slider)', $( this ).closest( '.product' ) ),
			royalSlider = ( $slider.data( 'usImageSlider' ) || {} ).royalSlider;
		if ( $ush.isUndefined( royalSlider ) ) {
			return;
		}
		royalSlider.goTo(0);
		var $image = $( '.rsImg', royalSlider.slidesJQ[0] ),
			$thumb = $( '.rsThumb:first img', $slider );
		if ( variation === false ) {
			if ( ! $slider.data( 'orig-img' ) ) {
				var src = $image.attr( 'src' );
				$slider.data( 'orig-img', {
					src: src,
					srcset: src,
					full_src: src,
					thumb_src: $thumb.attr( 'srcset' ),
					gallery_thumbnail_src: $thumb.attr( 'src' ),
				} );
				return;
			}
			variation = {
				image: $slider.data( 'orig-img' ),
			};
		}
		if ( $.isPlainObject( variation.image ) ) {
			$image
				.attr( 'src', $ush.toString( variation.image.src ) )
				.attr( 'srcset', $ush.toString( variation.image.srcset ) );
			$thumb
				.attr( 'src', $ush.toString( variation.image.gallery_thumbnail_src ) )
				.attr( 'srcset', $ush.toString( variation.image.thumb_src ) );
			// Set bigImage for Fullscreen
			$.extend( royalSlider.currSlide, {
				bigImage: $ush.toString( variation.image.full_src ),
				image: $ush.toString( variation.image.src ),
			} );
			if ( typeof royalSlider.updateSliderSize === 'function' ) {
				royalSlider.updateSliderSize( true );
			}
		}
	};
	$( () => {
		if ( $( '.w-slider.for_product_image_gallery:not(.w-grid .w-slider.for_product_image_gallery)' ).length > 0 ) {
			$ush.timeout( () => {
				$.fn.wc_variations_image_update = us_wc_variations_image_update;
			}, 1 );
		}
	} );

} )( jQuery );
