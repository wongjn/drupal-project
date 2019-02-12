/**
 * @file
 * Support detection for browser features.
 */

/**
 * Whether animationend event is supported.
 *
 * @var {bool}
 */
export const ANIMATIONEND = 'onanimationend' in window;

/**
 * Whether ResizeObserver API is supported.
 *
 * @var {bool}
 */
export const RESIZE_OBSERVER = 'ResizeObserver' in window;

/**
 * Whether the CSS JavaScript API is supported.
 *
 * @var {bool}
 */
export const CSS_API = 'CSS' in window;

/**
 * Whether the CSS.supports() is supported.
 *
 * @var {bool}
 */
export const CSS_SUPPORTS = CSS_API && 'supports' in CSS;

/**
 * Whether CSS properties are supported.
 *
 * @var {bool}
 */
export const CSS_CUSTOM_PROPERTIES = CSS_SUPPORTS && CSS.supports('--a', '0');
