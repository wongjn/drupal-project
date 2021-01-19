/**
 * @file
 * Provides element animation when it is within the viewport.
 */

import { match, matchChildren } from './lib/dom';

/**
 * CSS variable for animation delay.
 *
 * @constant
 */
const CSS_PROPERTY_NAME = '--inview-delay';

/**
 * Class for an element currently outside the viewport.
 *
 * @constant
 */
const OUTSIDE_VIEWPORT_CLASSNAME = 'is-outside-viewport';

/**
 * Class for an element currently animating.
 *
 * @constant
 */
const LOADING_CLASSNAME = 'is-loading';

/**
 * Class for an element finished animating.
 *
 * @constant
 */
const LOADED_CLASSNAME = 'is-loaded';

/**
 * List of seen elements to avoid repeat animations.
 *
 * @type {WeakSet<HTMLElement>}
 */
const seen = new WeakSet();

/**
 * Triggers an element in-view animation.
 *
 * @param {HTMLElement} element
 *   The element to trigger the animation on.
 * @param {number} [delay=0]
 *   The delay before triggering in milliseconds.
 */
const load = (element, delay = 0) => {
  element.style.setProperty(CSS_PROPERTY_NAME, `${delay}ms`);
  element.classList.remove(OUTSIDE_VIEWPORT_CLASSNAME);
  element.classList.add(LOADING_CLASSNAME);

  const transitionEnder = () => {
    element.removeEventListener('transitionend', transitionEnder);
    element.style.removeProperty(CSS_PROPERTY_NAME);
    element.classList.remove(LOADING_CLASSNAME);
    element.classList.add(LOADED_CLASSNAME);
    seen.add(element);
  };
  element.addEventListener('transitionend', transitionEnder);
};

/**
 * Queries whether an element is currently within the browser window.
 *
 * @param {HTMLElement} element
 *   The element to check.
 *
 * @return {boolean}
 *   True if the element is within the browser window.
 */
const isInWindow = element => {
  const { top, left, right, bottom } = element.getBoundingClientRect();
  const { innerWidth, innerHeight } = window;
  return top < innerHeight && bottom > 0 && left < innerWidth && right > 0;
};

/**
 * Matches in-view targets in a list.
 *
 * @param {HTMLElement} list
 *   In-view list parent element.
 *
 * @return {HTMLElement[]}
 *   List of target elements.
 */
const matchListTargets = list => matchChildren(list.dataset.selector, list);

/**
 * Reacts on element-viewport intersection.
 *
 * @param {IntersectionObserverEntry[]} entries
 *   Intersection event entries.
 * @param {IntersectionObserver} observer
 *   The observer.
 */
const onIntersect = (entries, observer) => {
  const parents = new WeakMap();

  entries
    .filter(({ isIntersecting }) => isIntersecting)
    .forEach(entry => {
      observer.unobserve(entry.target);

      const parent = entry.target.closest('.js-inview-list[data-selector]');
      const index = parents.get(parent) || 0;
      parents.set(parent, index + 1);
      load(entry.target, index * 100);
    });
};

/**
 * Registers a list with elements to in-view.
 *
 * @param {IntersectionObserver} observer
 *   The observer to register with.
 *
 * @return {(list: HTMLElement) => void}
 *   Register function.
 */
const registerList = observer => list =>
  matchListTargets(list)
    .filter(child => !seen.has(child))
    .forEach(child => {
      seen.add(child);

      if (!isInWindow(child)) {
        observer.observe(child);
        child.classList.add(OUTSIDE_VIEWPORT_CLASSNAME);
      }
    });

/**
 * Unregisters a list with elements from in-view.
 *
 * @param {IntersectionObserver} observer
 *   The observer to unregister with.
 *
 * @return {(list: HTMLElement) => void}
 *   Unregister function.
 */
const unregisterList = observer => list =>
  matchListTargets(list).forEach(child => observer.unobserve(child));

/**
 * Runs a function on each in-view list element in a context.
 *
 * @param {(element: HTMLElement) => any} fn
 *   The function to run.
 * @param {HTMLDocument|HTMLElement} context
 *   The element to match within.
 */
const forEachList = (fn, context) =>
  match('.js-inview-list[data-selector]', context).forEach(fn);

/**
 * The global observer.
 */
const viewObserver = new IntersectionObserver(onIntersect, { threshold: 0.2 });

/**
 * Adds lazy-loading and in-viewport animations.
 *
 * @type {Drupal~behavior}
 */
Drupal.behaviors.{{ CAMEL }}InViewList = {
  attach(context) {
    forEachList(registerList(viewObserver), context);
  },
  detach(context, settings, trigger) {
    if (trigger === 'unload') {
      forEachList(unregisterList(viewObserver), context);
    }
  },
};

if (BUNDLE_TYPE === 'legacy' && document.readyState !== 'loading') {
  Drupal.behaviors.{{ CAMEL }}InViewList.attach(document.body, drupalSettings);
}
