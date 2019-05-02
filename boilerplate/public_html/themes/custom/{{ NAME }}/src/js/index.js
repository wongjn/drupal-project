/**
 * @file
 * Main JS entry point.
 */

import './main-menu';
import './scrollbar-size';
import { lazyBehavior } from './lib/behaviors';

import(/* webpackChunkName: "async" */ './async');

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
