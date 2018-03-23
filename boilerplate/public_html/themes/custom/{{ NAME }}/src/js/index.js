/**
 * @file
 * Main JS entry point.
 */

import SVG4Everybody from 'svg4everybody';
import './webpack-path';
import './in-view';
import './main-menu';
import './router';
// import AsyncBehavior from './AsyncBehavior';

/**
 * Polyfills external-use SVG elements.
 *
 * @type {Drupal~behavior}
 */
Drupal.behaviors.freewheelersSVGPolyfill = {
  attach() {
    SVG4Everybody();
    delete this.attach;
  },
};

/**
 * Async behavior loading example.
 *
 * @type {AsyncBehavior}
 */
// Drupal.behaviors.example = new AsyncBehavior('fileName', '.selector');
