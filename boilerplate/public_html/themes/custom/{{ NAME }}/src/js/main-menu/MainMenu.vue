<template>
  <div class="s-main-menu">
    <MainMenuTopMenu
      :menu-tree="menuTree"
      @showdrawer="showDrawer = $event"
    />
    <MainMenuDrawer
      v-show="showDrawer"
      :menu-tree="menuTree"
      class="s-main-menu__drawer"
    />
  </div>
</template>

<script>
import MainMenuDrawer from './MainMenuDrawer';
import MainMenuTopMenu from './MainMenuTopMenu';
import { ROUTED_EVENT } from '../router/events';

/**
 * The root component for the main menu.
 *
 * @type {Vue.Component}
 */
export default {
  name: 'MainMenu',
  components: {
    MainMenuDrawer,
    MainMenuTopMenu,
  },
  props: {
    /**
     * The menu tree.
     *
     * @var {object[]}
     */
    menuTree: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      /**
       * Whether to show the drawer menu (includes the burger icon).
       *
       * @var {bool}
       */
      showDrawer: false,
      /**
       * The menu tree with active trails.
       *
       * @var {object[]}
       */
      processedMenuTree: [],
    };
  },
  beforeMount() {
    this.processedMenuTree = this.processMenuTree();
  },
  mounted() {
    document.addEventListener(ROUTED_EVENT, this.onRouted);
  },
  beforeDestroy() {
    document.removeEventListener(ROUTED_EVENT, this.onRouted);
  },
  methods: {
    /**
     * Reacts on page navigation routing.
     *
     * Initiates processing of new drupal path.
     *
     * @param {CustomEvent} event
     *   The routing event object.
     */
    onRouted({ details: drupalPath }) {
      this.processMenuTree(drupalPath);
    },
    /**
     * Processes an array of menu item objects.
     *
     * @param {object[]} tree
     *   The list of menu items.
     * @param {object} drupalPath
     *   Data about the current path.
     *
     * @return {object[]}
     *   Processed menu tree.
     */
    processMenuTree(tree = this.menuTree, drupalPath = drupalSettings.path) {
      return tree.map(item => {
        if (item.below.length > 0) {
          item.below = this.processMenuTree(item.below, drupalPath);
        }

        const childrenActive =
          item.below.length > 0
            ? item.below.some(({ isActiveTrail }) => isActiveTrail)
            : false;

        item.isActiveTrail =
          childrenActive || this.isActivePath(item.url, drupalPath);

        return item;
      });
    },
    /**
     * Decides if the given URL matches the current page.
     *
     * @param {object} url
     *   The URL to test as an object.
     * @param {string} url.systemPath
     *   The system URL (as the source of truth in regards to path aliases).
     * @param {string} url.query
     *   Query parameters as JSON object for quicker comparison.
     * @param {string} url.url
     *   The full URL as a normalized string.
     * @param {bool} url.external
     *   Whether this URL object represents an external resource.
     * @param {object} drupalPath
     *   Data about the current path.
     * @return {bool}
     *   Returns true if the given URL matches the current page.
     */
    isActivePath(
      { systemPath, query, url, external },
      { currentQuery, currentPath, isFront } = drupalSettings.path,
    ) {
      if (external) {
        return false;
      }

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

      const { pathname } = new URL(url, window.location.origin);
      return window.location.pathname.indexOf(`${pathname}/`) === 0;
    },
  },
};
</script>
