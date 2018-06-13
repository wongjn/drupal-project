/**
 * @file
 * Drupal behavior extension class to load extra JS asynchronously.
 */

/**
 * Manages an async Drupal behavior.
 *
 * The behavior will only be loaded if there are elements on the page that
 * match the given selector.
 *
 * @prop {string} fileName
 *   The module containing the behavior functionality class.
 * @prop {string} selector
 *   CSS Selector to match relevent elements of this behavior.
 * @prop {WeakMap} activeElements
 *   A list of active behaviors keyed by associative element it is attached to.
 * @prop {function} Behavior
 *   The behavior constructor. Loads in on-demand.
 *
 * @extends Drupal~behavior
 */
export default class AsyncBehavior {
  /**
   * Creates an instance of AsyncBehavior.
   *
   * @param {string} fileName
   *   The file to load in the behaviors subdirectory.
   * @param {string} [selector=`.js-${fileName}`]
   *   CSS Selector to match relevent elements of this behaviour.
   */
  constructor(fileName, selector = `.js-${fileName}`) {
    this.fileName = fileName;
    this.selector = selector;
    this.activeElements = new WeakMap();
  }

  /**
   * Initializes the behavior.
   *
   * @param {HTMLDocument|HTMLElement} context
   *   An context to attach behaviors to.
   * @param {object} drupalSettings
   *   An object containing {@link drupalSettings} for the current context.
   *
   * @type {Drupal~behaviorAttach}
   */
  attach(context, drupalSettings) {
    Array.from(context.querySelectorAll(this.selector))
      .forEach(async (element) => {
        const behavior = this.activeElements.get(element);

        // Element has a behavior already, run update function if any then
        // short-circuit.
        if (behavior) {
          if (typeof behavior.attachUpdate === 'function') {
            behavior.attachUpdate();
          }
          return;
        }

        // Load behavior class if not loaded already
        if (!this.Behavior) {
          this.Behavior = (await import(/* webpackChunkName: "behavior-[request]" */`./behaviors/${this.fileName}`)).default;
        }

        this.activeElements.set(element, new this.Behavior(element, drupalSettings));
      }, this);
  }

  /**
   * Detaches behaviors.
   *
   * @param {HTMLElement} context
   *   The element where behaviors are requested to be detached from.
   * @param {object} settings
   *   An object containing {@link drupalSettings} for the current context.
   * @param {string} trigger
   *   A string containing what's causing the behaviors to be detached.
   *
   * @type {Drupal~behaviorAttach}
   */
  detach(context, settings, trigger) {
    if (trigger === 'unload') {
      Array.from(context.querySelectorAll(this.selector))
        .concat((context.matches(this.selector)) ? [context] : [])
        .forEach((element) => {
          const behavior = this.activeElements.get(element);
          if (behavior && typeof behavior.detach === 'function') {
            behavior.detach();
          }
        });
    }
  }
}

/**
 * Factory function to create an AsyncBehavior object.
 *
 * @param {string} fileName
 *   The file to load in the behaviors subdirectory.
 * @param {string} selector
 *   Optional. CSS Selector to match relevent elements of this behaviour. If not
 *   supplied, will default to `.js-${filename}` by AsyncBehavior.constructor().
 */
export const asyncAttach = (fileName, selector) => {
  Drupal.behaviors[`{{ CAMEL }}_${fileName}`] = new AsyncBehavior(fileName, selector);
};

/**
 * Factory function to create multiple AsyncBehavior objects.
 *
 * @param {array[]} attachments
 *   Sets of attachments to create async behaviors from. The elements in each of
 *   the elements correspond to the arguments for asyncAttach().
 */
export const asyncAttachArray = (attachments) => {
  attachments.forEach(args => asyncAttach(...args));
};
