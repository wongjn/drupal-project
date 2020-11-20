/**
 * @file
 * General DOM utilities.
 */

/**
 * Gets matching elements in a DOM as an array.
 *
 * @param {string} selector
 *   The CSS selector to match.
 * @param {HTMLDocument|HTMLElement} context
 *   The DOM element to get matching elements from.
 *
 * @return {HTMLElement[]}
 *   The matching elements.
 */
export const matchChildren = (selector, context) =>
  Array.from(context.querySelectorAll(selector));

/**
 * Returns an array of itself if matches selector, or empty array.
 *
 * @param {string} selector
 *   The CSS selector to match.
 * @param {HTMLDocument|HTMLElement} context
 *   The DOM element set as matching.
 *
 * @return {HTMLElement[]}
 *   Matching self in an array or empty array.
 */
export const matchSelf = (selector, context) =>
  'matches' in context && context.matches(selector) ? [context] : [];

/**
 * Gets matching elements in a DOM (and possibly self) as an array.
 *
 * @param {string} selector
 *   The CSS selector to match.
 * @param {HTMLDocument|HTMLElement} context
 *   The DOM element to get matching elements from.
 *
 * @return {HTMLElement[]}
 *   The matching elements.
 */
export const match = (selector, context) => [
  ...matchChildren(selector, context),
  ...matchSelf(selector, context),
];

/**
 * Dispatches a bubbling custom event on an element.
 *
 * @param {Element} element
 *   The element to dispatch the event on.
 * @param {string} eventName
 *   The name of the event.
 * @param {any} [detail]
 *   Optional. Extra information to pass in the event.
 */
export const dispatchEvent = (element, eventName, detail) =>
  element.dispatchEvent(new CustomEvent(eventName, { detail, bubbles: true }));

/**
 * Returns whether a given parameter is a hidden input element.
 *
 * @param {any} node
 *   The thing to check.
 *
 * @return {boolean}
 *   Returns true if it is an input HTML element with [type="hidden"], false
 *   otherwise.
 */
const isHiddenInput = node =>
  node instanceof HTMLInputElement && node.type === 'hidden';

/**
 * Get a list of focusable elements.
 *
 * @param {ParentNode} node
 *   Node to get focusable children of.
 *
 * @return {Element[]}
 *   Array of focusable elements.
 */
const getFocusables = node =>
  matchChildren(
    'a,button,input,textarea,select,details,[tabindex]:not([tabindex="-1"])',
    node,
  ).filter(
    element => !element.hasAttribute('disabled') && !isHiddenInput(element),
  );

/**
 * Creates a trapping focusin event listener.
 *
 * @param {Node} node
 *   The DOM node to trap focus within.
 *
 * @return {(event: FocusEvent) => void}
 *   Focusin event listener.
 */
export const createFocusTrapper = node => {
  const focusables = getFocusables(node);
  const [first] = focusables;
  const last = focusables[focusables.length - 1];

  // Target is the element receiving focus, relatedTarget is the element losing
  // focus.
  return ({ target, relatedTarget }) => {
    if (!relatedTarget || node.contains(target)) return;
    (relatedTarget === last ? first : last).focus();
  };
};

/**
 * Toggle document body scrolling.
 *
 * @param {boolean} disable
 *   Pass true to disable scrolling or false to enable.
 */
export const toggleScrolling = disable => {
  // Get scrollbar width.
  const barWidth = window.innerWidth - document.documentElement.offsetWidth;

  // Save scrollbar width to DOM object for reuse.
  if (disable) {
    document.body.style.setProperty('--body-scrollbar-width', `${barWidth}px`);
  }

  // Remove scrolling from body.
  document.body.style.overflow = disable ? 'hidden' : '';
  // Compensate for possible layout jump due to scrollbar show/hide.
  document.body.style.paddingRight = disable ? `${barWidth}px` : '';
};
