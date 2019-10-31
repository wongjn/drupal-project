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

// Differential serving loads the legacy entry script asynchronously, meaning
// that it may miss out on the DOMContentLoaded event on the document whereby
// the an initial Drupal.attachBehaviors() is called for the whole page. Hence
// Drupal.attachBehaviors() is called again for the legacy bundle.
if (BUNDLE_TYPE === 'legacy' && document.readyState !== 'loading') {
  Drupal.attachBehaviors(document);
}

if (module.hot) {
  module.hot.accept('./lib/behaviors', () => {
    lazyBehaviors.forEach(args => lazyBehavior(...args));
    Drupal.attachBehaviors(document.body, drupalSettings);
  });
}
