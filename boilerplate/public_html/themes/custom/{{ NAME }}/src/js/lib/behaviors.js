/**
 * @file
 * Drupal behavior extension class to load extra JS asynchronously.
 */

import { curry } from 'rambda';
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
    match(selector, context)
      .filter(element => !this.list.has(element))
      .forEach(element => this.list.set(element, func(element, ...args)));
  },
  detach: func.sideEffectsOnly
    ? undefined
    : function detach(context, ...args) {
        match(selector, context)
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
 * @param {boolean} [override=false]
 *   Set to true to override existing behavior.
 *
 * @return {Drupal~behavior}
 *   The created behavior.
 */
export const lazyBehavior = (
  fileName,
  selector = `.js-${fileName}`,
  override = false,
) => {
  const key = `{{ CAMEL }}${capitalize(fileName)}`;

  if (!(key in Drupal.behaviors) || override) {
    Drupal.behaviors[key] = {
      async attach(context, settings) {
        if (match(selector, context).length === 0) {
          return;
        }

        const { default: callback } = await import(
          /* webpackChunkName: "behavior-[request]" */ `../behaviors/${fileName}`
        );

        Drupal.behaviors[key] = behavior(selector, callback);
        Drupal.behaviors[key].attach(context, settings);
      },
    };
  }

  if (module.hot) {
    module.hot.dispose(() => {
      if (typeof Drupal.behaviors[key].detach === 'function') {
        Drupal.behaviors[key].detach(document.body, drupalSettings, 'unload');
      }
      delete Drupal.behaviors[key];
    });
  }

  return Drupal.behaviors[key];
};

/**
 * Runs attach on a behavior.
 */
const attach = curry((context, behavior0) => behavior0.attach(context));

/**
 * Register behaviors as lazy.
 *
 * @param {Object<string,string|null>} definitions
 *   Map of behaviors, key is the JS file to load in behaviors/ and value is
 *   the CSS selector or `null` for default value derived from the filename.
 * @param {boolean} [override=false]
 *   Set to true to override existing behaviors.
 *
 * @return {void}
 */
const registerModules = (definitions, override = false) =>
  Object.entries(definitions).map(([behavior0, selector]) =>
    // YAML cannot declare undefined value; use null instead.
    lazyBehavior(behavior0, selector === null ? undefined : selector, override),
  );

/**
 * Initializes async/lazy behavior registration.
 */
export const behaviorsRegistrationInit = () => {
  /**
   * Behavior to register lazy behavior modules.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.{{ CAMEL }}Modules = {
    attach(context, settings) {
      registerModules(settings?.{{ CAMEL }}?.modules || {}).forEach(attach(context));
    },
  };

  // Differential serving loads the legacy entry script asynchronously, meaning
  // that it may miss out on the DOMContentLoaded event on the document whereby
  // an initial Drupal.attachBehaviors() is called for the whole page. Hence
  // attach() is actually called for the first time here for the legacy bundle.
  if (BUNDLE_TYPE === 'legacy' && document.readyState !== 'loading') {
    Drupal.behaviors.{{ CAMEL }}Modules.attach(document);
  }

  if (module.hot) {
    module.hot.accept(() => {
      registerModules(drupalSettings.{{ CAMEL }}.modules, true);
      Drupal.attachBehaviors(document.body, drupalSettings);
    });
  }
};
