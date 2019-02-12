/**
 * @file
 * Main JS entry point.
 */

import SVG4Everybody from 'svg4everybody';
import './router/';
import './in-view';
import './main-menu/';
import { asyncAttach } from './lib/async-behaviors';

/**
 * Polyfills external-use SVG elements.
 *
 * @type {Drupal~behavior}
 */
Drupal.behaviors.{{ CAMEL }}SVGPolyfill = {
  attach() {
    SVG4Everybody();
    delete this.attach;
  },
};

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
