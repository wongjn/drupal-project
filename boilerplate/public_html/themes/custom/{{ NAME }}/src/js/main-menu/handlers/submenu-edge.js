/**
 * @file
 * Contains the submenu edge handler.
 */

import debounce from 'debounce';

/**
 * Moves a menu if it overlaps.
 *
 * @param {HTMLUListElement[]} menus
 *   The menu list.
 */
function moveOverlaps(menus) {
  const { offsetWidth: docWidth } = document.documentElement;

  menus.forEach(menu => {
    if (menu.closest('[aria-hidden="true"]')) {
      return;
    }

    // Remove transitions that may be caused by 'is-moved' class removal so that
    // getBoundingClientRect() measures the inate position, not the
    // transitioning position.
    menu.style.transition = 'none';
    // Remove position class temporarily.
    menu.classList.remove('is-moved');

    const { right } = menu.getBoundingClientRect();

    if (docWidth < right) {
      menu.classList.add('is-moved');
    }

    // Restore transitions.
    menu.style.transition = '';
  });
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
  const menus = [...menu.querySelectorAll('.c-main-menu__sub-menu')];

  moveOverlaps(menus);

  const updater = debounce(moveOverlaps.bind(null, menus), 500);
  window.addEventListener('resize', updater);
  return () => window.removeEventListener('resize', updater);
};
