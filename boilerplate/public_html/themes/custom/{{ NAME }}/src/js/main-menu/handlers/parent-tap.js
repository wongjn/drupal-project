/**
 * @file
 * Handles parent touch management.
 */

/**
 * CSS class for opened sub-menu.
 *
 * @constant
 */
const OPEN_CLASS = 'is-open';

/**
 * Finds open sub-menu items within a parent element.
 *
 * @param {Element} parent
 *   The parent element.
 *
 * @return {Element[]}
 *   The open sub-menu item elements.
 */
const findAllOpen = parent => [...parent.querySelectorAll(`.${OPEN_CLASS}`)];

/**
 * Closes a sub-menu item.
 *
 * @param {Element} node
 *   The sub-menu item element.
 */
const closeOpen = node => node.classList.remove(OPEN_CLASS);

/**
 * Closes all open sub-menu items within a parent element.
 *
 * @param {Element} parent
 *   The parent element.
 */
const closeAllOpen = parent => findAllOpen(parent).forEach(closeOpen);

/**
 * Creates a touch handler for a menu widget.
 *
 * @param {HTMLElement} nav
 *   Menu element to manage touch on.
 *
 * @return {(event: TouchEvent) => void}
 *   The touch handler.
 */
const onTouchHandler = nav => event => {
  const { pageX, pageY } = event.changedTouches.item(0);

  /** @type {HTMLLIElement || null} */
  const li = document.elementFromPoint(pageX, pageY).closest('li');

  // Not a tap in menu, close any open parent and return early.
  if (!nav.contains(event.target) || !li) {
    closeAllOpen(nav);
    return;
  }

  // Close unrelated open nodes.
  findAllOpen(nav)
    .filter(node => !node.contains(li))
    .forEach(closeOpen);

  // No sub menu to open or is already open, return early.
  if (li.querySelector('ul') && !li.classList.contains(OPEN_CLASS)) {
    li.classList.add(OPEN_CLASS);

    event.preventDefault();
    event.stopPropagation();
  }
};

/**
 * Initializes this handler.
 *
 * @param {Object} elements
 *   Remarkable DOM nodes for the main menu.
 * @param {HTMLUListElement} elements.menu
 *   Top level menu element.
 */
export default ({ menu }) => {
  const callback = onTouchHandler(menu);
  const options = { passive: false };

  document.body.addEventListener('touchend', callback, options);

  return () => {
    document.body.removeEventListener('touchend', callback, options);
    closeAllOpen(menu);
  };
};
