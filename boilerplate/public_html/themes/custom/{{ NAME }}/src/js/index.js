/**
 * @file
 * Main JS entry point.
 */

import SVG4Everybody from 'svg4everybody';
import './webpack-path';
import './in-view';
import './main-menu/';
import ROUTED_EVENT from './router/';
// import { asyncAttach } from './AsyncBehavior';

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

/**
 * Loads toast message manager.
 */
function loadMessages() {
  if (drupalSettings.{{ CAMEL }}.messages) {
    import(/* webpackChunkName: "messages" */ './messages');
    document.removeEventListener(ROUTED_EVENT, loadMessages);
  }
}
document.addEventListener(ROUTED_EVENT, loadMessages);
loadMessages();
