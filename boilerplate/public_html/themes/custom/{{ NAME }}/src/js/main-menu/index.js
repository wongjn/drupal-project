/**
 * @file
 * Enhances the main menu for better responsive experience.
 */

import Vue from 'vue';
import MainMenu from './MainMenu';

/**
 * List of classes not needed in menu rendering props.
 */
const FILTERED_CLASSES = ['js-main-menu', 's-main-menu'];

const el = context.querySelector('.js-main-menu');
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
