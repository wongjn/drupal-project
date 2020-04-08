/**
 * @file
 * Drupal behavior helper functions.
 */

import { match } from './dom';

// Noop function.
const noop = () => { };

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
 *   as the detachment callback. Mark the function as `sideEffectsOnly` using
 *   `markSideEffectsOnly()` when it does not need to react on DOM detachment
 *   for performance gains.
 *
 * @return {Drupal~behavior}
 *   The Drupal behavior.
 */
export const createBehavior = (selector, func) => {
  const list = func.sideEffectsOnly ? NullMap : new WeakMap();

  const behavior = {
    attach(context, ...args) {
      match(selector, context)
        .filter(element => !list.has(element))
        .forEach(element => list.set(element, func(element, ...args)));
    },
    detach: func.sideEffectsOnly
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

/**
 * Marks a function as sideEffectsOnly.
 *
 * @param {function} func
 *   The function to mark.
 *
 * @return {function}
 *   The marked function.
 */
export const markSideEffectsOnly = (func = noop) => {
  // Clone function to avoid mutation.
  const marked = func.bind(null);
  marked.sideEffectsOnly = true;
  return marked;
};
