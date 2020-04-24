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
 * Parses HTMl string to DOM elements.
 *
 * Any elements with the 'ref' attribute will be returned in the second
 * element in the return array keyed by the attribute value.
 *
 * @example
 * const [root, { title, content }] = templateParse(`
 *  <div class="root">
 *    <h1 ref="title">Title</h1>
 *    <p ref="content">…</p>
 *  </div>
 * `);
 *
 * @param {string} html
 *   HTML fragment to convert to DOM objects. Only the first parent in the
 *   string will be returned.
 *
 * @return {[HTMLElement, Object<string, HTMLElement>]}
 *   First element is the full DOM. Second element is an object mapping of
 *   reference elements.
 */
export function templateParse(html) {
  const dom = new DOMParser().parseFromString(html, 'text/html');
  const [main] = Array.from(dom.body.children);

  const refElements = Array.from(main.querySelectorAll('[ref]'));
  const refs = refElements.reduce((map, element) => {
    map[element.getAttribute('ref')] = element;
    element.removeAttribute('ref');
    return map;
  }, {});

  return [main, refs];
}
