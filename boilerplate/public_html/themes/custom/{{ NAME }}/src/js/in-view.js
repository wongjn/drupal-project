/**
 * @file
 * Provides element animation when it is within the viewport.
 *
 * @todo Re-implement single selection if ever needed.
 */

import { curry, forEach, filter, pipe } from 'rambda';
import { createBehavior } from './lib/behaviors';
import { match } from './lib/dom';

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
  };
  element.addEventListener('transitionend', transitionEnder);
};

/**
 * Sets up the loader for elements.
 *
 * @param {IntersectionObserverCallback} callback
 *   The function to run on any intersection.
 * @param {number} threshold
 *   The threshold parameter for the IntersectionObserver options.
 *
 * @return {(elements: Element[]) => () => void}
 *   The loader that accepts an array of elements to watch for intersection and
 *   that returns a function to destroy the loader.
 */
const setUpLoader = (callback, threshold) => {
  const observer = new IntersectionObserver(callback, { threshold });

  return pipe(
    forEach(element => {
      element.classList.add(OUTSIDE_VIEWPORT_CLASSNAME);
      observer.observe(element);
    }),
    // Return a function to disable the observer. Must be bound to avoid
    // 'Illegal invocation' error.
    () => observer.disconnect.bind(observer),
  );
};

/**
 * Builds an on-intersection IntersectionObserver callback.
 *
 * @param {(element: Element, delay: number) => void} loader
 *   The loader to run on an IntersectionObserverEntry.target when it is
 *   intersecting the viewport.
 *
 * @return {IntersectionObserverCallback}
 *   Callback for IntersectionObserver objects.
 */
const onIntersect = loader => (entries, observer) =>
  entries
    .filter(({ isIntersecting }) => isIntersecting)
    .forEach((entry, index) => {
      observer.unobserve(entry.target);
      loader(entry.target, index * 100);
    });

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
  const { top, height } = element.getBoundingClientRect();
  return top > window.innerHeight || top < height * -1;
};

/**
 * Returns a function to create a in-view animating list of elements.
 *
 * @param {boolean} justInvoked
 *   True if this is the first invocation after script load.
 *
 * @return {() => void}
 *   The list creator. The creator returns the destroy function.
 */
const createList = (justInvoked = false) => list => {
  const createCollection = pipe(
    curry(match)(list.dataset.selector),
    justInvoked ? filter(isInWindow) : args => args,
    setUpLoader(onIntersect(load), parseFloat(list.dataset.ratio) || 0.2),
  );

  // Set on next computation frame so that multiple calls of the above
  setTimeout(() => {
    justInvoked = false;
  }, 0);
  $
  return createCollection(list);
};

/**
 * Adds lazy-loading and in-viewport animations.
 *
 * @type {Drupal~behavior}
 */
Drupal.behaviors.{ { CAMEL } } InViewList = createBehavior(
  '.js-inview-list[data-selector]',
  createList(true),
);
