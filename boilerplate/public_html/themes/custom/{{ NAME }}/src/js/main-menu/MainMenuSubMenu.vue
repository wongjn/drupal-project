<!--
/**
 * @file
 * A main menu submenu.
 */
-->

<script>
import debounce from 'lodash/debounce';
import ResizeObserverLoader from '../resize-observer-load';
import MenuMixin from './menu-mixin';

/**
 * A main menu submenu.
 *
 * @type {Vue.Component}
 * @mixes MenuMixin
 * @vue/component
 */
const MainMenuSubMenu = {
  name: 'MainMenuSubMenu',
  mixins: [
    MenuMixin,
  ],
  data() {
    return {
      /**
       * Whether this menu overflows outside the viewport boundaries.
       *
       * @var {bool}
       */
      overflows: false,
    };
  },
  computed: {
    ulProps() {
      return {
        class: [
          'c-main-menu__sub-menu',
          (this.depth > 1 && 'c-main-menu__sub-menu--deep'),
          (this.overflows && 'is-moved'),
        ],
      };
    },
    linkClasses() {
      return [
        'c-main-menu__link',
        'c-main-menu__link--sub',
      ];
    },
    subMenuComponent() {
      return MainMenuSubMenu;
    },
  },
  /**
   * @inheritDoc
   */
  mounted() {
    ResizeObserverLoader.then((Observer) => {
      this._observer = new Observer(debounce(this.layoutUpdate, 300));
      this._observer.observe(document.body);
    });
  },
  /**
   * @inheritDoc
   */
  destroyed() {
    this._observer.disconnect();
  },
  methods: {
    /**
     * Detects whether this submenu is overflowing viewport bounds.
     *
     * @param {ResizeOberverEntry[]} entries
     *   Entries from the ResizeObserver.observe().
     *
     * @see mounted()
     */
    layoutUpdate([{ contentRect }]) {
      if (this.$el.closest('[aria-hidden="true"]')) {
        return;
      }

      // Remove position class temporarily
      this.$el.classList.remove('is-moved');

      // Add timeout so that deeper menus get queried much later than parents.
      setTimeout(() => {
        const { width } = contentRect;
        const { right } = this.$el.getBoundingClientRect();

        // Restore class if neccesary
        if (this.overflows) {
          this.$el.classList.add('is-moved');
        }

        this.overflows = width < right;
      }, this.depth);
    },
  },
};
export default MainMenuSubMenu;
</script>
