/**
 * @file
 * Main JS entry point.
 */

import SVG4Everybody from 'svg4everybody';

// TODO: Revert to dynamically setting publicPath once
// https://github.com/webpack/webpack/issues/7744 is resolved.
// import './webpack-path';
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

[
  // Drupal status messages.
  ['messages'],
].forEach(args => asyncAttach(...args));
