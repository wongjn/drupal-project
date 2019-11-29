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

/**
 * Register behaviors as lazy.
 *
 * @param {Object<string,string|null>} definitions
 *   Map of behaviors, key is the JS file to load in behaviors/ and value is
 *   the CSS selector or `null` for default value derived from the filename.
 *
 * @return {void}
 */
const registerModules = definitions =>
  Object.entries(definitions).forEach(([behavior, selector]) =>
    // YAML cannot declare undefined value; use null instead.
    lazyBehavior(behavior, selector === null ? undefined : selector),
  );

registerModules(drupalSettings.{{ CAMEL }}.modules);

// Differential serving loads the legacy entry script asynchronously, meaning
// that it may miss out on the DOMContentLoaded event on the document whereby
// the an initial Drupal.attachBehaviors() is called for the whole page. Hence
// Drupal.attachBehaviors() is called again for the legacy bundle.
if (BUNDLE_TYPE === 'legacy' && document.readyState !== 'loading') {
  Drupal.attachBehaviors(document);
}

if (module.hot) {
  module.hot.accept('./lib/behaviors', () => {
    registerModules(drupalSettings.{{ CAMEL }}.modules);
    Drupal.attachBehaviors(document.body, drupalSettings);
  });
}
