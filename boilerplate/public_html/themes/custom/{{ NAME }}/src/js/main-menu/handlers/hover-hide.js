/**
 * @file
 * Hides sub-menu hovers on esc key press for WCAG 2.1.
 */

/**
 * Handles escape key press to close any open dropdown menus.
 *
 * @param {HTMLElement} element
 *   Root menu wrapper element.
 * @param {(event: MouseEvent|FocusEvent) => void} reset
 *   Resetting function called on mousemove or focusin event.
 *
 * @return {(event: KeyboardEvent) => void}
 *   The keydown event handler.
 */
const keyDown = (element, reset) => event => {
  if (
    (event.key === 'Escape' || event.key === 'Esc') &&
    !element.classList.contains('is-closed')
  ) {
    element.classList.add('is-closed');
    element.addEventListener('mousemove', reset);
    element.addEventListener('focusin', reset);
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
  /**
   * Resets closed menus.
   */
  const reset = () => {
    menu.classList.remove('is-closed');
    menu.removeEventListener('mousemove', reset);
    menu.removeEventListener('focusin', reset);
  };

  const onKeyDown = keyDown(menu, reset);
  document.addEventListener('keydown', onKeyDown);

  return () => {
    document.removeEventListener('keydown', onKeyDown);
    reset();
  };
};
