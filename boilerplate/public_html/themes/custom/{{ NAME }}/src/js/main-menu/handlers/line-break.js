/**
 * @file
 * Contains the line break handler.
 */

const LOCAL_STORAGE_KEY = 'menu-line-break';

/**
 * Reduces elements to give the largest height.
 *
 * @param {number} current
 *   Current largest height.
 * @param {HTMLElement} element
 *   Element to get height of.
 * @return {number}
 *   The current height or the height of the given element if it is larger.
 */
const elementHeightReducer = (current = 0, element) =>
  Math.max(current, element.offsetHeight);

/**
 * Returns a reducer to give the index of where a line break occurs.
 *
 * @param {number} reference
 *   The offsetTop value to test against.
 * @return {function}
 *   A reducer accepting a state of { found: Boolean, index: number } and an
 *   element to test as arguments.
 */
const reduceDifferentOffsetTop = reference => (current, element) => {
  if (current.found) {
    return current;
  }

  return {
    index: reference === element.offsetTop ? current.index + 1 : current.index,
    found: reference !== element.offsetTop,
  };
};

/**
 * Returns a function that calculates and hides the line break within the menu.
 *
 * @param {HTMLUListElement} menu
 *   The main menu list.
 * @return {function}
 *   The calculator function that returns an object of
 *   `{ height: Number, index: Number }`.
 */
const calculateLinebreak = menu => {
  const menuItems = Array.from(menu.children);

  // First item as reference point.
  const reference = menuItems[0];
  const remaining = menuItems.slice(1);

  return () => {
    const { index } = remaining.reduce(
      reduceDifferentOffsetTop(reference.offsetTop),
      { found: false, index: 0 },
    );

    const height = remaining
      .slice(0, index)
      .reduce(elementHeightReducer, reference.offsetHeight);

    const state = { height, index };

    document.cookie = `mh=${height}`;
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));

    return state;
  };
};

/**
 * Returns a function that mutates the menu DOM per height and index cut-off.
 *
 * @param {HTMLUListElement} menu
 *   The menu element.
 * @return {function}
 *   The mutator that accepts a `{ height: Number, index: Number }` object to
 *   mutate the menu items with.
 */
const mutator = menu => {
  const menuItems = Array.from(menu.children).slice(1);

  return ({ height, index }) => {
    // Update menu height for just the first line.
    menu.style.height = `${height}px`;

    // Get items on the first line.
    const shownItems = menuItems.slice(0, index);

    // Ensure first row items are visible.
    shownItems.forEach(menuItem => {
      menuItem.style.visibility = '';
      menuItem.removeAttribute('aria-hidden');
    });
    // Hide others.
    menuItems.slice(index).forEach(menuItem => {
      menuItem.style.visibility = 'hidden';
      menuItem.setAttribute('aria-hidden', 'true');
    });
  };
};

/**
 * Handles line break in the main menu.
 */
export default class LineBreak {
  /**
   * Creates an instance of LineBreak.
   *
   * @param {object} elements
   *   Dictionary of noteworthy elements.
   * @param {HTMLUListElement} elements.menu
   *   Main menu item list.
   */
  constructor({ menu }) {
    const mutate = mutator(menu);

    const data = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      mutate(JSON.parse(data));
    }

    const calculator = calculateLinebreak(menu);
    this.onResize = () => mutate(calculator());
  }
}
