<?php defined( 'ABSPATH' ) OR die( 'This script cannot be accessed directly.' );

/**
 * Laptops/Tablets/Mobiles missing settings are inherited from default state settings
 */

global $us_template_directory_uri;

return array(

	'simple_1' => array(
		'default' => array(
			'options' => array(
				'orientation' => 'hor',
				'top_show' => 0,
				'middle_height' => '100px',
				'middle_sticky_height' => '60px',
				'bottom_show' => 0,
			),
			'layout' => array(
				'middle_left' => array( 'image:1' ),
				'middle_right' => array( 'menu:1' ),
			),
		),
		'tablets' => array(
			'options' => array(
				'middle_height' => '80px',
			),
		),
		'mobiles' => array(
			'options' => array(
				'middle_height' => '60px',
			),
		),
		// Only the values that differ from the elements' defautls
		'data' => array(
			'image:1' => array(
				'img' => $us_template_directory_uri . '/img/us-logo.png',
				'link' => '{"url":"/"}',
			),
		),
	),

	'simple_2' => array(
  'default' => 
  array (
    'options' => 
    array (
      'middle_height' => '100px',
      'middle_centering' => 1,
    ),
    'layout' => 
    array (
      'top_left' => 
      array (
      ),
      'top_center' => 
      array (
      ),
      'top_right' => 
      array (
      ),
      'middle_left' => 
      array (
        0 => 'text:1',
      ),
      'middle_center' => 
      array (
        0 => 'menu:1',
      ),
      'middle_right' => 
      array (
        0 => 'btn:1',
      ),
      'bottom_left' => 
      array (
      ),
      'bottom_center' => 
      array (
      ),
      'bottom_right' => 
      array (
      ),
      'hidden' => 
      array (
      ),
    ),
  ),
  'laptops' => 
  array (
    'options' => 
    array (
      'middle_height' => '100px',
      'middle_fullwidth' => 1,
      'middle_centering' => 1,
    ),
  ),
  'tablets' => 
  array (
    'options' => 
    array (
      'middle_fullwidth' => 1,
      'middle_centering' => 1,
    ),
    'layout' => 
    array (
      'top_left' => 
      array (
      ),
      'top_center' => 
      array (
      ),
      'top_right' => 
      array (
      ),
      'middle_left' => 
      array (
        0 => 'text:1',
      ),
      'middle_center' => 
      array (
      ),
      'middle_right' => 
      array (
        0 => 'menu:1',
        1 => 'btn:1',
      ),
      'bottom_left' => 
      array (
      ),
      'bottom_center' => 
      array (
      ),
      'bottom_right' => 
      array (
      ),
      'hidden' => 
      array (
      ),
    ),
  ),
  'mobiles' => 
  array (
    'options' => 
    array (
      'top_sticky_height' => '0px',
      'middle_height' => '60px',
      'middle_fullwidth' => 1,
      'middle_centering' => 1,
    ),
    'layout' => 
    array (
      'top_left' => 
      array (
      ),
      'top_center' => 
      array (
      ),
      'top_right' => 
      array (
      ),
      'middle_left' => 
      array (
        0 => 'text:1',
      ),
      'middle_center' => 
      array (
      ),
      'middle_right' => 
      array (
        0 => 'menu:1',
      ),
      'bottom_left' => 
      array (
      ),
      'bottom_center' => 
      array (
      ),
      'bottom_right' => 
      array (
      ),
      'hidden' => 
      array (
        0 => 'btn:1',
      ),
    ),
  ),
  'data' => 
  array (
    'menu:1' => 
    array (
    ),
    'btn:1' => 
    array (
      'label' => 'Get Started',
      'link' => '%7B%22url%22%3A%22%23%22%7D',
      'css' => 
      array (
        'default' => 
        array (
          'font-size' => '13px',
        ),
      ),
    ),
    'text:1' => 
    array (
      'text' => 'Impreza',
      'link' => '%7B%22url%22%3A%22%2F%22%7D',
      'css' => 
      array (
        'default' => 
        array (
          'font-size' => '1.2rem',
          'letter-spacing' => '0.05em',
          'font-family' => 'h1',
          'font-weight' => '700',
          'text-transform' => 'uppercase',
        ),
      ),
    ),
  ),
	),

	'simple_3' => array(
  'default' => 
  array (
    'options' => 
    array (
      'middle_height' => '100px',
      'middle_sticky_height' => '100px',
      'middle_fullwidth' => 1,
    ),
    'layout' => 
    array (
      'top_left' => 
      array (
      ),
      'top_center' => 
      array (
      ),
      'top_right' => 
      array (
      ),
      'middle_left' => 
      array (
        0 => 'image:1',
        1 => 'menu:1',
      ),
      'middle_center' => 
      array (
      ),
      'middle_right' => 
      array (
        0 => 'btn:2',
        1 => 'btn:1',
      ),
      'bottom_left' => 
      array (
      ),
      'bottom_center' => 
      array (
      ),
      'bottom_right' => 
      array (
      ),
      'hidden' => 
      array (
      ),
    ),
  ),
  'laptops' => 
  array (
    'options' => 
    array (
      'middle_sticky_height' => '80px',
    ),
  ),
  'tablets' => 
  array (
    'options' => 
    array (
      'middle_sticky_height' => '80px',
    ),
    'layout' => 
    array (
      'top_left' => 
      array (
      ),
      'top_center' => 
      array (
      ),
      'top_right' => 
      array (
      ),
      'middle_left' => 
      array (
        0 => 'image:1',
      ),
      'middle_center' => 
      array (
      ),
      'middle_right' => 
      array (
        0 => 'menu:1',
      ),
      'bottom_left' => 
      array (
      ),
      'bottom_center' => 
      array (
      ),
      'bottom_right' => 
      array (
      ),
      'hidden' => 
      array (
        0 => 'btn:2',
        1 => 'btn:1',
      ),
    ),
  ),
  'mobiles' => 
  array (
    'options' => 
    array (
      'middle_height' => '70px',
      'middle_sticky_height' => '70px',
    ),
    'layout' => 
    array (
      'top_left' => 
      array (
      ),
      'top_center' => 
      array (
      ),
      'top_right' => 
      array (
      ),
      'middle_left' => 
      array (
        0 => 'image:1',
      ),
      'middle_center' => 
      array (
      ),
      'middle_right' => 
      array (
        0 => 'menu:1',
      ),
      'bottom_left' => 
      array (
      ),
      'bottom_center' => 
      array (
      ),
      'bottom_right' => 
      array (
      ),
      'hidden' => 
      array (
        0 => 'btn:2',
        1 => 'btn:1',
      ),
    ),
  ),
  'data' => 
  array (
    'image:1' => 
    array (
      'img' => $us_template_directory_uri . '/img/us-logo.png',
      'disable_lazy_loading' => 1,
      'link' => '%7B%22url%22%3A%22%2F%22%7D',
      'height_default' => '30px',
      'height_laptops' => '30px',
      'height_tablets' => '30px',
      'height_mobiles' => '30px',
      'height_sticky' => '30px',
      'height_sticky_laptops' => '30px',
      'height_sticky_tablets' => '30px',
      'height_sticky_mobiles' => '30px',
    ),
    'menu:1' => 
    array (
      'indents' => '1vw',
      'css' => 
      array (
        'default' => 
        array (
          'font-size' => '22px',
          'font-weight' => '600',
        ),
        'laptops' => 
        array (
          'font-size' => '20px',
          'font-weight' => '600',
        ),
        'tablets' => 
        array (
          'font-size' => '20px',
          'font-weight' => '600',
        ),
        'mobiles' => 
        array (
          'font-size' => '22px',
          'font-weight' => '600',
        ),
      ),
    ),
    'btn:1' => 
    array (
      'label' => '+312 123 3542',
      'link' => '%7B%22type%22%3A%22elm_value%22%7D',
      'hide_with_empty_link' => '1',
      'css' => 
      array (
        'default' => 
        array (
          'font-size' => '13px',
          'padding-left' => '18px',
          'padding-top' => '10px',
          'padding-bottom' => '10px',
          'padding-right' => '18px',
        ),
      ),
    ),
    'btn:2' => 
    array (
      'label' => 'info@example.com',
      'link' => '%7B%22type%22%3A%22elm_value%22%7D',
      'css' => 
      array (
        'default' => 
        array (
          'font-size' => '13px',
          'margin-left' => 'auto',
          'padding-left' => '18px',
          'padding-top' => '10px',
          'padding-bottom' => '10px',
          'padding-right' => '18px',
        ),
      ),
    ),
  ),

),

	'simple_4' => array(
  'default' => 
  array (
    'options' => 
    array (
      'sticky' => 0,
      'shadow' => 'none',
      'middle_height' => '130px',
      'middle_fullwidth' => 1,
      'middle_centering' => 1,
    ),
    'layout' => 
    array (
      'top_left' => 
      array (
      ),
      'top_center' => 
      array (
      ),
      'top_right' => 
      array (
      ),
      'middle_left' => 
      array (
        0 => 'menu:1',
        1 => 'dropdown:1',
      ),
      'middle_center' => 
      array (
        0 => 'vwrapper:1',
      ),
      'middle_right' => 
      array (
        0 => 'btn:1',
      ),
      'bottom_left' => 
      array (
      ),
      'bottom_center' => 
      array (
      ),
      'bottom_right' => 
      array (
      ),
      'hidden' => 
      array (
      ),
      'vwrapper:1' => 
      array (
        0 => 'text:2',
        1 => 'text:3',
      ),
    ),
  ),
  'laptops' => 
  array (
    'options' => 
    array (
      'sticky' => 0,
      'shadow' => 'none',
      'middle_height' => '110px',
      'middle_fullwidth' => 1,
      'middle_centering' => 1,
    ),
    'layout' => 
    array (
      'top_left' => 
      array (
      ),
      'top_center' => 
      array (
      ),
      'top_right' => 
      array (
      ),
      'middle_left' => 
      array (
        0 => 'menu:1',
        1 => 'dropdown:1',
      ),
      'middle_center' => 
      array (
        0 => 'vwrapper:1',
      ),
      'middle_right' => 
      array (
        0 => 'btn:1',
      ),
      'bottom_left' => 
      array (
      ),
      'bottom_center' => 
      array (
      ),
      'bottom_right' => 
      array (
      ),
      'hidden' => 
      array (
      ),
      'vwrapper:1' => 
      array (
        0 => 'text:2',
        1 => 'text:3',
      ),
    ),
  ),
  'tablets' => 
  array (
    'options' => 
    array (
      'sticky' => 0,
      'shadow' => 'none',
      'middle_height' => '110px',
      'middle_fullwidth' => 1,
      'middle_centering' => 1,
    ),
    'layout' => 
    array (
      'top_left' => 
      array (
      ),
      'top_center' => 
      array (
      ),
      'top_right' => 
      array (
      ),
      'middle_left' => 
      array (
        0 => 'menu:1',
        1 => 'dropdown:1',
      ),
      'middle_center' => 
      array (
        0 => 'vwrapper:1',
      ),
      'middle_right' => 
      array (
        0 => 'btn:1',
      ),
      'bottom_left' => 
      array (
      ),
      'bottom_center' => 
      array (
      ),
      'bottom_right' => 
      array (
      ),
      'hidden' => 
      array (
      ),
      'vwrapper:1' => 
      array (
        0 => 'text:2',
        1 => 'text:3',
      ),
    ),
  ),
  'mobiles' => 
  array (
    'options' => 
    array (
      'sticky' => 0,
      'shadow' => 'none',
      'middle_height' => '90px',
      'middle_fullwidth' => 1,
      'middle_centering' => 1,
    ),
    'layout' => 
    array (
      'top_left' => 
      array (
      ),
      'top_center' => 
      array (
      ),
      'top_right' => 
      array (
      ),
      'middle_left' => 
      array (
        0 => 'vwrapper:1',
      ),
      'middle_center' => 
      array (
      ),
      'middle_right' => 
      array (
        0 => 'menu:1',
      ),
      'bottom_left' => 
      array (
      ),
      'bottom_center' => 
      array (
      ),
      'bottom_right' => 
      array (
      ),
      'hidden' => 
      array (
        0 => 'dropdown:1',
        1 => 'btn:1',
      ),
      'vwrapper:1' => 
      array (
        0 => 'text:2',
        1 => 'text:3',
      ),
    ),
  ),
  'data' => 
  array (
    'menu:1' => 
    array (
      'indents' => '10px',
      'dropdown_arrow' => 1,
      'mobile_width' => '3000px',
      'mobile_layout' => 'panel',
      'mobile_font_size' => '1.2rem',
      'mobile_dropdown_font_size' => '1.2rem',
      'mobile_icon_size' => '30px',
      'mobile_icon_size_laptops' => '30px',
      'mobile_icon_size_tablets' => '30px',
      'mobile_icon_size_mobiles' => '30px',
      'mobile_icon_thickness' => '2px',
      'css' => 
      array (
        'default' => 
        array (
          'font-family' => 'h1',
          'font-weight' => '500',
        ),
      ),
    ),
    'dropdown:1' => 
    array (
      'links' => 
      array (
        0 => 
        array (
          'label' => 'FR',
          'url' => '%7B%22url%22%3A%22%23%22%2C%22target%22%3A%22%22%7D',
          'icon' => '',
        ),
        1 => 
        array (
          'label' => 'DE',
          'url' => '%7B%22url%22%3A%22%23%22%2C%22target%22%3A%22%22%7D',
          'icon' => '',
        ),
        2 => 
        array (
          'label' => 'ES',
          'url' => '%7B%22url%22%3A%22%23%22%2C%22target%22%3A%22%22%7D',
          'icon' => '',
        ),
      ),
      'link_title' => 'EN',
    ),
    'vwrapper:1' => 
    array (
      'alignment' => 'center',
      'valign' => 'middle',
      'inner_items_gap' => '0.3rem',
      'conditions' => 
      array (
      ),
    ),
    'text:2' => 
    array (
      'text' => 'Impreza',
      'link' => '%7B%22url%22%3A%22%2F%22%7D',
      'css' => 
      array (
        'default' => 
        array (
          'font-size' => '2rem',
          'line-height' => '1',
          'letter-spacing' => '0.04em',
          'font-family' => 'h1',
          'font-weight' => '600',
          'text-transform' => 'uppercase',
        ),
        'laptops' => 
        array (
          'font-size' => '1.8rem',
          'line-height' => '1',
          'letter-spacing' => '0.04em',
          'font-family' => 'h1',
          'font-weight' => '600',
          'text-transform' => 'uppercase',
        ),
        'tablets' => 
        array (
          'font-size' => '1.6rem',
          'line-height' => '1',
          'letter-spacing' => '0.04em',
          'font-family' => 'h1',
          'font-weight' => '600',
          'text-transform' => 'uppercase',
        ),
        'mobiles' => 
        array (
          'font-size' => '1.5rem',
          'line-height' => '1',
          'letter-spacing' => '0.04em',
          'font-family' => 'h1',
          'font-weight' => '600',
          'text-transform' => 'uppercase',
        ),
      ),
    ),
    'text:3' => 
    array (
      'text' => 'Impress yourself',
      'link' => '%7B%22url%22%3A%22%2F%22%7D',
      'css' => 
      array (
        'default' => 
        array (
          'font-size' => '14px',
          'line-height' => '1',
          'letter-spacing' => '0.15em',
          'font-family' => 'h1',
          'text-transform' => 'uppercase',
        ),
        'laptops' => 
        array (
          'font-size' => '13px',
          'line-height' => '1',
          'letter-spacing' => '0.15em',
          'font-family' => 'h1',
          'text-transform' => 'uppercase',
        ),
        'tablets' => 
        array (
          'font-size' => '12px',
          'line-height' => '1',
          'letter-spacing' => '0.15em',
          'font-family' => 'h1',
          'text-transform' => 'uppercase',
        ),
        'mobiles' => 
        array (
          'font-size' => '10px',
          'line-height' => '1',
          'letter-spacing' => '0.15em',
          'font-family' => 'h1',
          'text-transform' => 'uppercase',
        ),
      ),
    ),
    'btn:1' => 
    array (
      'label' => 'Hot Call',
      'link' => '%7B%22url%22%3A%22%23%22%7D',
      'css' => 
      array (
        'default' => 
        array (
          'color' => '_header_middle_text',
          'font-size' => '13px',
          'font-weight' => '400',
          'text-transform' => 'uppercase',
          'background-color' => 'transparent',
          'padding-left' => '2em',
          'padding-top' => '1em',
          'padding-bottom' => '1em',
          'padding-right' => '2em',
          'border-radius' => '0',
          'border-style' => 'solid',
          'border-left-width' => '1px',
          'border-top-width' => '1px',
          'border-bottom-width' => '1px',
          'border-right-width' => '1px',
          'border-color' => '_header_middle_text',
        ),
      ),
    ),
  ),
	),

	'centered_1' => array(
  'default' => 
  array (
    'options' => 
    array (
      'middle_height' => '100px',
      'middle_sticky_height' => '50px',
      'middle_centering' => 1,
      'bottom_show' => 1,
      'bottom_height' => '100px',
      'bottom_centering' => 1,
    ),
    'layout' => 
    array (
      'top_left' => 
      array (
      ),
      'top_center' => 
      array (
      ),
      'top_right' => 
      array (
      ),
      'middle_left' => 
      array (
      ),
      'middle_center' => 
      array (
        0 => 'image:1',
      ),
      'middle_right' => 
      array (
      ),
      'bottom_left' => 
      array (
      ),
      'bottom_center' => 
      array (
        0 => 'menu:1',
      ),
      'bottom_right' => 
      array (
      ),
      'hidden' => 
      array (
      ),
    ),
  ),
  'laptops' => 
  array (
    'options' => 
    array (
      'middle_height' => '90px',
      'middle_sticky_height' => '50px',
      'middle_centering' => 1,
      'bottom_show' => 1,
      'bottom_height' => '90px',
      'bottom_centering' => 1,
    ),
  ),
  'tablets' => 
  array (
    'options' => 
    array (
      'middle_height' => '70px',
      'middle_sticky_height' => '50px',
      'middle_centering' => 1,
      'bottom_show' => 1,
      'bottom_height' => '70px',
      'bottom_centering' => 1,
    ),
  ),
  'mobiles' => 
  array (
    'options' => 
    array (
      'middle_height' => '60px',
      'middle_centering' => 1,
      'bottom_centering' => 1,
    ),
    'layout' => 
    array (
      'top_left' => 
      array (
      ),
      'top_center' => 
      array (
      ),
      'top_right' => 
      array (
      ),
      'middle_left' => 
      array (
        0 => 'image:1',
      ),
      'middle_center' => 
      array (
      ),
      'middle_right' => 
      array (
        0 => 'menu:1',
      ),
      'bottom_left' => 
      array (
      ),
      'bottom_center' => 
      array (
      ),
      'bottom_right' => 
      array (
      ),
      'hidden' => 
      array (
      ),
    ),
  ),
  'data' => 
  array (
    'image:1' => 
    array (
      'img' => $us_template_directory_uri . '/img/us-logo.png',
      'link' => '%7B%22url%22%3A%22%22%7D',
      'height_default' => '40px',
      'height_laptops' => '35px',
      'height_tablets' => '30px',
      'height_sticky' => '25px',
      'height_sticky_laptops' => '25px',
      'css' => 
      array (
        'default' => 
        array (
          'margin-top' => '1rem',
          'margin-bottom' => '1rem',
        ),
      ),
    ),
    'menu:1' => 
    array (
      'vstretch' => 0,
      'mobile_width' => '600px',
      'mobile_layout' => 'fullscreen',
      'mobile_icon_thickness' => '2px',
    ),
  ),
	),

	'extended_1' => array(
  'default' => 
  array (
    'options' => 
    array (
      'scroll_breakpoint' => '50px',
      'top_show' => 1,
      'top_height' => '36px',
      'top_sticky_height' => '0px',
    ),
    'layout' => 
    array (
      'top_left' => 
      array (
        0 => 'text:2',
        1 => 'text:3',
      ),
      'top_right' => 
      array (
        0 => 'socials:1',
      ),
      'middle_left' => 
      array (
        0 => 'text:1',
      ),
      'middle_right' => 
      array (
        0 => 'menu:1',
        1 => 'search:1',
        2 => 'cart:1',
      ),
    ),
  ),
  'tablets' => 
  array (
    'options' => 
    array (
      'middle_sticky_height' => '50px',
    ),
    'layout' => 
    array (
      'top_left' => 
      array (
        0 => 'text:2',
        1 => 'text:3',
      ),
      'top_right' => 
      array (
        0 => 'socials:1',
      ),
      'middle_left' => 
      array (
        0 => 'text:1',
      ),
      'middle_right' => 
      array (
        0 => 'menu:1',
        1 => 'search:1',
        2 => 'cart:1',
      ),
    ),
  ),
  'mobiles' => 
  array (
    'options' => 
    array (
      'top_show' => 0,
      'middle_height' => '60px',
    ),
    'layout' => 
    array (
      'top_left' => 
      array (
        0 => 'text:2',
        1 => 'text:3',
      ),
      'top_right' => 
      array (
        0 => 'socials:1',
      ),
      'middle_left' => 
      array (
        0 => 'text:1',
      ),
      'middle_right' => 
      array (
        0 => 'menu:1',
        1 => 'search:1',
        2 => 'cart:1',
      ),
    ),
  ),
  'data' => 
  array (
    'text:2' => 
    array (
      'text' => '+321 123 4567',
      'link' => '%7B%22type%22%3A%22elm_value%22%7D',
      'icon' => 'far|phone',
      'css' => 
      array (
        'default' => 
        array (
          'font-size' => '15px',
        ),
      ),
    ),
    'text:3' => 
    array (
      'text' => 'info@example.com',
      'link' => '%7B%22type%22%3A%22elm_value%22%7D',
      'icon' => 'far|envelope',
      'css' => 
      array (
        'default' => 
        array (
          'font-size' => '15px',
        ),
      ),
    ),
    'socials:1' => 
    array (
      'items' => 
      array (
        0 => 
        array (
          'type' => 'facebook',
          'url' => '%7B%22url%22%3A%22%5C%2F%22%2C%22target%22%3A%22_blank%22%2C%22rel%22%3A%22nofollow%22%7D',
        ),
        1 => 
        array (
          'type' => 'twitter',
          'url' => '%7B%22url%22%3A%22%5C%2F%22%2C%22target%22%3A%22_blank%22%2C%22rel%22%3A%22nofollow%22%7D',
        ),
        2 => 
        array (
          'type' => 'vk',
          'url' => '%7B%22url%22%3A%22%5C%2F%22%2C%22target%22%3A%22_blank%22%2C%22rel%22%3A%22nofollow%22%7D',
        ),
        3 => 
        array (
          'type' => 'youtube',
          'url' => '%7B%22url%22%3A%22%5C%2F%22%2C%22target%22%3A%22_blank%22%2C%22rel%22%3A%22nofollow%22%7D',
        ),
        4 => 
        array (
          'type' => 'behance',
          'url' => '%7B%22url%22%3A%22%5C%2F%22%2C%22target%22%3A%22_blank%22%2C%22rel%22%3A%22nofollow%22%7D',
        ),
        5 => 
        array (
          'type' => 'houzz',
          'url' => '%7B%22url%22%3A%22%5C%2F%22%2C%22target%22%3A%22_blank%22%2C%22rel%22%3A%22nofollow%22%7D',
        ),
        6 => 
        array (
          'type' => 'instagram',
          'url' => '%7B%22url%22%3A%22%5C%2F%22%2C%22target%22%3A%22_blank%22%2C%22rel%22%3A%22nofollow%22%7D',
        ),
      ),
      'shape' => 'none',
      'icons_color' => 'text',
      'hover' => 'slide',
      'gap' => '0.5em',
      'css' => 
      array (
        'default' => 
        array (
          'font-size' => '18px',
        ),
      ),
    ),
    'menu:1' => 
    array (
      'hover_effect' => 'underline',
      'dropdown_font_size' => '16px',
      'mobile_width' => '901px',
      'mobile_font_size' => '20px',
      'mobile_dropdown_font_size' => '15px',
      'mobile_align' => 'left',
      'mobile_icon_size' => '32px',
      'mobile_icon_thickness' => '2px',
      'css' => 
      array (
        'default' => 
        array (
          'font-family' => 'h1',
          'font-size' => '18px',
        ),
      ),
    ),
    'search:1' => 
    array (
      'layout' => 'fullscreen',
      'icon' => 'far|search',
      'icon_size' => '20px',
      'icon_size_laptops' => '20px',
      'icon_size_tablets' => '20px',
      'field_width' => '240px',
    ),
    'cart:1' => 
    array (
      'vstretch' => 1,
      'dropdown_effect' => 'height',
      'icon' => 'far|shopping-cart',
      'size' => '20px',
      'size_laptops' => '24px',
      'size_tablets' => '20px',
      'size_mobiles' => '20px',
    ),
    'text:1' => 
    array (
      'text' => 'IMPREZA',
      'link' => '%7B%22url%22%3A%22%2F%22%7D',
      'css' => 
      array (
        'default' => 
        array (
          'font-family' => 'h1',
          'font-size' => '1.6rem',
        ),
      ),
    ),
  ),
),

	'extended_2' => array(
  'default' => 
  array (
    'options' => 
    array (
      'transparent' => 1,
      'shadow' => 'none',
      'middle_height' => '120px',
      'middle_sticky_height' => '70px',
      'middle_transparent_text_color' => '_header_middle_text',
      'middle_transparent_text_hover_color' => '_header_middle_text_hover',
    ),
    'layout' => 
    array (
      'top_left' => 
      array (
      ),
      'top_center' => 
      array (
      ),
      'top_right' => 
      array (
      ),
      'middle_left' => 
      array (
      ),
      'middle_center' => 
      array (
        0 => 'hwrapper:1',
      ),
      'middle_right' => 
      array (
      ),
      'bottom_left' => 
      array (
      ),
      'bottom_center' => 
      array (
      ),
      'bottom_right' => 
      array (
      ),
      'hidden' => 
      array (
      ),
      'hwrapper:1' => 
      array (
        0 => 'text:2',
        1 => 'menu:1',
        2 => 'btn:1',
        3 => 'search:1',
      ),
    ),
  ),
  'tablets' => 
  array (
    'layout' => 
    array (
      'top_left' => 
      array (
      ),
      'top_center' => 
      array (
      ),
      'top_right' => 
      array (
      ),
      'middle_left' => 
      array (
      ),
      'middle_center' => 
      array (
        0 => 'hwrapper:1',
      ),
      'middle_right' => 
      array (
      ),
      'bottom_left' => 
      array (
      ),
      'bottom_center' => 
      array (
      ),
      'bottom_right' => 
      array (
      ),
      'hidden' => 
      array (
        0 => 'btn:1',
      ),
      'hwrapper:1' => 
      array (
        0 => 'text:2',
        1 => 'menu:1',
        2 => 'search:1',
      ),
    ),
  ),
  'mobiles' => 
  array (
    'options' => 
    array (
      'middle_height' => '90px',
      'middle_sticky_height' => '70px',
    ),
    'layout' => 
    array (
      'top_left' => 
      array (
      ),
      'top_center' => 
      array (
      ),
      'top_right' => 
      array (
      ),
      'middle_left' => 
      array (
      ),
      'middle_center' => 
      array (
        0 => 'hwrapper:1',
      ),
      'middle_right' => 
      array (
      ),
      'bottom_left' => 
      array (
      ),
      'bottom_center' => 
      array (
      ),
      'bottom_right' => 
      array (
      ),
      'hidden' => 
      array (
        0 => 'btn:1',
      ),
      'hwrapper:1' => 
      array (
        0 => 'text:2',
        1 => 'menu:1',
        2 => 'search:1',
      ),
    ),
  ),
  'data' => 
  array (
    'search:1' => 
    array (
      'layout' => 'fullscreen',
      'icon' => 'far|search',
      'icon_size' => '22px',
      'icon_size_laptops' => '22px',
      'css' => 
      array (
        'default' => 
        array (
          'line-height' => '50px',
        ),
      ),
    ),
    'text:2' => 
    array (
      'text' => 'Impreza',
      'link' => '%7B%22url%22%3A%22%2F%22%7D',
      'css' => 
      array (
        'default' => 
        array (
          'font-size' => '1.2rem',
          'letter-spacing' => '1px',
          'font-family' => 'h1',
          'font-weight' => '600',
          'text-transform' => 'uppercase',
        ),
      ),
    ),
    'menu:1' => 
    array (
      'color_transparent_active_text' => '_header_middle_text_hover',
      'mobile_layout' => 'fullscreen',
      'mobile_font_size' => '1.2rem',
      'mobile_dropdown_font_size' => '1rem',
      'mobile_align' => 'center',
      'mobile_icon_size' => '28px',
      'mobile_icon_size_laptops' => '28px',
      'mobile_icon_thickness' => '2px',
      'css' => 
      array (
        'tablets' => 
        array (
          'margin-left' => 'auto',
        ),
        'mobiles' => 
        array (
          'margin-left' => 'auto',
        ),
      ),
    ),
    'hwrapper:1' => 
    array (
      'valign' => 'middle',
      'inner_items_gap' => '1.20rem',
      'conditions' => 
      array (
      ),
      'css' => 
      array (
        'default' => 
        array (
          'color' => '_header_middle_text',
          'background-color' => '_header_middle_bg',
          'width' => '100%',
          'margin-left' => '0',
          'margin-top' => '0',
          'margin-bottom' => '0',
          'margin-right' => '0',
          'padding-left' => '30px',
          'padding-top' => '10px',
          'padding-bottom' => '10px',
          'padding-right' => '15px',
          'border-radius' => '5px',
          'box-shadow-h-offset' => '0',
          'box-shadow-v-offset' => '3px',
          'box-shadow-blur' => '2rem',
          'box-shadow-color' => 'rgba(0,0,0,0.10)',
        ),
        'laptops' => 
        array (
          'margin-left' => '0',
          'margin-top' => '0',
          'margin-bottom' => '0',
          'margin-right' => '0',
          'padding-left' => '30px',
          'padding-top' => '10px',
          'padding-bottom' => '10px',
          'padding-right' => '15px',
        ),
        'tablets' => 
        array (
          'margin-left' => '0',
          'margin-top' => '0',
          'margin-bottom' => '0',
          'margin-right' => '0',
          'padding-left' => '30px',
          'padding-top' => '10px',
          'padding-bottom' => '10px',
          'padding-right' => '15px',
        ),
        'mobiles' => 
        array (
          'margin-left' => '0',
          'margin-top' => '0',
          'margin-bottom' => '0',
          'margin-right' => '0',
          'padding-left' => '20px',
          'padding-top' => '10px',
          'padding-bottom' => '10px',
          'padding-right' => '10px',
        ),
      ),
    ),
    'btn:1' => 
    array (
      'label' => 'Purchase Now',
      'link' => '%7B%22url%22%3A%22%23%22%7D',
      'css' => 
      array (
        'default' => 
        array (
          'font-size' => '13px',
          'margin-left' => 'auto',
        ),
      ),
    ),
  ),
	),

	'extended_3' => array(
  'default' => 
  array (
    'options' => 
    array (
      'middle_height' => '100px',
    ),
    'layout' => 
    array (
      'top_left' => 
      array (
      ),
      'top_center' => 
      array (
      ),
      'top_right' => 
      array (
      ),
      'middle_left' => 
      array (
        0 => 'image:1',
        1 => 'text:1',
      ),
      'middle_center' => 
      array (
      ),
      'middle_right' => 
      array (
        0 => 'vwrapper:1',
      ),
      'bottom_left' => 
      array (
      ),
      'bottom_center' => 
      array (
      ),
      'bottom_right' => 
      array (
      ),
      'hidden' => 
      array (
      ),
      'vwrapper:1' => 
      array (
        0 => 'hwrapper:1',
        1 => 'menu:1',
      ),
      'hwrapper:1' => 
      array (
        0 => 'text:2',
        1 => 'text:3',
        2 => 'socials:1',
      ),
    ),
  ),
  'tablets' => 
  array (
    'options' => 
    array (
      'top_show' => 1,
      'top_sticky_height' => '0px',
    ),
    'layout' => 
    array (
      'top_left' => 
      array (
      ),
      'top_center' => 
      array (
        0 => 'hwrapper:1',
      ),
      'top_right' => 
      array (
      ),
      'middle_left' => 
      array (
        0 => 'image:1',
        1 => 'text:1',
      ),
      'middle_center' => 
      array (
      ),
      'middle_right' => 
      array (
        0 => 'menu:1',
      ),
      'bottom_left' => 
      array (
      ),
      'bottom_center' => 
      array (
      ),
      'bottom_right' => 
      array (
      ),
      'hidden' => 
      array (
        0 => 'vwrapper:1',
      ),
      'vwrapper:1' => 
      array (
      ),
      'hwrapper:1' => 
      array (
        0 => 'text:2',
        1 => 'text:3',
        2 => 'socials:1',
      ),
    ),
  ),
  'mobiles' => 
  array (
    'options' => 
    array (
      'middle_height' => '70px',
    ),
    'layout' => 
    array (
      'top_left' => 
      array (
      ),
      'top_center' => 
      array (
        0 => 'hwrapper:1',
      ),
      'top_right' => 
      array (
      ),
      'middle_left' => 
      array (
        0 => 'image:1',
        1 => 'text:1',
      ),
      'middle_center' => 
      array (
      ),
      'middle_right' => 
      array (
        0 => 'menu:1',
      ),
      'bottom_left' => 
      array (
      ),
      'bottom_center' => 
      array (
      ),
      'bottom_right' => 
      array (
      ),
      'hidden' => 
      array (
        0 => 'vwrapper:1',
      ),
      'vwrapper:1' => 
      array (
      ),
      'hwrapper:1' => 
      array (
        0 => 'text:2',
        1 => 'text:3',
        2 => 'socials:1',
      ),
    ),
  ),
  'data' => 
  array (
    'image:1' => 
    array (
      'img' => $us_template_directory_uri . '/img/us-core.png',
      'link' => '%7B%22url%22%3A%22%2F%22%7D',
      'height_default' => '45px',
      'height_laptops' => '40px',
      'height_tablets' => '35px',
      'height_mobiles' => '30px',
      'height_sticky' => '30px',
      'height_sticky_tablets' => '30px',
      'height_sticky_mobiles' => '30px',
      'css' => 
      array (
        'default' => 
        array (
          'margin-right' => '15px',
        ),
      ),
    ),
    'vwrapper:1' => 
    array (
      'alignment' => 'right',
      'valign' => 'middle',
    ),
    'hwrapper:1' => 
    array (
      'alignment' => 'right',
      'valign' => 'middle',
      'inner_items_gap' => '1.5rem',
      'css' => 
      array (
        'default' => 
        array (
          'font-size' => '15px',
        ),
      ),
      'hide_for_sticky' => 1,
    ),
    'menu:1' => 
    array (
      'align_edges' => 1,
      'vstretch' => 0,
      'css' => 
      array (
        'default' => 
        array (
          'font-size' => '1.2rem',
        ),
      ),
    ),
    'text:2' => 
    array (
      'text' => 'info@example.com',
      'link' => '%7B%22type%22%3A%22elm_value%22%7D',
    ),
    'text:3' => 
    array (
      'text' => '+321 123 4567',
      'link' => '%7B%22type%22%3A%22elm_value%22%7D',
    ),
    'socials:1' => 
    array (
      'items' => 
      array (
        0 => 
        array (
          'type' => 'facebook',
          'url' => '%7B%22url%22%3A%22%23%22%7D',
        ),
        1 => 
        array (
          'type' => 'twitter',
          'url' => '%7B%22url%22%3A%22%23%22%7D',
        ),
        2 => 
        array (
          'type' => 'instagram',
          'url' => '%7B%22url%22%3A%22%23%22%7D',
        ),
        3 => 
        array (
          'type' => 'linkedin',
          'url' => '%7B%22url%22%3A%22%23%22%7D',
        ),
        4 => 
        array (
          'type' => 'youtube',
          'url' => '%7B%22url%22%3A%22%23%22%7D',
        ),
      ),
      'shape' => 'none',
      'icons_color' => 'text',
      'gap' => '0.5em',
    ),
    'text:1' => 
    array (
      'text' => 'Impreza',
      'link' => '%7B%22url%22%3A%22%2F%22%7D',
      'css' => 
      array (
        'default' => 
        array (
          'font-size' => '30px',
          'font-weight' => '700',
        ),
        'laptops' => 
        array (
          'font-size' => '28px',
          'font-weight' => '700',
        ),
        'tablets' => 
        array (
          'font-size' => '24px',
          'font-weight' => '700',
        ),
        'mobiles' => 
        array (
          'font-size' => '20px',
          'font-weight' => '700',
        ),
      ),
    ),
  ),
	),

	'triple_1' => array(
  'default' => 
  array (
    'options' => 
    array (
      'scroll_breakpoint' => '50px',
      'shadow' => 'none',
      'top_show' => 1,
      'top_height' => '30px',
      'top_sticky_height' => '0px',
      'top_bg_color' => '_content_primary',
      'top_text_color' => '_content_bg',
      'top_text_hover_color' => '_content_heading',
      'top_transparent_text_hover_color' => '_header_transparent_text_hover',
      'middle_sticky_height' => '0px',
      'middle_centering' => 1,
      'bottom_show' => 1,
      'bottom_bg_color' => '_header_top_bg',
      'bottom_text_color' => '_header_top_text',
      'bottom_text_hover_color' => '_header_top_text_hover',
    ),
    'layout' => 
    array (
      'top_left' => 
      array (
      ),
      'top_center' => 
      array (
        0 => 'text:1',
      ),
      'top_right' => 
      array (
      ),
      'middle_left' => 
      array (
        0 => 'text:5',
      ),
      'middle_center' => 
      array (
        0 => 'search:1',
      ),
      'middle_right' => 
      array (
        0 => 'vwrapper:1',
      ),
      'bottom_left' => 
      array (
        0 => 'menu:1',
      ),
      'bottom_center' => 
      array (
      ),
      'bottom_right' => 
      array (
        0 => 'btn:1',
        1 => 'text:2',
        2 => 'cart:1',
      ),
      'hidden' => 
      array (
      ),
      'vwrapper:1' => 
      array (
        0 => 'text:4',
        1 => 'text:3',
      ),
    ),
  ),
  'tablets' => 
  array (
    'layout' => 
    array (
      'top_left' => 
      array (
      ),
      'top_center' => 
      array (
        0 => 'text:1',
      ),
      'top_right' => 
      array (
      ),
      'middle_left' => 
      array (
        0 => 'text:5',
      ),
      'middle_center' => 
      array (
        0 => 'search:1',
      ),
      'middle_right' => 
      array (
        0 => 'vwrapper:1',
      ),
      'bottom_left' => 
      array (
        0 => 'menu:1',
      ),
      'bottom_center' => 
      array (
      ),
      'bottom_right' => 
      array (
        0 => 'text:2',
        1 => 'cart:1',
      ),
      'hidden' => 
      array (
        0 => 'btn:1',
      ),
      'vwrapper:1' => 
      array (
        0 => 'text:4',
        1 => 'text:3',
      ),
    ),
  ),
  'mobiles' => 
  array (
    'options' => 
    array (
      'scroll_breakpoint' => '60px',
      'middle_height' => '60px',
      'bottom_show' => 0,
    ),
    'layout' => 
    array (
      'top_left' => 
      array (
      ),
      'top_center' => 
      array (
        0 => 'text:1',
      ),
      'top_right' => 
      array (
      ),
      'middle_left' => 
      array (
        0 => 'text:5',
      ),
      'middle_center' => 
      array (
      ),
      'middle_right' => 
      array (
        0 => 'menu:1',
        1 => 'search:1',
        2 => 'text:2',
        3 => 'cart:1',
      ),
      'bottom_left' => 
      array (
      ),
      'bottom_center' => 
      array (
      ),
      'bottom_right' => 
      array (
      ),
      'hidden' => 
      array (
        0 => 'vwrapper:1',
        1 => 'btn:1',
      ),
      'vwrapper:1' => 
      array (
        0 => 'text:3',
        1 => 'text:4',
      ),
    ),
  ),
  'data' => 
  array (
    'vwrapper:1' => 
    array (
      'alignment' => 'right',
      'inner_items_gap' => '0rem',
      'conditions' => 
      array (
      ),
    ),
    'search:1' => 
    array (
      'text' => 'Search our store',
      'search_post_type' => 'product',
      'layout' => 'simple',
      'icon' => 'far|search',
      'icon_size' => '1.2rem',
      'icon_size_laptops' => '1.2rem',
      'icon_size_tablets' => '1.2rem',
      'icon_size_mobiles' => '1.2rem',
      'field_width' => '70vw',
      'field_width_laptops' => '60vw',
      'field_width_tablets' => '40vw',
    ),
    'text:2' => 
    array (
      'text' => '',
      'link' => '%7B%22url%22%3A%22%2Fmy-account%2F%22%7D',
      'icon' => 'far|user',
      'css' => 
      array (
        'default' => 
        array (
          'font-size' => '1.4rem',
        ),
        'laptops' => 
        array (
          'font-size' => '1.4rem',
        ),
        'tablets' => 
        array (
          'font-size' => '1.3rem',
        ),
        'mobiles' => 
        array (
          'font-size' => '1.2rem',
          'margin-left' => '0.5rem',
          'margin-right' => '0.5rem',
        ),
      ),
    ),
    'text:3' => 
    array (
      'text' => '+321 123 4567',
      'link' => '%7B%22type%22%3A%22elm_value%22%7D',
      'css' => 
      array (
        'default' => 
        array (
          'font-size' => '24px',
          'font-weight' => '700',
        ),
        'laptops' => 
        array (
          'font-size' => '22px',
          'font-weight' => '700',
        ),
        'tablets' => 
        array (
          'font-size' => '20px',
          'font-weight' => '700',
        ),
        'mobiles' => 
        array (
          'font-size' => '24px',
          'font-weight' => '700',
        ),
      ),
    ),
    'text:4' => 
    array (
      'text' => 'Call us toll free!',
      'link' => '%7B%22url%22%3A%22%22%7D',
      'css' => 
      array (
        'default' => 
        array (
          'font-size' => '13px',
          'line-height' => '1',
          'text-transform' => 'uppercase',
        ),
      ),
    ),
    'menu:1' => 
    array (
      'indents' => '1rem',
      'align_edges' => 1,
      'mobile_font_size' => '1.2rem',
      'mobile_align' => 'left',
      'mobile_icon_size' => '20px',
      'mobile_icon_size_tablets' => '24px',
      'mobile_icon_size_mobiles' => '20px',
      'mobile_icon_thickness' => '2px',
      'css' => 
      array (
        'default' => 
        array (
          'font-size' => '15px',
          'font-weight' => '700',
          'text-transform' => 'uppercase',
        ),
      ),
    ),
    'cart:1' => 
    array (
      'hide_empty' => 0,
      'vstretch' => '0',
      'dropdown_effect' => 'mdesign',
      'icon' => 'far|shopping-basket',
      'size' => '1.4rem',
      'size_laptops' => '24px',
      'size_tablets' => '1.3rem',
      'size_mobiles' => '1.2rem',
      'css' => 
      array (
        'default' => 
        array (
          'margin-top' => '',
          'margin-right' => '-0.7rem',
          'margin-bottom' => '',
          'margin-left' => '0.7rem',
        ),
      ),
    ),
    'text:1' => 
    array (
      'text' => '100% Free Shipping in USA!',
      'link' => '%7B%22url%22%3A%22%22%7D',
      'css' => 
      array (
        'default' => 
        array (
          'font-size' => '14px',
        ),
      ),
    ),
    'btn:1' => 
    array (
      'label' => 'Join The Shop Club',
      'link' => '%7B%22url%22%3A%22%22%7D',
      'hide_with_empty_link' => 1,
      'css' => 
      array (
        'default' => 
        array (
          'font-size' => '11px',
        ),
      ),
    ),
    'text:5' => 
    array (
      'text' => 'Impreza Shop',
      'link' => '%7B%22url%22%3A%22%2F%22%7D',
      'css' => 
      array (
        'default' => 
        array (
          'font-size' => '1.2rem',
          'font-family' => 'h1',
          'font-weight' => '700',
          'text-transform' => 'capitalize',
        ),
        'laptops' => 
        array (
          'font-size' => '1.2rem',
          'font-family' => 'h1',
          'font-weight' => '700',
          'text-transform' => 'capitalize',
        ),
        'tablets' => 
        array (
          'font-size' => '1rem',
          'font-family' => 'h1',
          'font-weight' => '700',
          'text-transform' => 'capitalize',
        ),
        'mobiles' => 
        array (
          'font-size' => '15px',
          'font-family' => 'h1',
          'font-weight' => '700',
          'text-transform' => 'capitalize',
        ),
      ),
    ),
  ),
	),

	'triple_2' => array(
  'default' => 
  array (
    'options' => 
    array (
      'sticky' => 0,
      'top_show' => 1,
      'middle_height' => '100px',
      'middle_sticky_height' => '0px',
      'bottom_show' => 1,
    ),
    'layout' => 
    array (
      'top_left' => 
      array (
        0 => 'text:7',
        1 => 'text:5',
        2 => 'text:6',
      ),
      'top_center' => 
      array (
      ),
      'top_right' => 
      array (
        0 => 'text:3',
        1 => 'text:2',
      ),
      'middle_left' => 
      array (
      ),
      'middle_center' => 
      array (
        0 => 'hwrapper:1',
      ),
      'middle_right' => 
      array (
      ),
      'bottom_left' => 
      array (
        0 => 'menu:1',
      ),
      'bottom_center' => 
      array (
      ),
      'bottom_right' => 
      array (
        0 => 'text:4',
      ),
      'hidden' => 
      array (
      ),
      'hwrapper:1' => 
      array (
        0 => 'image:1',
        1 => 'search:1',
        2 => 'text:1',
        3 => 'cart:1',
      ),
    ),
  ),
  'laptops' => 
  array (
    'options' => 
    array (
      'sticky' => 0,
      'top_show' => 1,
      'middle_height' => '100px',
      'middle_sticky_height' => '0px',
      'bottom_show' => 1,
    ),
    'layout' => 
    array (
      'top_left' => 
      array (
        0 => 'text:7',
        1 => 'text:5',
        2 => 'text:6',
      ),
      'top_center' => 
      array (
      ),
      'top_right' => 
      array (
        0 => 'text:3',
        1 => 'text:2',
      ),
      'middle_left' => 
      array (
      ),
      'middle_center' => 
      array (
        0 => 'hwrapper:1',
      ),
      'middle_right' => 
      array (
      ),
      'bottom_left' => 
      array (
        0 => 'menu:1',
      ),
      'bottom_center' => 
      array (
      ),
      'bottom_right' => 
      array (
        0 => 'text:4',
      ),
      'hidden' => 
      array (
      ),
      'hwrapper:1' => 
      array (
        0 => 'image:1',
        1 => 'search:1',
        2 => 'text:1',
        3 => 'cart:1',
      ),
    ),
  ),
  'tablets' => 
  array (
    'options' => 
    array (
      'sticky' => 0,
      'top_show' => 1,
      'middle_height' => '100px',
      'middle_sticky_height' => '0px',
      'bottom_show' => 1,
    ),
    'layout' => 
    array (
      'top_left' => 
      array (
        0 => 'text:7',
      ),
      'top_center' => 
      array (
      ),
      'top_right' => 
      array (
        0 => 'text:3',
        1 => 'text:2',
      ),
      'middle_left' => 
      array (
      ),
      'middle_center' => 
      array (
        0 => 'hwrapper:1',
      ),
      'middle_right' => 
      array (
      ),
      'bottom_left' => 
      array (
        0 => 'menu:1',
      ),
      'bottom_center' => 
      array (
      ),
      'bottom_right' => 
      array (
        0 => 'text:4',
      ),
      'hidden' => 
      array (
        0 => 'text:5',
        1 => 'text:6',
      ),
      'hwrapper:1' => 
      array (
        0 => 'image:1',
        1 => 'search:1',
        2 => 'text:1',
        3 => 'cart:1',
      ),
    ),
  ),
  'mobiles' => 
  array (
    'options' => 
    array (
      'top_sticky_height' => '0px',
      'middle_height' => '60px',
      'middle_sticky_height' => '0px',
      'bottom_show' => 1,
    ),
    'layout' => 
    array (
      'top_left' => 
      array (
      ),
      'top_center' => 
      array (
      ),
      'top_right' => 
      array (
      ),
      'middle_left' => 
      array (
        0 => 'image:1',
      ),
      'middle_center' => 
      array (
        0 => 'hwrapper:1',
      ),
      'middle_right' => 
      array (
        0 => 'search:1',
        1 => 'text:1',
        2 => 'cart:1',
      ),
      'bottom_left' => 
      array (
        0 => 'menu:1',
      ),
      'bottom_center' => 
      array (
      ),
      'bottom_right' => 
      array (
        0 => 'text:4',
      ),
      'hidden' => 
      array (
        0 => 'text:3',
        1 => 'text:2',
        2 => 'text:7',
        3 => 'text:5',
        4 => 'text:6',
      ),
      'hwrapper:1' => 
      array (
      ),
    ),
  ),
  'data' => 
  array (
    'image:1' => 
    array (
      'img' => $us_template_directory_uri . '/img/us-logo.png',
      'link' => '%7B%22url%22%3A%22%2F%22%7D',
      'height_default' => '30px',
      'height_sticky' => '30px',
    ),
    'search:1' => 
    array (
      'text' => 'I\'m shopping for...',
      'layout' => 'simple',
      'icon_size' => '20px',
      'icon_size_laptops' => '20px',
      'icon_size_tablets' => '20px',
      'field_width' => '100%',
      'field_width_laptops' => '100%',
      'field_width_tablets' => '100%',
    ),
    'text:3' => 
    array (
      'text' => 'info@example.com',
      'link' => '%7B%22type%22%3A%22elm_value%22%7D',
      'icon' => 'fas|envelope',
      'css' => 
      array (
        'default' => 
        array (
          'font-size' => '14px',
        ),
      ),
    ),
    'text:4' => 
    array (
      'text' => 'Special Offers',
      'link' => '%7B%22url%22%3A%22%23%22%7D',
      'css' => 
      array (
        'default' => 
        array (
          'color' => '_header_middle_text_hover',
          'font-weight' => '600',
        ),
        'laptops' => 
        array (
          'color' => '_header_middle_text_hover',
          'font-weight' => '600',
        ),
        'tablets' => 
        array (
          'color' => '_header_middle_text_hover',
          'font-weight' => '600',
        ),
        'mobiles' => 
        array (
          'color' => '_header_middle_text_hover',
          'font-size' => '13px',
          'font-weight' => '600',
        ),
      ),
    ),
    'text:5' => 
    array (
      'text' => 'Shipping & Delivery',
      'link' => '%7B%22url%22%3A%22%23%22%7D',
      'icon' => 'fas|ship',
      'css' => 
      array (
        'default' => 
        array (
          'font-size' => '14px',
        ),
      ),
    ),
    'text:6' => 
    array (
      'text' => 'Order Status',
      'link' => '%7B%22url%22%3A%22%23%22%7D',
      'icon' => 'fas|truck',
      'css' => 
      array (
        'default' => 
        array (
          'font-size' => '14px',
        ),
      ),
    ),
    'text:7' => 
    array (
      'text' => 'Change Location',
      'link' => '{"url":"#"}',
      'icon' => 'fas|map-marker',
      'css' => 
      array (
        'default' => 
        array (
          'font-size' => '14px',
        ),
      ),
    ),
    'cart:1' => 
    array (
      'vstretch' => 0,
      'icon' => 'fas|shopping-basket',
      'size' => '24px',
    ),
    'menu:1' => 
    array (
      'align_edges' => 1,
      'css' => 
      array (
        'default' => 
        array (
          'font-weight' => '600',
        ),
      ),
    ),
    'text:2' => 
    array (
      'text' => '+321 123 4567',
      'link' => '%7B%22type%22%3A%22elm_value%22%7D',
      'icon' => 'fas|phone',
      'css' => 
      array (
        'default' => 
        array (
          'font-size' => '14px',
        ),
      ),
    ),
    'hwrapper:1' => 
    array (
      'valign' => 'middle',
      'inner_items_gap' => '1.20rem',
      'conditions' => 
      array (
      ),
      'css' => 
      array (
        'default' => 
        array (
          'width' => '100%',
          'margin-left' => '0',
          'margin-top' => '0',
          'margin-bottom' => '0',
          'margin-right' => '0',
        ),
      ),
    ),
    'text:1' => 
    array (
      'text' => '',
      'link' => '%7B%22url%22%3A%22%2Fmy-account%2F%22%7D',
      'icon' => 'fas|user',
      'css' => 
      array (
        'default' => 
        array (
          'text-align' => 'center',
          'font-size' => '24px',
          'line-height' => '50px',
          'min-width' => '2.2em',
          'margin-left' => '0',
          'margin-top' => '0',
          'margin-bottom' => '0',
          'margin-right' => '0',
        ),
        'laptops' => 
        array (
          'text-align' => 'center',
          'font-size' => '24px',
          'line-height' => '50px',
        ),
        'tablets' => 
        array (
          'text-align' => 'center',
          'font-size' => '22px',
          'line-height' => '50px',
        ),
        'mobiles' => 
        array (
          'text-align' => 'center',
          'font-size' => '20px',
          'line-height' => '50px',
        ),
      ),
    ),
  ),
	),

	'vertical_1' => array(
  'data' => 
  array (
    'menu:1' => 
    array (
      'indents' => '0.8rem',
      'vstretch' => 0,
      'hover_effect' => 'underline',
      'mobile_width' => '980px',
      'mobile_font_size' => '1.2rem',
      'mobile_dropdown_font_size' => '1rem',
      'mobile_align' => 'left',
      'css' => 
      array (
        'default' => 
        array (
          'font-size' => '1.2rem',
        ),
      ),
    ),
    'text:1' => 
    array (
      'text' => 'Impreza',
      'link' => '%7B%22url%22%3A%22%2F%22%7D',
      'css' => 
      array (
        'default' => 
        array (
          'font-size' => '32px',
          'font-weight' => '600',
          'text-transform' => 'uppercase',
          'margin-left' => '1.3rem',
          'margin-top' => '5vh',
          'margin-right' => '1.3rem',
        ),
      ),
    ),
    'btn:1' => 
    array (
      'label' => 'Get Started',
      'link' => '%7B%22url%22%3A%22%22%7D',
      'css' => 
      array (
        'default' => 
        array (
          'margin-left' => '1.3rem',
          'margin-bottom' => '5vh',
          'margin-right' => '1.3rem',
        ),
      ),
    ),
  ),
  'default' => 
  array (
    'layout' => 
    array (
      'hidden' => 
      array (
      ),
      'middle_left' => 
      array (
        0 => 'menu:1',
      ),
      'bottom_left' => 
      array (
        0 => 'btn:1',
      ),
      'top_left' => 
      array (
        0 => 'text:1',
      ),
    ),
    'options' => 
    array (
      'orientation' => 'ver',
      'width' => '280px',
      'top_show' => 1,
      'top_bg_color' => '_header_middle_bg',
      'top_text_color' => '_header_middle_text',
      'top_text_hover_color' => '_header_middle_text_hover',
      'elm_valign' => 'middle',
      'bottom_show' => 1,
    ),
  ),
  'laptops' => 
  array (
    'options' => 
    array (
      'width' => '250px',
    ),
  ),
  'tablets' => 
  array (
    'options' => 
    array (
      'width' => '250px',
      'elm_align' => 'left',
    ),
  ),
  'mobiles' => 
  array (
    'layout' => 
    array (
      'hidden' => 
      array (
      ),
      'middle_left' => 
      array (
        0 => 'text:1',
        1 => 'menu:1',
        2 => 'btn:1',
      ),
      'bottom_left' => 
      array (
      ),
      'top_left' => 
      array (
      ),
    ),
    'options' => 
    array (
      'width' => '250px',
      'elm_align' => 'left',
    ),
  ),
	),

	'vertical_2' => array(
		'default' => array(
			'options' => array(
				'orientation' => 'ver',
				'width' => '250px',
				'top_show' => 0,
				'elm_valign' => 'middle',
				'bottom_show' => 1,
			),
			'layout' => array(
				'middle_left' => array(
					'image:1',
					'menu:1',
				),
				'bottom_left' => array(
					'text:2',
					'socials:1',
				),
			),
		),
		'data' => array(
			'image:1' => array(
				'img' => $us_template_directory_uri . '/img/us-core.png',
				'link' => '{"url":"/"}',
				'height_default' => '90px',
				'height_laptops' => '90px',
				'height_tablets' => '90px',
				'height_mobiles' => '60px',
			),
			'menu:1' => array(
				'indents' => '1.5vh',
				'css' => array(
					'default' => array(
						'font-size' => '1.2rem',
					),
				),
			),
			'text:2' => array(
				'text' => '+321 123 4567',
				'link' => '{"type":"elm_value"}',
				'css' => array(
					'default' => array(
						'font-size' => '18px',
					),
					'tablets' => array(
						'font-size' => '18px',
					),
					'mobiles' => array(
						'font-size' => '16px',
					),
				),
			),
			'socials:1' => array(
				'items' => array(
					array(
						'type' => 'facebook',
						'url' => '{"url":"#"}',
					),
					array(
						'type' => 'twitter',
						'url' => '{"url":"#"}',
					),
					array(
						'type' => 'google',
						'url' => '{"url":"#"}',
					),
				),
			),
		),
	),

);
