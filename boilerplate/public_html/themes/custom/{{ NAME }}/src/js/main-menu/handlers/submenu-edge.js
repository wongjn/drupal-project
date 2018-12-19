/**
 * @file
 * Contains the submenu edge handler.
 */

import debounce from 'lodash/debounce';

/**
 * Moves a menu if it overlaps.
 *
 * @param {HTMLULElement[]} menus
 *   The menu list.
 */
function moveOverlaps(menus) {
  const { innerWidth: windowWidth } = window;

  menus.forEach(menu => {
    if (menu.closest('[aria-hidden="true"]')) {
      return;
    }

    // Remove position class temporarily.
    menu.classList.remove('is-moved');

    const { right } = menu.getBoundingClientRect();

    // Add class if necessary.
    if (windowWidth < right) {
      menu.classList.add('is-moved');
    }
  });
}

/**
 * Submenu edge overlapping handler.
 */
export default class SubmenuEdge {
  /**
   * Creates an instance of SubmenuEdge.
   *
   * @param {object} elements
   *   Dictionary of noteworthy elements.
   * @param {HTMLULElement} elements.menu
   *   Main menu item list.
   */
  constructor({ menu }) {
    const menus = Array.from(menu.querySelectorAll('.s-main-menu__sub-menu'));
    moveOverlaps(menus);

    this._updater = debounce(moveOverlaps.bind(null, menus), 500);
    this._listeners('add');
  }

  onDestroy() {
    this._listeners('remove');
  }

  /**
   * Manages event listeners.
   *
   * @param {'add'|'remove'} operation
   *   The operation to perform for the listeners.
   */
  _listeners(operation) {
    const method = `${operation}EventListener`;
    window[method]('resize', this._updater);
  }
}
