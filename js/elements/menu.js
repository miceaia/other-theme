/**
 * $us.nav
 *
 * Header navigation with all the possible states
 *
 * @requires $us.canvas
 */
!function( $ ) {

	$us.Nav = function( container, options ) {
		this.init( container, options );
	};

	$us.mobileNavOpened = 0;

	$us.Nav.prototype = {
		init: function( container, options ) {

			this.$nav = $( container );
			if ( ! this.$nav.length ) {
				return;
			}
			this.$mobileMenuToggler = this.$nav.find( '.w-nav-control' );
			this.$mobileMenuCloser = this.$nav.find( '.w-nav-close' );
			this.$items = this.$nav.find( '.menu-item' );
			this.$list = this.$nav.find( '.w-nav-list.level_1' );
			this.$parentItems = this.$list.find( '.menu-item-has-children' );
			this.$subLists = this.$list.find( '.menu-item-has-children > .w-nav-list' );
			this.$anchors = this.$nav.find( '.w-nav-anchor' );
			this.$arrows = $( '.w-nav-arrow' );
			this.$reusableBlocksLinks = this.$nav.find( '.menu-item-object-us_page_block a' );
			this.type = this.$nav.usMod( 'type' );
			this.layout = this.$nav.usMod( 'layout' );
			this.isMobileMenuOpened = false;
			this.options = {};

			const $navOptions = $( '.w-nav-options:first', this.$nav );
			if ( $navOptions.is( '[onclick]' ) ) {
				$.extend( this.options, $navOptions[0].onclick() || {} );
				$navOptions.remove();
			}

			// Append anchors from the Reusable Blocks
			if ( this.$reusableBlocksLinks.length !== 0 ) {
				this.$reusableBlocksLinks.each( ( index, element ) => {
					let $element = $( element );
					if ( ! $element.parents( '.w-popup-wrap' ).length ) {
						this.$anchors.push( element );
					}
				} );
			}

			// Close the main menu on tablets after clicking on the submenu,
			// this is necessary because there is no hover event on tablets
			if ( $.isMobile && this.type === 'desktop' ) {
				this.$list.on( 'click', '.w-nav-anchor[class*="level_"]', ( e ) => {
					const $target = $( e.currentTarget );
					const $item = $target.closest( '.menu-item' );
					if ( $target.usMod('level') > 1 && ! $item.hasClass( 'menu-item-has-children' ) ) {
						$target
							.parents( '.menu-item.opened' )
							.removeClass( 'opened' );
					}
				} );
			}

			// Mobile Menu toggler (open and close)
			this.$mobileMenuToggler.on( 'click', ( e ) => {
				e.preventDefault();

				this.isMobileMenuOpened = ! this.isMobileMenuOpened;

				// Close on click outside menu
				$us.$document.on( 'mouseup touchend.noPreventDefault', this._events.closeOnClickOutside );

				// Make empty links focusable and clickable to open a dropdown
				this.$anchors.each( function() {
					if ( ! $( this ).attr( 'href' ) ) {
						$( this ).attr( 'href', 'javascript:void(0)' );
					}
				} );

				if ( this.isMobileMenuOpened ) {

					// Close another opened menus
					$( '.l-header .w-nav' ).not( container ).each( function() {
						$( this ).trigger( 'USNavClose' );
					} );

					// Close opened sublists
					this.$mobileMenuToggler.addClass( 'active' ).focus();
					this.$items.filter( '.opened' ).removeClass( 'opened' );
					this.$subLists.resetInlineCSS( 'display', 'height' );
					if ( this.layout === 'dropdown' ) {
						this.$list.slideDownCSS( 250, () => $us.header.$container.trigger( 'contentChange' ) );
					}
					$us.$html.addClass( 'w-nav-open' );
					this.$mobileMenuToggler.attr( 'aria-expanded', 'true' );
					$us.mobileNavOpened++;

					// Close mobile menu if focus outside the menu
					$us.$document.on( 'focusin', this._events.closeMobileMenuOnTab );

				} else {
					this._events.closeMobileMenu();
				}

				$us.$canvas.trigger( 'contentChange' );

			} );

			// Fix Safari outline webkit bug #243289
			this.$mobileMenuToggler.on( 'mouseup', () => {
				if ( $ush.isSafari ) {
					this.$mobileMenuToggler.attr( 'style', 'outline: none' );
				}
			} );

			// Mobile Menu close
			this.$mobileMenuCloser.on( 'click', () => {
				this._events.closeMobileMenu();
			} );

			$us.$document.on( 'keydown', ( e ) => {
				// Fix Safari outline webkit bug #243289
				if ( $ush.isSafari ) {
					this.$mobileMenuToggler.removeAttr( 'style' );
				}

				// Close mobile menu on ESC
				if (
					e.keyCode === $ush.ESC_KEYCODE
					&& this.type === 'mobile'
					&& this.isMobileMenuOpened
				) {
					this._events.closeMobileMenu();
				}

				// Close sub menus, when navigating outside the menu
				if (
					e.keyCode === $ush.TAB_KEYCODE
					&& this.type === 'desktop'
					&& ! $( e.target ).closest( '.w-nav' ).length
				) {
					this.$items.removeClass( 'opened' );
				}
			} );

			// Bindable events
			this._events = {

				closeMobileMenu: () => {
					if ( this.type !== 'mobile' ) {
						return;
					}
					this.isMobileMenuOpened = false;
					this.$mobileMenuToggler.removeClass( 'active' );
					$us.$html.removeClass( 'w-nav-open' );
					this.$mobileMenuToggler.attr( 'aria-expanded', 'false' );

					if ( this.$list && this.layout === 'dropdown' ) {
						this.$list.slideUpCSS( 250 );
					}

					$us.mobileNavOpened--;
					this.$mobileMenuToggler.focus();
					$us.$canvas.trigger( 'contentChange' );

					$us.$document.off( 'focusin', this._events.closeMobileMenuOnTab );

					$us.$document.off( 'mouseup touchend.noPreventDefault', this._events.closeOnClickOutside );
				},

				toggleMobileSubMenu: ( $item, show ) => {
					if ( this.type !== 'mobile' ) {
						return;
					}
					const $sublist = $item.children( '.w-nav-list' );
					if ( show ) {
						$item.addClass( 'opened' );
						$sublist.slideDownCSS( 250, () => $us.header.$container.trigger( 'contentChange' ) );
					} else {
						$item.removeClass( 'opened' );
						$sublist.slideUpCSS( 250, () => $us.header.$container.trigger( 'contentChange' ) );
					}
				},

				clickHandler: ( e ) => {
					if ( this.type !== 'mobile' ) {
						return;
					}
					e.stopPropagation();
					e.preventDefault();
					const $item = $( e.currentTarget ).closest( '.menu-item' );
					this._events.toggleMobileSubMenu( $item, ! $item.hasClass( 'opened' ) );
				},

				keyDownHandler: ( e ) => {
					const keyCode = e.keyCode || e.which;
					const $target = $( e.target );
					const $item = $target.closest( '.menu-item' );
					const $mainItem = $target.closest( '.menu-item.level_1' );
					const $parentItem = $target.closest( '.menu-item-has-children' );

					// Desktop menu handlers
					if ( this.type !== 'mobile' ) {
						if ( ( keyCode === $ush.ENTER_KEYCODE || keyCode === $ush.SPACE_KEYCODE ) && $target.is( this.$arrows ) ) {
							e.preventDefault();

							// Close on click outside menu
							$us.$document
								.off( 'mouseup touchend.noPreventDefault', this._events.closeOnClickOutside )
								.one( 'mouseup touchend.noPreventDefault', this._events.closeOnClickOutside );

							// Close opened via tab items when mouseover on other items
							this.$parentItems
								.off( 'mouseover', this._events.closeOnMouseIn )
								.one( 'mouseover', this._events.closeOnMouseIn );

							if ( ! $parentItem.hasClass( 'opened' ) ) {
								$parentItem
									.addClass( 'opened' )
									.siblings()
									.removeClass( 'opened' );
								this.$parentItems.not( $parentItem ).not( $mainItem ).removeClass( 'opened' );

								this.$arrows.attr( 'aria-expanded', 'false' );
								$target.attr( 'aria-expanded', 'true' );

							} else {
								$parentItem.removeClass( 'opened' );
								$target.attr( 'aria-expanded', 'false' );
							}
						}

						if ( keyCode === $ush.ESC_KEYCODE ) {
							if ( $mainItem.hasClass( 'opened' ) ) {
								$mainItem.find( '.w-nav-arrow' ).first().focus();
							}
							this.$items.removeClass( 'opened' );
							this.$arrows.attr( 'aria-expanded', 'false' );
						}

						// Mobile menu handlers
					} else {
						if ( ( keyCode === $ush.ENTER_KEYCODE || keyCode === $ush.SPACE_KEYCODE ) && $target.is( this.$arrows ) ) {
							e.stopPropagation();
							e.preventDefault();
							this._events.toggleMobileSubMenu( $item, ! $item.hasClass( 'opened' ) );
						}
						if ( keyCode === $ush.TAB_KEYCODE ) {
							let i = this.$anchors.index( $target );
							if ( e.shiftKey && i === 0 ) {
								this._events.closeMobileMenu();
							}
						}
					}
				},

				/**
				 * Close the mobile menu when tabbing outside the navigation
				 *
				 * @event handler
				 */
				closeMobileMenuOnTab: () => {
					if ( ! $.contains( this.$nav[0], $us.$document[0].activeElement ) ) {
						this._events.closeMobileMenu();
					}
				},

				resize: this.resize.bind( this ),

				detachAnimation: () => {
					this.$nav.removeClass( 'us_animate_this' );
				},

				/**
				 * Close menu on click outside.
				 *
				 * @param {Event} e
				 */
				closeOnClickOutside: ( e ) => {
					if ( this.isMobileMenuOpened && this.type === 'mobile' ) {
						if (
							! this.$mobileMenuToggler.is( e.target )
							&& ! this.$mobileMenuToggler.has( e.target ).length
							&& ! this.$list.is( e.target )
							&& ! this.$list.has( e.target ).length
						) {
							this._events.closeMobileMenu();
						}

					} else {
						if ( ! $.contains( this.$nav[0], e.target ) ) {
							this.$parentItems.removeClass( 'opened' );
						}
					}
				},

				/**
				 * Close opened via tab items when mouseover on other items
				 *
				 * @param {Event} e
				 */
				closeOnMouseIn: ( e ) => {
					if ( this.type === 'mobile' ) {
						return;
					}
					const $target = $( e.target );
					const $parentItem = $target.closest( '.menu-item-has-children' );
					const $mainItem = $target.closest( '.menu-item.level_1' );
					this.$parentItems.not( $parentItem ).not( $mainItem ).removeClass( 'opened' );
				}
			};

			// Menu items mobile behavior
			this.$parentItems.each( ( index, element ) => {
				const $element = $( element );
				const $arrow = $( '.w-nav-arrow', $element ).first();
				const $subAnchor = $element.find( '.w-nav-anchor' ).first();
				const dropByLabel = $element.hasClass( 'mobile-drop-by_label' ) || $element.parents( '.menu-item' ).hasClass( 'mobile-drop-by_label' );
				const dropByArrow = $element.hasClass( 'mobile-drop-by_arrow' ) || $element.parents( '.menu-item' ).hasClass( 'mobile-drop-by_arrow' );

				if ( dropByLabel || ( this.options.mobileBehavior && ! dropByArrow ) ) {
					$subAnchor.on( 'click', this._events.clickHandler );
				} else {
					$arrow.on( 'click', this._events.clickHandler );
					$arrow.on( 'click', this._events.keyDownHandler );
				}
			} );

			// Mark toggleable items
			this.$parentItems.each( ( _, element ) => {
				const $element = $( element );
				const $parentItem = $element.parent().closest( '.menu-item' );
				if ( ! $parentItem.length || $parentItem.usMod( 'columns' ) === false ) {
					$element.addClass( 'togglable' );
				}
			} );

			// Touch screen handling for desktop type
			if ( ! $us.$html.hasClass( 'no-touch' ) ) {
				this.$list.find( '.menu-item-has-children.togglable > .w-nav-anchor' ).on( 'click', ( e ) => {
					if ( this.type === 'mobile' ) {
						return;
					}
					e.preventDefault();
					// Second tap: going to the URL
					const $this = $( e.currentTarget );
					const $item = $this.parent();
					if ( $item.hasClass( 'opened' ) ) {
						return location.assign( $this.attr( 'href' ) );
					}
					$item.addClass( 'opened' );
					const outsideClickEvent = ( e ) => {
						if ( $.contains( $item[ 0 ], e.target ) ) {
							return;
						}
						$item.removeClass( 'opened' );
						$us.$body.off( 'touchstart', outsideClickEvent );
					};
					$us.$body.on( 'touchstart.noPreventDefault', outsideClickEvent );
				} );
			}

			// Accessibility for keyboard navigation
			this.$nav.on( 'keydown.upsolution', this._events.keyDownHandler );

			// Detach animation after transition
			this.$nav.on( 'transitionend', this._events.detachAnimation );

			// Close on anchor click for mobile
			this.$anchors.on( 'click', ( e ) => {
				const $item = $( e.currentTarget ).closest( '.menu-item' );
				const dropByLabel = $item.hasClass( 'mobile-drop-by_label' ) || $item.parents( '.menu-item' ).hasClass( 'mobile-drop-by_label' );
				const dropByArrow = $item.hasClass( 'mobile-drop-by_arrow' ) || $item.parents( '.menu-item' ).hasClass( 'mobile-drop-by_arrow' );
				if ( this.type !== 'mobile' || $us.header.isVertical() ) {
					return;
				}
				if (
					dropByLabel
					|| ( this.options.mobileBehavior && $item.hasClass( 'menu-item-has-children' ) && ! dropByArrow )
				) {
					return;
				}
				this._events.closeMobileMenu();
			} );

			$us.$window.on( 'resize', $ush.debounce( this._events.resize, 5 ) );

			$ush.timeout( () => {
				this.resize();
				$us.header.$container.trigger( 'contentChange' );
			}, 50 );

			this.$nav.on( 'USNavClose', this._events.closeMobileMenu );
		},

		/**
		 * Resize handler
		 */
		resize: function() {
			if ( ! this.$nav.length ) {
				return;
			}
			const nextType = ( window.innerWidth < this.options.mobileWidth ) ? 'mobile' : 'desktop';
			if ( $us.header.orientation !== this.headerOrientation || nextType !== this.type ) {
				this.$subLists.resetInlineCSS( 'display', 'height' );
				if ( this.headerOrientation === 'hor' && this.type === 'mobile' ) {
					this.$list.resetInlineCSS( 'display', 'height', 'max-height', 'opacity' );
				}
				// Closing opened sublists
				this.$items.removeClass( 'opened' );
				this.headerOrientation = $us.header.orientation;
				this.type = nextType;
				this.$nav.usMod( 'type', nextType );
			}
			this.$list.removeClass( 'hide_for_mobiles' );
		}
	};

	$.fn.usNav = function( options ) {
		return this.each( function() {
			$( this ).data( 'usNav', new $us.Nav( this, options ) );
		} );
	};

	$( '.l-header .w-nav' ).usNav();

}( jQuery );
