/**
 * @file
 * Handles active trail management.
 */

/**
 * Builds a virtual tree from the DOM.
 *
 * @param {HTMLLIElement[]} menuItems
 *   The menu list items.
 * @return {Map}
 *   Multi-level tree of menu links, keyed by anchor element with value of link
 *   and path data.
 */
function buildTree(menuItems) {
  return new Map(
    menuItems
      .filter(li => {
        const link = li.querySelector('a');
        return 'drupalLinkSystemPath' in link.dataset;
      })
      .map(li => {
        const link = li.querySelector('a');
        const { drupalLinkSystemPath, drupalLinkQuery } = link.dataset;
        const subMenu = link.nextElementSibling;

        return [
          link,
          {
            alias: link.pathname,
            systemPath: drupalLinkSystemPath,
            query: drupalLinkQuery,
            below: subMenu ? buildTree(Array.from(subMenu.children)) : [],
          },
        ];
      }),
  );
}

/**
 * Determines whether a given link is in the active trail.
 *
 * @param {object} pathData
 *   Path data to check.
 * @param {object} drupalPath
 *   Path information for the current page from drupalSettings.
 * @return {bool}
 *   Returns true if in active trail or false otherwise.
 */
function inActiveTrail(
  { systemPath, alias, query = '' } = {},
  { isFront, currentQuery, currentPath } = drupalSettings.path,
) {
  if (systemPath === '<front>') {
    return isFront;
  }

  if (typeof currentQuery === 'object') {
    // Remove queries for AJAX/router.
    delete currentQuery._drupal_ajax;
    delete currentQuery._wrapper_format;
    delete currentQuery.ajax_page_state;
  }

  // Matches main path component.
  if (currentPath === systemPath) {
    // If there is a query, ensure query matches too.
    if (currentQuery && query.length > 0) {
      return query === JSON.stringify(currentQuery);
    }
    // Otherwise only return true for non-query paths.
    return query.length === 0;
  }

  return window.location.pathname.indexOf(`${alias}/`) === 0;
}

/**
 * Checks active trail for a tree resursively.
 *
 * @param {Map} tree
 *   The menu tree to check.
 * @param {object} drupalPath
 *   Path information for the current page from drupalSettings.
 * @return {bool}
 *   True if an active trail was found or false otherwise.
 */
async function updateActiveTrail(tree, drupalPath = drupalSettings.path) {
  let isActiveTrail = false;

  tree.forEach(async (data, link) => {
    isActiveTrail =
      (await updateActiveTrail(data.below)) || inActiveTrail(data, drupalPath);

    const classOperation = isActiveTrail ? 'add' : 'remove';
    link.classList[classOperation]('is-active-trail');
  }, this);

  return isActiveTrail;
}

/**
 * The active trail handler.
 *
 * @prop {Map} tree
 *   The virtual menu tree.
 */
export default class ActiveTrail {
  /**
   * Creates an instance of ActiveTrail.
   *
   * @param {object} elements
   *   Dictionary of noteworthy elements.
   * @param {HTMLULElement} elements.menu
   *   Main menu item list.
   */
  constructor({ menu }) {
    this.tree = buildTree(Array.from(menu.children));
    updateActiveTrail(this.tree);
  }

  onRouted(drupalPath) {
    updateActiveTrail(this.tree, drupalPath);
  }
}
