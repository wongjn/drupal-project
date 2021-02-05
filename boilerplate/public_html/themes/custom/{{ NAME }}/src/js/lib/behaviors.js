/**
 * @file
 * Drupal behavior helper functions.
 */
/* eslint-disable import/prefer-default-export */

import drupalSettings from 'drupalSettings';
import { match } from './dom';

// Noop function.
const noop = () => {};

// Noop map interface.
const NullMap = {
  has: noop,
  get: noop,
  set: noop,
  delete: noop,
};

/**
 * Behavior factory with element selection.
 *
 * @param {string} selector
 *   The CSS selector to match relevant elements.
 * @param {(element: Element,...args: any[]) => ((...args: any[]) => void) | void} func
 *   The function to run on attachment. Will receive a relevant element as first
 *   parameter and drupalSettings as second parameter. Return another function
 *   as the detachment callback.
 * @param {boolean} [sideEffectsOnly=false]
 *   Indicates the behavior invokes side effects only, with no detach function.
 *   This parameter is not strictly required if the function does not provide
 *   a detach function but setting this parameter to true in such cases will
 *   improve performance.
 *
 * @return {Drupal~behavior}
 *   The Drupal behavior.
 */
export const createBehavior = (selector, func, sideEffectsOnly = false) => {
  const list = sideEffectsOnly ? NullMap : new WeakMap();

  const behavior = {
    attach(context, ...args) {
      match(selector, context)
        .filter(element => !list.has(element))
        .forEach(element => list.set(element, func(element, ...args)));
    },
    detach: sideEffectsOnly
      ? undefined
      : function detach(context, ...args) {
          match(selector, context)
            .filter(element => list.has(element))
            .forEach(element => {
              (list.get(element) || noop)(...args);
              list.delete(element);
            });
        },
  };

  // Differential serving loads the legacy entry script asynchronously, meaning
  // that it may miss out on the DOMContentLoaded event on the document whereby
  // an initial Drupal.attachBehaviors() is called for the whole page. Hence
  // attach() is actually called for the first time here for behaviors created
  // in the legacy bundles.
  if (BUNDLE_TYPE === 'legacy' && document.readyState !== 'loading') {
    behavior.attach(document.body, drupalSettings);
  }

  return behavior;
};
