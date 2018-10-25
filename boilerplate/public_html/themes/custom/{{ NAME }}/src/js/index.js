/**
 * @file
 * Main JS entry point.
 */

import SVG4Everybody from 'svg4everybody';
import './in-view';
import './main-menu/';
import { asyncAttach } from './AsyncBehavior';

import(/* webpackPrefetch: true, webpackChunkName: 'entry-async' */ './router/');

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
  module.hot.accept('./AsyncBehavior', () => {
    asyncBehaviors.forEach(args => asyncAttach(...args));
    Drupal.attachBehaviors(document.body, drupalSettings);
  });
}
