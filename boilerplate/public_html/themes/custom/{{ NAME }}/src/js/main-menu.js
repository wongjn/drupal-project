/**
 * @file
 * Enhances the main menu for better responsive experience.
 */

import { h, render } from 'preact';
import MainMenu from './components/MainMenu';
import ROUTED_EVENT from './router-events';

/**
 * The menu container.
 *
 * @var {HTMLElement}
 */
let menu;

/**
 * Checks in a menu item is in the active trail.
 *
 * @param {object} menuItem
 *   The menu item props data for preact components.
 * @param {string|null} menuItem.systemPath
 *   The internal, unaliased path of the link, or null if not related to a
 *   known Drupal route.
 * @param {string|null} menuItem.linkQuery
 *   The query this link has as stringified JSON, or null if no query.
 * @param {object[]} menuItem.children
 *   Children menu items to check if any children are active children.
 * @param {object} [pathSettings=drupalSettings.path]
 *   Path settings from drupalSettings.
 * @return {bool}
 *   Returns true if the given menu item matches the current (internal) path or
 *   a child item does, otherwise false.
 */
function isActiveTrail(
  { systemPath, linkQuery, children = [] },
  pathSettings = drupalSettings.path,
) {
  // Check if any children are marked as active
  if (children.length > 0 && children.some(({ activeTrail }) => activeTrail)) {
    return true;
  }

  if (typeof pathSettings.currentQuery === 'object') {
    // Remove queries for AJAX/router
    delete pathSettings.currentQuery._drupal_ajax;
    delete pathSettings.currentQuery._wrapper_format;
    delete pathSettings.currentQuery.ajax_page_state;

    if (Object.keys(pathSettings.currentQuery).length === 0) {
      delete pathSettings.currentQuery;
    }
  }

  if (systemPath === '<front>') {
    return pathSettings.isFront;
  }

  // Matches main path component
  if (pathSettings.currentPath === systemPath) {
    // If there is a query, ensure query matches too
    if (pathSettings.currentQuery) {
      return linkQuery === JSON.stringify(pathSettings.currentQuery);
    }

    return true;
  }

  return false;
}

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

      const systemPath = link.getAttribute('data-drupal-link-system-path');
      const linkQuery = link.getAttribute('data-drupal-link-query');

      const menuItem = {
        title: link.textContent,
        url: link.href,
        children: subMenu ? parseMenu(subMenu) : [],
        systemPath,
        linkQuery,
        index,
      };
      menuItem.activeTrail = isActiveTrail(menuItem);

      return menuItem;
    });
}

/**
 * Renders the main menu via Preact.
 *
 * @param {object} menuTree
 *   The menu tree to pass to MainMenu preact component.
 */
function renderMenu(menuTree) {
  render(h(MainMenu, { menuTree }), menu.parentElement, menu);
}

/**
 * Updates active trail designation on links.
 *
 * @param {object} menuTree
 *   The menu tree.
 * @param {object} pathSettings
 *   Path settings from drupalSettings.
 * @return {object}
 *   Updated menu tree.
 */
function updateMenuTreeActiveTrail(menuTree, pathSettings) {
  return menuTree
    .map((menuItem) => {
      if (menuItem.children.length > 0) {
        menuItem.children = updateMenuTreeActiveTrail(menuItem.children, pathSettings);
      }

      menuItem.activeTrail = isActiveTrail(menuItem, pathSettings);

      return menuItem;
    });
}

/**
 * Reacts on routing change from the frontend router.
 *
 * @param {object} menuTree
 *   The current menu tree.
 * @param {CustomEvent} event
 *   The event object representing the routing event.
 * @param {object} event.detail
 *   Path settings from drupalSettings.
 */
function onRouteChange(menuTree, { detail: pathSettings }) {
  const updatedMenuTree = updateMenuTreeActiveTrail(menuTree, pathSettings);
  renderMenu(updatedMenuTree);
}

/**
 * Loads the main menu.
 *
 * @type {Drupal~behavior}
 */
Drupal.behaviors.elfMenu = {
  attach() {
    menu = document.querySelector('.js-main-menu');
    const menuTree = parseMenu(menu.children[0]);

    renderMenu(menuTree, menu);
    Drupal.attachBehaviors(menu);
    document.addEventListener(ROUTED_EVENT, onRouteChange.bind(null, menuTree));

    delete this.attach;
  },
};
