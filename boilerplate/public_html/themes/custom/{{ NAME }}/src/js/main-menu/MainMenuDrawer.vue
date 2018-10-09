<template>
  <div class="c-drawer-menu">
    <!-- Open button, shown even if the drawer itself is hidden. -->
    <button
      ref="openButton"
      :aria-hidden="String(open)"
      :tabIndex="open ? -1 : 0"
      class="c-drawer-menu__open-btn"
      aria-controls="drawer-menu"
      @click.prevent="doOpen"
      v-text="l18n.open"
    />

    <!-- Close button, styled as an overlay. -->
    <button
      :aria-hidden="String(!open)"
      :tabIndex="open ? 0 : -1"
      class="c-drawer-menu__close-btn"
      aria-controls="drawer-menu"
      @click.prevent="doClose"
      v-text="l18n.close"
    />

    <!-- Margin right to remove jump from scrollbar toggling. -->
    <div
      id="drawer-menu"
      :class="['c-drawer-menu__drawer', { 'is-open': open }]"
      :style="!open && { marginRight: `${scrollbarWidth * -1}px` }"
      role="presentation"
      @click="navigateClose"
    >
      <h2
        ref="title"
        class="c-drawer-menu__title"
        tabIndex="-1"
        v-text="l18n.title"
      />
      <MainMenuDrawerMenu :menu-tree="menuTree" />
    </div>
  </div>
</template>

<script>
import MainMenuDrawerMenu from './MainMenuDrawerMenu';
import rafPromise from '../request-animation-frame-promise';

/**
 * The container component for the main menu drawer.
 *
 * @type {Vue.Component}
 */
export default {
  name: 'MainMenuDrawer',
  components: {
    MainMenuDrawerMenu,
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
       * Whether the main drawer is open.
       *
       * @var {bool}
       */
      open: false,

      /**
       * The width of the <body> scrollbar.
       *
       * @var {number}
       */
      scrollbarWidth: 0,
    };
  },
  /**
   * @prop {object} l18n
   *   Translatable strings dictionary used in the component.
   */
  computed: {
    l18n() {
      return {
        open: Drupal.t('Open full menu'),
        close: Drupal.t('Close full menu'),
        title: Drupal.t('Main menu'),
      };
    },
  },
  watch: {
    /**
     * Manages scrollbar visibility and scroll-ability on the <body> element.
     *
     * @param {bool} isOpen
     *   New `open` data property.
     */
    open(isOpen) {
      const beforeWidth = document.body.offsetWidth;

      // Remove scrolling from body
      document.body.style.overflow = isOpen ? 'hidden' : '';

      // Update scrollbar width
      this.scrollbarWidth = Math.abs(document.body.offsetWidth - beforeWidth);

      if (this.scrollbarWidth !== 0) {
        // Compensate for possible scrollbar layout jump
        document.body.style.paddingRight = isOpen
          ? `${this.scrollbarWidth}px`
          : '';
      }
    },
  },
  mounted() {
    // Add Esc to close the drawer
    document.addEventListener('keydown', this.escClose);
  },
  destroyed() {
    // Remove Esc event listener
    document.removeEventListener('keydown', this.escClose);
  },
  methods: {
    /**
     * Opens the drawer.
     */
    async doOpen() {
      this.open = true;
      await rafPromise();
      this.$refs.title.focus();
    },
    /**
     * Closes the drawer.
     */
    async doClose() {
      this.open = false;
      await rafPromise();
      this.$refs.openButton.focus();
    },
    /**
     * Closes the drawer on link click.
     */
    navigateClose({ target }) {
      if (target.tagName === 'A') {
        this.doClose();
      }
    },
    /**
     * Closes the drawer on keyboard 'esc' key.
     */
    escClose({ key }) {
      if (key === 'Escape' && this.open) {
        this.doClose();
      }
    },
  },
};
</script>
