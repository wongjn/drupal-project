/**
 * @file
 * Contains the line break handler.
 */

/**
 * Calculates and hides the line break within the menu items list.
 *
 * @param {HTMLLIElement[]} menuItems
 *   The list of menu items.
 */
function calculateLinebreak(menuItems) {
  // First item's offsetTop as reference point.
  const reference = menuItems[0].offsetTop;
  const remaining = menuItems.slice(1);

  let cutIndex = 0;
  while (remaining.length && remaining.shift().offsetTop === reference) {
    cutIndex += 1;
  }

  menuItems.slice(1).forEach((menuItem, i) => {
    if (i >= cutIndex) {
      menuItem.style.visibility = 'hidden';
      menuItem.setAttribute('aria-hidden', 'true');
    } else {
      menuItem.style.visibility = '';
      menuItem.removeAttribute('aria-hidden');
    }
  });
}

/**
 * Handles line break in the main menu.
 */
export default class LineBreak {
  /**
   * Creates an instance of LineBreak.
   *
   * @param {object} elements
   *   Dictionary of noteworthy elements.
   * @param {HTMLULElement} elements.menu
   *   Main menu item list.
   */
  constructor({ menu }) {
    this.menuItems = Array.from(menu.children);
    calculateLinebreak(this.menuItems);
  }

  onResize() {
    calculateLinebreak(this.menuItems);
  }
}
