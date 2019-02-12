/**
 * @file
 * Main JS entry point.
 */

import './router/';
import './in-view';
import './main-menu/';
import { asyncAttach } from './lib/async-behaviors';

import(/* webpackChunkName: "entry-async" */ 'svg4everybody')
  .then(({ default: svg4everybody }) => {
    svg4everybody();

    Drupal.behaviors.svg4everybody = {
      attach: svg4everybody,
    };
  });

const asyncBehaviors = [
  // Drupal status messages.
  ['messages'],
];

asyncBehaviors.forEach(args => asyncAttach(...args));

if (module.hot) {
  module.hot.accept('./lib/async-behaviors', () => {
    asyncBehaviors.forEach(args => asyncAttach(...args));
    Drupal.attachBehaviors(document.body, drupalSettings);
  });
}
