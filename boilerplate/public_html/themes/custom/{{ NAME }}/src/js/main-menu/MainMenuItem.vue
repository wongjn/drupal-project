<template>
  <li
    v-bind="liProps"
    :class="{ 'is-open': submenuOpen }"
    @touchend="onTouch"
    @active-trail="childActive = $event.detail"
  >
    <a
      :href="url.url"
      :target="url.external && '_blank'"
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
import ROUTED_EVENT from '../router/';
import rafPromise from '../request-animation-frame-promise';

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
      validator: object => (
        'url' in object &&
        'external' in object &&
        'query' in object &&
        'systemPath' in object
      ),
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
  },
  data() {
    return {
      /**
       * Whether a child is in the active path.
       *
       * @var {bool}
       */
      childActive: false,
      /**
       * Path data from Drupal about the current page.
       *
       * @var {object}
       */
      path: drupalSettings.path,
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
   * @prop {bool} isActivePath
   *   Whether this item is active (from path data).
   * @prop {bool} isActiveTrail
   *   Whether this item is part of the active trail.
   */
  computed: {
    classes() {
      return [
        { 'is-active-trail': this.isActiveTrail },
        ...this.linkClasses,
      ];
    },
    isActivePath() {
      if (this.url.systemPath === '<front>') {
        return this.path.isFront;
      }

      if (typeof this.path.currentQuery === 'object') {
        // Remove queries for AJAX/router
        delete this.path.currentQuery._drupal_ajax;
        delete this.path.currentQuery._wrapper_format;
        delete this.path.currentQuery.ajax_page_state;

        if (Object.keys(this.path.currentQuery).length === 0) {
          delete this.path.currentQuery;
        }
      }

      // Matches main path component
      if (this.path.currentPath === this.url.systemPath) {
        // If there is a query, ensure query matches too
        if (this.path.currentQuery || this.url.query) {
          return this.url.query === JSON.stringify(this.path.currentQuery);
        }

        return true;
      }

      const { pathname } = new URL(this.url.url, window.location.origin);
      return window.location.pathname.indexOf(`${pathname}/`) === 0;
    },
    isActiveTrail() {
      return this.childActive || this.isActivePath;
    },
  },
  watch: {
    async isActivePath(newValue, oldValue) {
      if (oldValue !== newValue) {
        // Hold truthy values for a frame to take precedence over falsey values.
        if (newValue) {
          await rafPromise();
        }

        // Use native event system for bubbling.
        this.$el.dispatchEvent(new CustomEvent('active-trail', {
          detail: newValue,
          bubbles: true,
        }));
      }
    },
  },
  mounted() {
    document.addEventListener('touchstart', this.indirectClose);
    document.addEventListener(ROUTED_EVENT, this.onRouted);

    if (this.isActivePath) {
      this.$el.dispatchEvent(new CustomEvent('active-trail', {
        detail: this.isActivePath,
        bubbles: true,
      }));
    }
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
