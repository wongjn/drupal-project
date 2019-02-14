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
 * @return {HTMLElement[]}
 *   The matching elements.
 */
export default (selector, context) => [
  ...matchChildren(selector, context),
  ...matchSelf(selector, context),
];
