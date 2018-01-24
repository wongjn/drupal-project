/**
 * @file
 * Main JS entry point.
 */

import './webpack-path';
import './in-view';

((Drupal) => {
  /**
   * Loads the main menu.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.{{ CAMEL }}MainMenu = {
    async attach() {
      import(/* webpackChunkName: "lazyChunk" */ './main-menu');
      delete this.attach;
    },
  };

  /**
   * Polyfills external-use SVG elements.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.{{ CAMEL }}SVGPolyfill = {
    async attach() {
      (await import(/* webpackChunkName: "lazyChunk" */ 'svg4everybody'))();
      delete this.attach;
    },
  };
})(Drupal);