/**
 * @file
 * Enhances the main menu for better responsive experience.
 */

import Vue from 'vue';
import MainMenu from './MainMenu';

/**
 * List of classes not needed in menu rendering props.
 */
const FILTERED_CLASSES = ['js-main-menu', 'c-main-menu'];

/**
 * Loads the menus.
 *
 * @type {Drupal~behavior}
 */
Drupal.behaviors.{{ CAMEL }}Menu = {
  attach(context) {
    Array.from(context.querySelectorAll('.js-main-menu')).forEach(el => {
      const props = {
        menuTree: JSON.parse(el.dataset.menu),
      };
      const classes = el.className
        .split(' ')
        .filter(name => !FILTERED_CLASSES.includes(name));

      /* eslint-disable no-new */
      new Vue({
        el,
        components: {
          MainMenu,
        },
        template: '<MainMenu :menu-tree="menuTree" />',
        render: h => h(MainMenu, { props, class: classes }),
      });
    });
  },
};
