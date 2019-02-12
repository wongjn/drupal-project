/**
 * @file
 * Contains a string HTML parser.
 */

const domParser = new DOMParser();

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
 * @return {Array}
 *   First element is the full DOM. Second element is an object mapping of
 *   reference elements.
 */
export default function templateParse(html) {
  const dom = domParser.parseFromString(html, 'text/html');
  const [main] = dom.body.children;

  const refElements = Array.from(main.querySelectorAll('[ref]'));
  const refs = refElements.reduce((map, element) => {
    map[element.getAttribute('ref')] = element;
    element.removeAttribute('ref');
    return map;
  }, {});

  return [main, refs];
}
