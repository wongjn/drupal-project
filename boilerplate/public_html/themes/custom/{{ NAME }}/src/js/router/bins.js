/**
 * @file
 * Dynamic DOM content.
 */

const elements = Array.from(document.getElementsByTagName('router-content'));

// Content router elements.
export const bins = elements.reduce((map, bin) => {
  map[bin.getAttribute('area')] = bin;
  return map;
}, {});

/**
 * Detach behaviors from router content elements.
 *
 * @param {object} settings
 *   drupalSettings object.
 */
export function detachBins(settings = drupalSettings) {
  Object.values(bins).forEach(bin => Drupal.detachBehaviors(bin, settings));
}

/**
 * Attach behaviors from router content elements.
 *
 * @param {object} settings
 *   drupalSettings object.
 */
export function attachBins(settings = drupalSettings) {
  Object.values(bins).forEach(bin => Drupal.attachBehaviors(bin, settings));
}
