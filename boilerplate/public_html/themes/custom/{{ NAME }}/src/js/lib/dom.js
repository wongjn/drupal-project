/**
 * @file
 * General DOM utilities.
 */

/**
 * Gets matching elements in the DOM for a behavior.
 *
 * @param {HTMLDocument|HTMLElement} context
 *   The DOM element to get matching elements from.
 * @param {string} selector
 *   The CSS selector to match.
 * @return {HTMLElement[]}
 *   The matching elements.
 */
export default function get(context, selector) {
  return Array.from(context.querySelectorAll(selector)).concat(
    'matches' in context && context.matches(selector) ? [context] : [],
  );
}
