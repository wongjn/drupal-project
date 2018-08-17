<script>
import MenuMixin from './menu-mixin';

/**
 * Main menu drawer menu.
 *
 * @type {Vue.Component}
 * @mixes MenuMixin
 * @vue/component
 */
const MainMenuDrawerMenu = {
  name: 'MainMenuDrawerMenu',
  mixins: [
    MenuMixin,
  ],
  computed: {
    ulProps() {
      return {
        class: [
          'c-drawer-menu__menu',
          `c-drawer-menu__menu--${this.depth > 0 ? 'sub' : 'top'}`,
        ],
      };
    },
    linkClasses() {
      return [
        'c-drawer-menu__link',
        `c-drawer-menu__link--${this.depth === 0 ? 'top' : 'sub'}`,
      ];
    },
    subMenuComponent() {
      return MainMenuDrawerMenu;
    },
  },
};
export default MainMenuDrawerMenu;

</script>
