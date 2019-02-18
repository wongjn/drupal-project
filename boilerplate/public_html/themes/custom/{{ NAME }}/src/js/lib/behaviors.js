/**
 * @file
 * Drupal behavior extension class to load extra JS asynchronously.
 */

import dom from './dom';

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
 * @param {function} func
 *   The function to run on attachment. Will receive a relevant element as first
 *   parameter and drupalSettings as second parameter. Return a another function
 *   as the detachment callback. Mark the function as `sideEffectsOnly` using
 *   `markSideEffectsOnly()` when it does not need to react on DOM detachment
 *   for performance gains.
 *
 * @return {Drupal~behavior}
 *   The Drupal behavior.
 */
export const behavior = (selector, func) => ({
  list: func.sideEffectsOnly ? NullMap : new WeakMap(),
  attach(context, ...args) {
    dom(selector, context)
      .filter(element => !this.list.has(element))
      .forEach(element => this.list.set(element, func(element, ...args)));
  },
  detach: func.sideEffectsOnly
    ? undefined
    : function detach(context, ...args) {
        dom(selector, context)
          .filter(element => this.list.has(element))
          .forEach(element => {
            (this.list.get(element) || noop)(...args);
            this.list.delete(element);
          });
      },
});

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

/**
 * Capitalizes the first letter of a string.
 *
 * @param {string} string
 *   The string to capitalize.
 *
 * @return {string}
 *   The capitalized string.
 */
const capitalize = string =>
  `${string.charAt(0).toUpperCase()}${string.slice(1)}`;

/**
 * Creates a behavior wrapper to lazy-load a behavior.
 *
 * @param {string} fileName
 *   The file to load in the behaviors subdirectory.
 * @param {string} selector
 *   Optional. CSS Selector to match relevant elements of this behavior. If not
 *   supplied, will default to `.js-${fileName}`.
 */
export const lazyBehavior = (fileName, selector = `.js-${fileName}`) => {
  const key = `{{ CAMEL }}${capitalize(fileName)}`;

  Drupal.behaviors[key] = {
    async attach(context, settings) {
      if (!context.querySelector(selector)) {
        return;
      }

      const {
        default: callback,
      } = await import(/* webpackChunkName: "behavior-[request]" */ `../behaviors/${fileName}`);

      Drupal.behaviors[key] = behavior(selector, callback);
      Drupal.behaviors[key].attach(context, settings);
    },
  };

  if (module.hot) {
    module.hot.dispose(() => {
      if (typeof Drupal.behaviors[key].detach === 'function') {
        Drupal.behaviors[key].detach(document.body, drupalSettings, 'unload');
      }
      delete Drupal.behaviors[key];
    });
  }
};
