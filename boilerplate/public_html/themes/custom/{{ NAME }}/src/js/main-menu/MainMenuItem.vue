<template>
  <li
    v-bind="liProps"
    :class="{ 'is-open': submenuOpen }"
    @touchend="onTouch"
  >
    <a
      :href="url.url"
      :target="url.external && '_blank'"
      :rel="url.external ? 'noopener nofollow' : false"
      :class="classes"
      v-text="title"
    />
    <Component
      v-if="below.length > 0"
      :is="subMenuComponent"
      :menu-tree="below"
      :depth="depth + 1"
    />
  </li>
</template>

<script>
import { ROUTED_EVENT } from '../router/events';

/**
 * A menu item.
 *
 * @type {Vue.Component}
 */
export default {
  name: 'MainMenuItem',
  props: {
    /**
     * The Vue component definition for the sub menu (if any).
     *
     * @var {Vue.Component}
     */
    subMenuComponent: {
      type: Object,
      default: () => ({}),
    },
    /**
     * Props to bind to the <li> element.
     *
     * @var {object}
     */
    liProps: {
      type: Object,
      default: () => ({}),
    },
    /**
     * URL definition.
     *
     * @var {object}
     */
    url: {
      type: Object,
      required: true,
      validator: object => 'url' in object && 'external' in object,
    },
    /**
     * Tree of submenu items (if any).
     *
     * @var {object[]}
     */
    below: {
      type: Array,
      required: true,
    },
    /**
     * Menu depth.
     *
     * @var {number}
     */
    depth: {
      type: Number,
      required: true,
    },
    /**
     * Menu item unique identifier.
     *
     * @var {string}
     */
    id: {
      type: String,
      default: '',
    },
    /**
     * Menu item link text.
     *
     * @var {string}
     */
    title: {
      type: String,
      default: '',
    },
    /**
     * Classes to attach to the link element.
     *
     * Must be an array due to destructuring in computed.classes().
     *
     * @var {string[]}
     */
    linkClasses: {
      type: Array,
      default: () => [],
    },
    /**
     * Whether the current item is in the active trail.
     *
     * @var {bool}
     */
    isActiveTrail: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      /**
       * Whether the sub menu is open.
       *
       * @var {bool}
       */
      submenuOpen: false,
    };
  },
  /**
   * @prop {string[]} classes
   *   Classes for the link element.
   */
  computed: {
    classes() {
      return [{ 'is-active-trail': this.isActiveTrail }, ...this.linkClasses];
    },
  },
  mounted() {
    document.addEventListener('touchstart', this.indirectClose);
    document.addEventListener(ROUTED_EVENT, this.onRouted);
  },
  destroyed() {
    document.removeEventListener('touchstart', this.indirectClose);
    document.removeEventListener(ROUTED_EVENT, this.onRouted);
  },
  methods: {
    /**
     * Acts on routed event.
     *
     * @see this.mounted()
     */
    onRouted({ detail }) {
      this.path = detail;
      this.submenuOpen = false;
    },
    /**
     * Acts on menu item touch event.
     *
     * @param {TouchEvent} event
     *   The event object.
     */
    onTouch(event) {
      // Opens a submenu on touch if one exists.
      if (this.below.length > 0 && !this.submenuOpen) {
        event.preventDefault();
        this.submenuOpen = true;
      }
    },
    /**
     * Closes the submenu if a touch event happens outside of children.
     *
     * @param {TouchEvent} event
     *   The object representing the touch event.
     */
    indirectClose({ target }) {
      if (this.submenuOpen && !this.$el.contains(target)) {
        this.submenuOpen = false;
      }
    },
  },
};
</script>
