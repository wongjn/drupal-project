<template>
  <div class="c-main-menu">
    <MainMenuTopMenu
      :menu-tree="menuTree"
      @showdrawer="showDrawer = $event"
    />
    <MainMenuDrawer
      v-show="showDrawer"
      :menu-tree="menuTree"
      class="c-main-menu__drawer"
    />
  </div>
</template>

<script>
import MainMenuDrawer from './MainMenuDrawer';
import MainMenuTopMenu from './MainMenuTopMenu';

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
    };
  },
};
</script>

