/**
 * @file
 * Contains the line break handler.
 */

import Cookies from 'js-cookie';
import { dispatchEvent } from '../../lib/dom';

/**
 * Line break reduction result object.
 *
 * @typedef {Object} LineBreakResult
 *
 * @prop {boolean} found
 *   Whether line break has been found.
 * @prop {number} index
 *   The index of the last element on the first line before the line break.
 */

/**
 * Returns a reducer to give the index of where a line break occurs.
 *
 * @param {number} reference
 *   The offsetTop value to test against.
 * @return {(current: LineBreakResult, element: HTMLElement) => LineBreakResult}
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
 * Calculates the line break point within the menu.
 *
 * @param {HTMLUListElement} menu
 *   The main menu list.
 *
 * @return {number}
 *   The cut-off index.
 */
const calculateLinebreak = menu => {
  const menuItems = Array.from(menu.children);

  // First item as reference point.
  const reference = menuItems[0];

  const { index, found } = menuItems
    .slice(1)
    .reduce(reduceDifferentOffsetTop(reference.offsetTop), {
      found: false,
      index: 0,
    });

  // Tight on space if showing only one element; add compact state class for
  // CSS to possibly do something.
  menu.classList[index < 1 && found ? 'add' : 'remove']('is-compact');

  Cookies.set('{{ NAME }}_menu_break', index + 1, { expires: 30, path: '/' });

  return index;
};

/**
 * Initializes this handler.
 *
 * @param {Object} elements
 *   Remarkable DOM nodes for the main menu.
 * @param {HTMLElement} elements.wrapper
 *   The root element.
 * @param {HTMLUListElement} elements.menu
 *   Top level menu element.
 */
export default ({ wrapper, menu }) => {
  const menuItems = [...menu.children].slice(1);

  // Menu element resize observations.
  const observer = new ResizeObserver(() => {
    const index = calculateLinebreak(menu);

    // Ensure first row items are visible.
    menuItems.slice(0, index).forEach(menuItem => {
      menuItem.style.visibility = '';
      menuItem.removeAttribute('aria-hidden');
    });
    // Hide others.
    menuItems.slice(index).forEach(menuItem => {
      menuItem.style.visibility = 'hidden';
      menuItem.setAttribute('aria-hidden', 'true');
    });

    dispatchEvent(wrapper, 'linebreak', index < menuItems.length);
  });
  observer.observe(menu);

  return () => observer.disconnect();
};
