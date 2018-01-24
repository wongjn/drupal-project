/**
 * @file
 * Enhances the main menu for better responsive experience.
 */

import { h, render } from 'preact';
import MainMenu from './components/MainMenu';

/**
 * Parses HTML structure into a menu tree structure.
 *
 * @param {HTMLUListElement} listElement
 *   The root menu list element.
 *
 * @return {Object[]}
 *   The structure of the menu.
 */
function parseMenu(listElement) {
  return Array.from(listElement.children)
    .map((listItem, index) => {
      const link = listItem.querySelector('a');
      const subMenu = listItem.querySelector('ul');

      return {
        title: link.textContent,
        url: link.href,
        children: subMenu ? parseMenu(subMenu) : [],
        activeTrail: link.classList.contains('is-active-trail'),
        index,
      };
    });
}

const root = document.querySelector('.js-main-menu');
const menuMarkup = root.querySelector('.c-main-menu');

// Parse noscript content to HTML to parse structure
const parser = new DOMParser();
const menuDOM = parser
  .parseFromString(menuMarkup.textContent, 'text/html')
  .body
  .children[0];

new Promise(resolve => resolve(parseMenu(menuDOM)))
  .then((menuTree) => {
    render(h(MainMenu, { menuTree }), root, menuMarkup);
  });
