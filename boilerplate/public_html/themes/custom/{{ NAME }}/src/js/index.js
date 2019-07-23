/**
 * @file
 * Main JS entry point.
 */

import './main-menu';
import './scrollbar-size';
import { lazyBehavior } from './lib/behaviors';

import(/* webpackChunkName: "async" */ './in-view');

if (BUNDLE_TYPE === 'legacy') {
  // All browsers that support ES modules natively also support external-use
  // SVGs, so only polyfill for the legacy bundle.
  import(/* webpackChunkName: "async" */ './lib/svg-polyfill');
}

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
