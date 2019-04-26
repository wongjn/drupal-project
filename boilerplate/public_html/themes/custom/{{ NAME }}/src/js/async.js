/**
 * @file
 * Async entry chunk.
 */

import './in-view';
import svg4everybody from 'svg4everybody';

Drupal.behaviors.{{ CAMEL }}Svg4everybody = {
  attach: svg4everybody,
};
svg4everybody();

Drupal.behaviors.{{ CAMEL }}InViewList.attach(document.body, drupalSettings);
