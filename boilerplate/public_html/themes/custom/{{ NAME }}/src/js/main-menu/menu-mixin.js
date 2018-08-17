import MainMenuItem from './MainMenuItem';

/**
 * Mixin for Vue main menu menu components (including drawer menus).
 *
 * @type {Vue.ComponentOptions}
 * @vue/component
 */
export default {
  components: {
    MainMenuItem,
  },
  props: {
    /**
     * The depth of the menu.
     *
     * @var {number}
     */
    depth: {
      type: Number,
      default: 0,
    },
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
  /**
   * @prop {string|null} [itemsRef=null]
   *   The string to add menu item references to. Use `null` to not reference.
   * @prop {string[]} [linkClasses=[]]
   *   Array of classnames to add to each link element.
   * @prop {Vue.Component} [subMenuComponent={}]
   *   The Vue component to use for any submenus.
   * @prop {object} [ulProps={}]
   *   Any binding props to add the list element.
   */
  computed: {
    itemsRef: () => null,
    linkClasses: () => [],
    subMenuComponent: () => ({}),
    ulProps: () => ({}),
  },
  methods: {
    /**
     * Return data to bind to each list item.
     *
     * @param {object} item
     *   The menu item object definition.
     * @param {number} index
     *   The zero-based index of the item in the menu order.
     *
     * @return {object}
     *   The data to bind.
     */
    liProps: () => ({}),
  },
  template: `
    <ul v-bind="ulProps">
      <main-menu-item
        v-for="(item, index) in menuTree" :key="item.id"
        v-bind="item"
        :linkClasses="linkClasses"
        :subMenuComponent="subMenuComponent"
        :ref="itemsRef"
        :liProps="liProps(item, index)"
      />
    </ul>
  `,
};
