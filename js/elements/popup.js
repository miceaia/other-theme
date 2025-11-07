/**
 * UpSolution Element: Modal Popup
 */
! function( $, undefined ) {
	"use strict";

	$us.WPopup = function( container ) {
		const self = this;

		this.$container = $( container );
		this.$content = $( '.w-popup-box-content', this.$container );
		this.$closer = $( '.w-popup-closer', this.$container );

		this._events = {
			show: this.show.bind( this ),
			afterShow: this.afterShow.bind( this ),
			hide: this.hide.bind( this ),
			hideOnLinkClick: this.hideOnLinkClick.bind( this ),
			afterHide: this.afterHide.bind( this ),
			keyup: function( e ) {
				if ( e.key === 'Escape' ) {
					this.hide();
					this.$trigger.focus();
				}
			}.bind( this ),
			scroll: function() {
				// Trigger an event for check lazyLoadXT
				$us.$document.trigger( 'scroll' );
			},
			touchmove: function( e ) {
				this.savePopupSizes();
				// Prevent underlying content scroll
				if (
					( this.popupSizes.wrapHeight > this.popupSizes.contentHeight )
					|| ! $( e.target ).closest( '.w-popup-box' ).length
				) {
					e.preventDefault();
				}
			}.bind( this ),
			tabFocusTrap: this.tabFocusTrap.bind( this )
		};

		// Event name for triggering CSS transition finish
		this.transitionEndEvent = ( navigator.userAgent.search( /webkit/i ) > 0 ) ? 'webkitTransitionEnd' : 'transitionend';
		this.isDesktop = ! jQuery.isMobile;

		self.$trigger = $( '.w-popup-trigger', self.$container );
		self.triggerType = self.$trigger.usMod( 'type' );
		self.triggerOptions = $ush.toPlainObject( self.$trigger.data( 'options' ) );

		if ( self.triggerType === 'load' ) {
			let _timeoutHandle;
			// Check trigger display on which `hide_on_*` can be applied
			if ( self.$container.css( 'display' ) !== 'none' ) {
				const delay = $ush.parseInt( self.triggerOptions.delay );
				_timeoutHandle = $ush.timeout( self.show.bind( self ), delay * 1000 );
			}
			// When refreshed entire node in the Live builder,
			// we will remove the popup itself from the body
			self.$container.on( 'usb.refreshedEntireNode', function() {
				if ( _timeoutHandle ) {
					$ush.clearTimeout( _timeoutHandle );
				}
				self.$overlay.remove();
				self.$wrap.remove();
			} );
		} else if ( this.triggerType === 'selector' ) {
			const selector = this.$trigger.data( 'selector' );
			if ( selector ) {
				$us.$body.on( 'click', selector, this._events.show );
			}
		} else {
			this.$trigger.on( 'click', this._events.show );
		}
		this.$wrap = this.$container.find( '.w-popup-wrap' ).on( 'click', this._events.hide );
		this.$box = this.$container.find( '.w-popup-box' );
		this.$overlay = this.$container.find( '.w-popup-overlay' );
		this.$closer.on( 'click', this._events.hide );

		// Hide popup, if find link with '#' in content
		this.$wrap.find( 'a' ).on( 'click', this._events.hideOnLinkClick.bind( this ) );

		this.$media = $( 'video,audio', this.$box );
		this.$wVideos = $( '.w-video', this.$box );

		this.timer = null;

		// Save sizes to prevent scroll on iPhones, iPads
		this.popupSizes = {
			wrapHeight: 0,
			contentHeight: 0,
		}
	};
	$us.WPopup.prototype = {
		isKeyboardUsed: function( e ) {
			return e && e.pointerType !== 'mouse' && e.pointerType !== 'touch' && e.pointerType !== 'pen';
		},
		show: function( e ) {
			const self = this;
			if ( e !== undefined ) {
				e.preventDefault();
			}
			// Show once
			if ( self.triggerType === 'load' && ! $us.usbPreview() ) {
				const uniqueId = $ush.toString( self.triggerOptions.uniqueId ),
					cookieName = 'us_popup_' + uniqueId;
				if ( uniqueId ) {
					if ( $ush.getCookie( cookieName ) !== null ) {
						return;
					}
					const daysUntilNextShow = $ush.parseFloat( self.triggerOptions.daysUntilNextShow );
					$ush.setCookie( cookieName, 'shown', daysUntilNextShow || 365 );
				}
			}
			clearTimeout( this.timer );
			this.$overlay.appendTo( $us.$body ).show();
			this.$wrap.appendTo( $us.$body ).css( 'display', 'flex' );

			if ( ! this.isDesktop ) {
				this.$wrap.on( 'touchmove', this._events.touchmove );
				$us.$document.on( 'touchmove', this._events.touchmove );
			}

			$us.$body.on( 'keyup', this._events.keyup );
			this.$wrap.on( 'scroll.noPreventDefault', this._events.scroll );
			this.timer = setTimeout( this._events.afterShow, 25 );

			$us.$document.on( 'keydown.usPopup', this._events.tabFocusTrap );
			$us.$document.trigger( 'usPopupOpened' );
			if ( e ) {
				this.$closer[0].focus({ preventScroll: true });
			}
		},
		afterShow: function() {
			clearTimeout( this.timer );
			this.$overlay.addClass( 'active' );
			this.$box.addClass( 'active' );
			if ( window.$us !== undefined && $us.$canvas !== undefined ) {
				$us.$canvas.trigger( 'contentChange', { elm: this.$container } );
			}

			// If popup contains our video elements, restore their src from data attribute
			// this is made to make sure these video elements play only when popup is opened
			if ( this.$wVideos.length ) {
				this.$wVideos.each( function( _, wVideo ) {
					const $wVideoSource = $( wVideo ).find( '[data-src]' ),
						$videoTag = $wVideoSource.parent( 'video' ),
						src = $wVideoSource.data( 'src' );

					if ( ! src ) {
						return;
					}
					$wVideoSource.attr( 'src', src );

					// Init video
					if ( $videoTag.length ) {
						$videoTag[ 0 ].load();
					}
				} );
			}

			$us.$window
				.trigger( 'resize' )
				.trigger( 'us.wpopup.afterShow', this )
		},
		hide: function( e ) {
			// Do not hide if the click is inside the popup except closer
			if (
				e
				&& $( e.target ).closest( this.$box ).length
				&& ! $( e.target ).hasClass( 'w-popup-closer' )
			) {
				return;
			}
			clearTimeout( this.timer );
			$us.$body.off( 'keyup', this._events.keyup );
			this.$overlay.on( this.transitionEndEvent, this._events.afterHide );
			this.$overlay.removeClass( 'active' );
			this.$box.removeClass( 'active' );
			this.$wrap.off( 'scroll.noPreventDefault', this._events.scroll );
			$us.$document.off( 'touchmove', this._events.touchmove );

			this.timer = setTimeout( this._events.afterHide, 1000 );
			$us.$document.off( 'keydown.usPopup' );
			if ( this.isKeyboardUsed( e ) ) {
				this.$trigger.focus();
			}
		},
		hideOnLinkClick: function( event ) {
			const $item = $( event.currentTarget ),
				place = $item.attr( 'href' );

			// Do not hide if: ...
			if (
				// ... the link is not a scroll link
				(
					place.indexOf( '#' ) === -1
				)
				// ... or current popup contains scroll link target
				|| (
					place !== '#'
					&& place.indexOf( '#' ) === 0
					&& this.$wrap.find( place ).length
				)
			) {
				return;
			}

			this.hide();
		},
		afterHide: function() {
			clearTimeout( this.timer );
			this.$overlay.off( this.transitionEndEvent, this._events.afterHide );
			this.$overlay.appendTo( this.$container ).hide();
			this.$wrap.appendTo( this.$container ).hide();
			$us.$document.trigger( 'usPopupClosed' );
			$us.$window
				.trigger( 'resize', true ) // Pass true not to trigger this event in Page Scroller
				.trigger( 'us.wpopup.afterHide', this );


			// If popup contains media elements, then we will pause after closing the window
			if ( this.$media.length ) {
				this.$media.trigger( 'pause' );
			}

			// Pass src to data-src if data-src is missing
			// Stop video playing by removing src parameter after moving it to data-src
			if ( this.$wVideos.length ) {
				this.$wVideos.each( function( _, wVideo ) {
					const $wVideoSource = $( wVideo ).find( '[src]' );
					if ( ! $wVideoSource.data( 'src' ) ) {
						$wVideoSource.attr( 'data-src', $wVideoSource.attr( 'src' ) );
					}

					$wVideoSource.attr( 'src', '' );
				} );
			}
		},
		savePopupSizes: function() {
			this.popupSizes.wrapHeight = this.$wrap.height();
			this.popupSizes.contentHeight = this.$content.outerHeight( true );
		},

		// Loop the navigation via TAB key inside a popup.
		// This is the accessibility requirement for aria-modal="true".
		tabFocusTrap: function( e ) {
			const self = this;

			if ( e.keyCode !== $ush.TAB_KEYCODE ) {
				return;
			}

			const focusableSelectors = [
				'a[href]', 'area[href]',
				'input:not([disabled])',
				'select:not([disabled])',
				'textarea:not([disabled])',
				'button:not([disabled])',
				'iframe', 'object', 'embed',
				'[tabindex]:not([tabindex="-1"])',
				'[contenteditable]', 'video[controls] source'
			].join();

			const $focusable = $( focusableSelectors, self.$wrap ).filter( ( _, node ) => {
				if ( $( node ).is( 'video[controls], source' ) ) {
					return true;
				}
				return $( node ).is( ':visible' );
			} );

			if ( ! $focusable.length ) {
				e.preventDefault();
				self.$closer[0].focus();
				return;
			}

			const firstElement = $focusable.first()[0];
			const lastElement = $focusable.last()[0];
			const target = e.target;

			if (
				! $.contains( self.$wrap[0], target )
				&& $us.$html.hasClass( 'us_popup_is_opened' )
				&& ! $( target ).hasClass( 'w-popup-closer' )
			) {
				e.preventDefault();
				if ( e.shiftKey ) {
					lastElement.focus();
				} else {
					firstElement.focus();
				}
				return;
			}

			if ( e.shiftKey && target === firstElement ) {
				e.preventDefault();
				lastElement.focus();

			} else if ( ! e.shiftKey && target === lastElement ) {
				e.preventDefault();
				firstElement.focus();
			}
		}
	};
	$.fn.wPopup = function( options ) {
		return this.each( function() {
			$( this ).data( 'wPopup', new $us.WPopup( this, options ) );
		} );
	};

	$( () => $( '.w-popup' ).wPopup() );

	// Init in Post\Product List or Grid context
	$us.$document.on( 'usPostList.itemsLoaded usGrid.itemsLoaded', ( _, $items ) => {
		$( '.w-popup', $items ).wPopup();
	} );

}( jQuery );
