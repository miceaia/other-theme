/**
 * UpSolution Shortcode: us_cform.
 */
! function( $, undefined ) {

	// Private variables that are used only in the context of this function, it is necessary to optimize the code.
	var _window = window,
		_document = document,
		_undefined = undefined;

	// Check if the $us global object is set
	_window.$us = _window.$us || {};

	$us.WForm = function( container ) {
		var self = this;

		// Elements
		self.$form = $( container );
		if ( ! self.$form.hasClass( 'for_cform' ) ) {
			self.$form = $( '.w-form.for_cform', container );
		}
		self.$formH = $( '.w-form-h', self.$form );
		self.$dateFields = $( '.w-form-row.for_date input', self.$form );
		self.$message = $( '.w-form-message', self.$form );
		self.$reusableBlock = $( '.w-form-reusable-block', self.$form );
		self.$submit = $( '.w-btn', self.$form );

		// Variables
		self.options = {};
		self.isFileValid = true;
		self.pickerOptions = {};

		// Form options
		var $formJson = $( '.w-form-json', self.$form );
		if ( $formJson.is('[onclick]') ) {
			self.options = $formJson[0].onclick() || {};
			// Delete data everywhere except for the preview of the Live Builder,
			// the data may be needed again to restore the elements.
			if ( ! $us.usbPreview() ) {
				$formJson.remove();
			}
		}

		// Init date pickers.
		if ( self.$dateFields.length ) {
			$( () => {
				self._initDateField();
			} );
		}

		// Add not-empty class when filling form fields.
		$( [
			'input[type=text]',
			'input[type=email]',
			'input[type=tel]',
			'input[type=number]',
			'input[type=date]',
			'input[type=search]',
			'input[type=url]',
			'input[type=password]',
			'textarea'
		].join(), self.$form ).each( ( _, input ) => {
			const $input = $( input );
			const $row = $input.closest( '.w-form-row' );
			if ( $input.attr( 'type' ) === 'hidden' ) {
				return;
			}
			$row.toggleClass( 'not-empty', $input.val() != '' );
			$input.on( 'input change', () => {
				$row.toggleClass( 'not-empty', $input.val() != '' );
			} );
		} );

		/**
		 * @var {{}} Bondable events.
		 */
		self._events = {
			changeFile: self._changeFile.bind( self ),
			submit: self._submit.bind( self )
		};

		// Events
		self.$form
			// Upload validation handler.
			.on( 'change' , 'input[type=file]:visible', self._events.changeFile )
			// Form submission handler.
			.on( 'submit', self._events.submit );
	};

	// Export API
	$.extend( $us.WForm.prototype, {

		/**
		 * Get the file extension.
		 *
		 * @param {String} name The file name.
		 * @return {String} The file extension.
		 */
		getExtension: function( name ) {
			return ( '' + name ).split( '.' ).pop();
		},

		/**
		 * File extension validation
		 *
		 * @param {File} file The file object
		 * @param {String} accepts
		 * @param {Boolean} Returns true on success, false otherwise.
		 */
		_validExtension: function( file, accepts ) {
			// If accepts are not set, then all files are validated.
			if ( ! accepts ) {
				return true;
			}
			var self = this;
			accepts = ( '' + accepts ).split( ',' );
			for ( var i in accepts ) {
				var accept = ( '' + accepts[ i ] ).trim();
				if ( ! accept ) {
					continue;
				}
				// @link https://mimesniff.spec.whatwg.org
				if ( accept.indexOf( '/' ) > -1 ) {
					var acceptMatches = accept.split( '/' );
					if (
						file.type === accept
						|| (
							acceptMatches[1] === '*'
							&& ( '' + file.type ).indexOf( acceptMatches[0] ) === 0
						)
					) {
						return true;
					}
				} else if ( self.getExtension( file.name ) === accept.replace( /[^A-z\d]+/, '' ) ) {
					return true;
				}
			}
			return false;
		},

		/**
		 * Validation of required fields.
		 *
		 * @return {Boolean} Returns true on success, false otherwise.
		 */
		_requiredValidation: function() {
			const self = this;
			let errors = 0;
			$( '[data-required=true]', self.$form ).each( function( _, input ) {
				let $input = $( input ),
					isEmpty = $input.is( '[type=checkbox]' )
						? ! $input.is( ':checked' )
						: $input.val() == '',
					$row = $input.closest( '.w-form-row' );
				// Skip checkboxes and radio buttons
				if ( $row.hasClass( 'for_checkboxes' ) || $row.hasClass( 'for_radio' ) ) {
					return true;
				}
				// Check file fields validation
				if ( input.type === 'file' ) {
					isEmpty = isEmpty || ! self.isFileValid;
				}
				// Select validation
				if ( input.type === 'select-one' ) {
					isEmpty = $input.val() === $( 'option:first-child', $input ).val();
				}
				$row.toggleClass( 'check_wrong', isEmpty );
				if ( isEmpty ) {
					errors ++;
				}
			} );
			// Count required checkboxes separately
			$( '.for_checkboxes.required', self.$form ).each( function( _, elm ) {
				let $input = $( 'input[type=checkbox]', elm ),
					$row = $input.closest( '.w-form-row' ),
					isEmpty = ! $input.is( ':checked' );
				$row.toggleClass( 'check_wrong', isEmpty );
				if ( isEmpty ) {
					errors ++;
				}
			} );
			// If selected first radio button show error
			$( '.for_radio.required', self.$form ).each( function( _, elm ) {
				let $input = $( 'input[type=radio]', elm ).first(),
					$row = $input.closest( '.w-form-row' ),
					isEmpty = $input.is( ':checked' );
				$row.toggleClass( 'check_wrong', isEmpty );
				if ( isEmpty ) {
					errors ++;
				}
			} );
			return ! errors;
		},

		/**
		 * Init date pickers.
		 */
		_initDateField: function() {
			var self = this;
			$.each( self.$dateFields, function( _, input ) {
				var $input = $( input );
				self.pickerOptions.dateFormat = $input.data( 'date-format' );

				// Note: Check for the presence of the script, since the script may not always be
				// loaded when adding an element on the preview page, which is not critical
				try {
					$input.datepicker( self.pickerOptions );

					// Show datepicker in popup
					if ( $input.closest( '.w-popup-wrap' ).length ) {
						$input.on( 'click', function( e ) {
							let $datepicker = $( '#ui-datepicker-div' ),
								datepickerHeight = $datepicker.outerHeight(),
								inputBounds = e.currentTarget.getBoundingClientRect();

							// First try to place the datepicker below the field
							// then (if there is not enough space below) - above the field
							if ( _window.innerHeight - ( inputBounds.bottom + datepickerHeight ) > 0 ) {
								$datepicker.css( {
									position: 'fixed',
									left: inputBounds.left,
									top: ( inputBounds.top + inputBounds.height )
								} );
							} else {
								$datepicker.css( {
									position: 'fixed',
									left: inputBounds.left,
									top: ( inputBounds.top - datepickerHeight ),
								} );
							}

						} );
					}

				} catch( e ) {}
			} );
		},

		/**
		 * File field change handler.
		 *
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM.
		 */
		_changeFile: function( e ) {
			var self = this,
				errMessage = '',
				input = e.target,
				$input = $( input ),
				accept = $input.attr( 'accept' ) || '',
				maxSize = $input.data( 'max_size' ) || $input.data( 'std' ) || 0;

			// Checking the list of uploaded files
			if ( input.files.length ) {
				for ( var i in input.files ) {
					if ( errMessage ) {
						break;
					}
					// Get a file object from a list.
					var file = input.files[ i ];
					if ( ! ( file instanceof File ) ) {
						continue;
					}
					// File extension validation.
					if ( ! self._validExtension( file, accept ) ) {
						errMessage = ( self.options.messages.err_extension || '' )
							.replace( '%s', self.getExtension( file.name ) );
					}
					// File size validation.
					if ( ! errMessage && file.size > ( parseFloat( maxSize ) * 1048576/* mb to kb */ ) ) {
						errMessage = ( self.options.messages.err_size || '' )
							.replace( '%s', maxSize );
					}
				}
			}
			$input
				.closest( '.for_file' )
				.toggleClass( 'check_wrong', ! ( self.isFileValid = ! errMessage ) )
				.find( '.w-form-row-state' )
				.html( errMessage || self.options.messages.err_empty );
		},

		/**
		 * Form submission handler.
		 *
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM.
		 */
		_submit: function( e ) {
			e.preventDefault();
			var self = this;

			// Clear form messages
			self.$message
				.usMod( 'type', false )
				.html( '' );

			if (
				// Prevent double-sending.
				self.$submit.hasClass( 'loading' )
				// If not all required fields are filled.
				|| ! self._requiredValidation()
				// If the data is not valid.
				|| ! self.isFileValid
			) {
				return;
			}

			// Show data upload preloader.
			self.$submit
				.addClass( 'loading' );

			var formData = _window.FormData ? new FormData( self.$form[0] ) : self.$form.serialize();

			// reCAPTCHA validation
			if ( self.$form.hasClass( 'validate_by_recaptcha' ) ) {
				grecaptcha.ready( function() {
					try {
						grecaptcha.execute( self.options.recaptcha_site_key, { action: 'submit' } ).then( function( token ) {
							formData.append( 'g-recaptcha-response', token );
							sendAjaxRequest();
						} );
					} catch ( e ) {
						self.$message
							.usMod( 'type', 'error' )
							.html( self.options.messages.err_recaptcha_keys );
						self.$submit
							.removeClass( 'loading' );
					}
				} );
			} else {
				sendAjaxRequest();
			}

			// Send form data to the server.
			function sendAjaxRequest() {
				$.ajax( {
					type: 'POST',
					url: self.options.ajaxurl,
					data: formData,
					cache: false,
					processData: false,
					contentType: false,
					dataType: 'json',
					success: function( res ) {
						$( '.w-form-row.check_wrong', self.$form )
							.removeClass( 'check_wrong' );
						if ( res.success ) {

							// Redirect to specified URL
							if ( res.data.redirect_url ) {
								_window.location.href = res.data.redirect_url;
								return;
							}

							// Open popup by selector
							if ( res.data.popup_selector ) {
								const $popupTrigger = $( res.data.popup_selector ).find( '.w-popup-trigger' );
								if ( $popupTrigger.length ) {
									$popupTrigger.trigger( 'click' );
								}
							}

							// Show success message
							if ( res.data.message ) {
								self.$message
									.usMod( 'type', 'success' )
									.html( res.data.message );
							}

							// Show reusable block
							if ( self.$reusableBlock.length ) {
								self.$reusableBlock.slideDown( 400 );
							}

							// Close popup
							if ( self.options.close_popup_after_sending ) {
								const $popupCloser = self.$form.closest( '.w-popup-wrap' ).find( '.w-popup-closer' );
								if ( $popupCloser.length ) {
									$popupCloser.trigger( 'click' );
								}
							}

							// Hide form
							if ( self.options.hide_form_after_sending ) {

								// Scroll to the top of the form if the form outside the viewport
								const formPos = self.$form.offset().top;
								const scrollTop = $us.$window.scrollTop();
								if (
									! $ush.isNodeInViewport( self.$form[0] )
									|| formPos >= ( scrollTop + window.innerHeight )
									|| scrollTop >= formPos
								) {
									$us.$htmlBody.animate( { scrollTop: formPos - $us.header.getInitHeight() }, 400 );
								}

								self.$formH.slideUp( 400 );
							}

							// Clear form
							$( '.w-form-row.not-empty', self.$form )
								.removeClass( 'not-empty' );
							$( 'input[type=text], input[type=email], textarea', self.$form )
								.val( '' );
							self.$form
								.trigger( 'usCformSuccess', res )
								.get( 0 )
								.reset();

							// Failed sending
						} else {
							if ( $.isPlainObject( res.data ) ) {
								for ( var fieldName in res.data ) {
									if ( fieldName === 'empty_message' ) {
										$resultField.usMod( 'type', 'error' );
										continue;
									}
									if ( fieldName === 'reCAPTCHA' && res.data[ fieldName ].error_message ) {
										self.$message
											.usMod( 'type', 'error' )
											.html( res.data.reCAPTCHA.error_message );
									}
									$( '[name="' + fieldName + '"]', self.$form )
										.closest( '.w-form-row' )
										.addClass( 'check_wrong' )
										.find( '.w-form-row-state' )
										.html( res.data[ fieldName ][ 'error_message' ] || '' );
								}
							} else {
								self.$message
									.usMod( 'type', 'error' )
									.html( res.data );
							}
						}
					},
					complete: function() {
						// Hide send data preloader.
						self.$submit
							.removeClass( 'loading' );
					}
				} );
			}
		}

	} );

	$.fn.wForm = function() {
		return this.each( function() {
			$( this ).data( 'wForm', new $us.WForm( this ) );
		} );
	};

	// Init wForm
	$( '.w-form.for_cform' ).wForm();

}( jQuery );
