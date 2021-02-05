/**
 * @file
 * SVG external-use polyfill.
 */

import Drupal from 'Drupal';
import svg4everybody from 'svg4everybody';

Drupal.behaviors.{{ CAMEL }}Svg4everybody = { attach: () => svg4everybody() };
Drupal.behaviors.{{ CAMEL }}Svg4everybody.attach();
