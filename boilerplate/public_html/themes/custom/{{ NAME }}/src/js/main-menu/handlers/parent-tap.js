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
 * Creates a touch handler for a menu widget.
 *
 * @param {HTMLElement} menu
 *   Top-level menu item to manage touch on.
 *
 * @return {(event: TouchEvent) => void}
 *   The touch handler.
 */
function onTouchHandler(menu) {
  let openParent = null;

  return event => {
    const li = event.target.closest('li');

    // Not a tap in menu, close any open parent and return early.
    if (!menu.contains(event.target) || !li) {
      if (openParent) openParent.classList.remove(OPEN_CLASS);
      openParent = null;
      return;
    }

    // No sub menu to open or has already been open, return early.
    const subMenu = li.querySelector('ul');
    if (!subMenu || li === openParent) {
      return;
    }

    // Close previously opened parent if any.
    if (openParent) openParent.classList.remove(OPEN_CLASS);

    li.classList.add(OPEN_CLASS);
    openParent = li;
    event.preventDefault();
    event.stopPropagation();
  };
}

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

  document.body.addEventListener('touchstart', callback, options);

  return () => {
    document.body.removeEventListener('touchstart', callback, options);
    [...menu.querySelectorAll(`.${OPEN_CLASS}`)].forEach(subMenu =>
      subMenu.classList.remove(OPEN_CLASS),
    );
  };
};
