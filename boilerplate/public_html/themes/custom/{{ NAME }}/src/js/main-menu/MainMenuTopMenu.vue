<script>
import ResizeObserverLoader from '../resize-observer-load';
import MainMenuSubMenu from './MainMenuSubMenu';
import MenuMixin from './menu-mixin';

/**
 * Top-level main menu.
 *
 * @type {Vue.Component}
 * @mixes MenuMixin
 */
export default {
  name: 'MainMenuTopMenu',
  mixins: [MenuMixin],
  data() {
    return {
      /**
       * Zero-based index at which items are on a second line.
       *
       * This index counts from the first item. For example if only the first
       * item was on the first line, then the value would be 0. If 3 items where
       * on the first line, the value would be 2.
       *
       * @var {number}
       */
      hideCutIndex: -1,
    };
  },
  computed: {
    ulProps() {
      const style = {};

      // Hide everything if only one item can be shown.
      if (this.hideCutIndex === 0) {
        style.visibility = 'hidden';
        style.overflow = 'hidden';
      }

      return {
        class: 's-main-menu__top-menu',
        style,
      };
    },
    linkClasses() {
      return ['s-main-menu__link', 's-main-menu__link--top'];
    },
    subMenuComponent() {
      return MainMenuSubMenu;
    },
    itemsRef() {
      return 'items';
    },
  },
  watch: {
    hideCutIndex(newIndex, oldIndex) {
      // If switching state between showing all and showing some menu items,
      // emit an event to let the parent know if a drawer should be shown.
      if (newIndex === -1 || oldIndex === -1) {
        this.$emit('showdrawer', newIndex > -1 && oldIndex === -1);
      }
    },
  },
  mounted() {
    ResizeObserverLoader.then(Observer => {
      this._observer = new Observer(this.layoutUpdate);
      this._observer.observe(this.$el);
    });
  },
  beforeDestroy() {
    this._observer.disconnect();
  },
  methods: {
    /**
     * Updates hideCutIndex property.
     */
    layoutUpdate() {
      if (this.$refs.items.length < 2) {
        return;
      }

      const { offsetTop } = this.$refs.items[0].$el;

      this.hideCutIndex = this.$refs.items
        .slice(1)
        .reduce((foundIndex, { $el }, index) => {
          // Already found line break index, skip
          if (foundIndex > -1) {
            return foundIndex;
          }

          return $el.offsetTop === offsetTop ? foundIndex : index;
        }, -1);
    },
    liProps(item, index) {
      if (this.hideCutIndex !== -1 && this.hideCutIndex < index) {
        return {
          style: { visibility: 'hidden' },
          'aria-hidden': 'true',
        };
      }

      return {};
    },
  },
};
</script>
