/**
 * @file
 * Main JS entry point.
 */

import './router';
import './in-view';
import './main-menu';
import { lazyBehavior } from './lib/behaviors';

// Polyfills external-use SVG elements.
import(/* webpackChunkName: "entry-async" */ 'svg4everybody').then(
  ({ default: svg4everybody }) => {
    svg4everybody();

    Drupal.behaviors.svg4everybody = {
      attach: svg4everybody,
    };
  },
);

const lazyBehaviors = [
  // Drupal status messages.
  ['messages'],
];

lazyBehaviors.forEach(args => lazyBehavior(...args));

if (module.hot) {
  module.hot.accept('./lib/behaviors', () => {
    lazyBehaviors.forEach(args => lazyBehavior(...args));
    Drupal.attachBehaviors(document.body, drupalSettings);
  });
}
