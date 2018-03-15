/**
 * @file
 * Provides element 'loading' when it is within the viewport.
 */

import last from 'lodash/last';
import partition from 'lodash/partition';

/**
 * CSS selector for lists.
 *
 * @type {string}
 */
const LIST_SELECTOR = '.js-inview-list[data-selector]';

/**
 * CSS selector for singular in-view elements.
 *
 * @type {string}
 */
const SINGLES_SELECTOR = '.js-inview';

/**
 * CSS selector in-view elements.
 *
 * @type {string}
 */
const SELECTOR = `${LIST_SELECTOR}${SINGLES_SELECTOR ? `, ${SINGLES_SELECTOR}` : ''}`;

/**
 * A list of active behaviors keyed by associative element it is attached to.
 *
 * @type {WeakMap}
 */
const activeElements = new WeakMap();

/**
 * A list of elements already observed.
 *
 * @type {WeakSet}
 */
const observedElements = new WeakSet();

/**
 * Loadable state manager for InView.
 *
 * @prop {HTMLElement} element
 *   The DOM element the Loadable is associated with.
 */
class Loadable {
  /**
   * CSS custom property delay value name including the “--” prefix.
   *
   * @var {string}
   */
  static get CSS_PROPERTY_NAME() {
    return '--inview-delay';
  }

  /**
   * The CSS class for a element that is not in-view.
   *
   * @var {string}
   */
  static get OUTSIDE_VIEWPORT_CLASSNAME() {
    return 'is-outside-viewport';
  }

  /**
   * The CSS class for a element that is loading.
   *
   * @var {string}
   */
  static get LOADING_CLASSNAME() {
    return 'is-loading';
  }

  /**
   * The CSS class for a element that is has loaded.
   *
   * @var {string}
   */
  static get LOADED_CLASSNAME() {
    return 'is-loaded';
  }

  /**
   * Creates an instance of Loadable.
   *
   * @param {HTMLElement} element
   *   The element to load.
   */
  constructor(element) {
    this.element = element;
    this.element.classList.add(this.constructor.OUTSIDE_VIEWPORT_CLASSNAME);
  }

  /**
   * Loads an element.
   *
   * @param {number} [index=0]
   *   The index of the element in the loading sequence for staggering effects.
   *
   * @return {Promise}
   *   A promise that resolves once the element has finished transitoning in.
   */
  load(index = 0) {
    this.element.style.setProperty(this.constructor.CSS_PROPERTY_NAME, `${index * 100}ms`);
    this.element.classList.remove(this.constructor.OUTSIDE_VIEWPORT_CLASSNAME);
    this.element.classList.add(this.constructor.LOADING_CLASSNAME);

    return new Promise((resolve) => {
      this._end = this._end.bind(this, resolve);
      this.element.addEventListener('transitionend', this._end);
    });
  }

  /**
   * Marks the end of the element's transition.
   *
   * @param {function} resolve
   *   The callback function to run.
   *
   * @see Loadable.load
   */
  _end(resolve) {
    this.element.style.removeProperty(this.constructor.CSS_PROPERTY_NAME);
    this.element.removeEventListener('transitionend', this._end);
    this.element.classList.remove(this.constructor.LOADING_CLASSNAME);
    this.element.classList.add(this.constructor.LOADED_CLASSNAME);
    resolve();
  }
}

/**
 * A collection of loadable elements.
 *
 * @prop {IntersectionObserver} observer
 *   The observer that indicates when an element is in view of the browser.
 * @prop {WeakMap} loaders
 *   The loader objects associated with each element.
 */
class Collection {
  /**
   * Gets the name of the 'loaded' event.
   *
   * @return {string}
   *   The name of the 'loaded' event.
   */
  static get LOAD_EVENT_NAME() {
    return 'inview-loaded';
  }

  /**
   * Creates an instance of Collection.
   *
   * @param {HTMLElement[]} elements
   *   The elements to manage.
   * @param {number} [threshold=0.2]
   *   A number between 0 and 1 as fraction of the element's bounding box that
   *   should be visible before it is considered in the viewport.
   */
  constructor(elements, threshold = 0.2) {
    this.observer = new IntersectionObserver(this.onIntersect.bind(this), { threshold });

    this.loaders = new WeakMap();
    this.elements = elements
      .filter(element => !observedElements.has(element))
      .map((element) => {
        observedElements.add(element);
        this.observer.observe(element);
        this.loaders.set(element, new Loadable(element));
        return element;
      });
  }

  /**
   * Loads a set of elements.
   *
   * @param {HTMLElement[]} elements
   *   The elements to load.
   */
  static load(elements) {
    elements.forEach((element, index) => {
      (new Loadable(element)).load(index);
    });
  }

  /**
   * Manages an intersection change.
   *
   * @param {IntersectionObserverEntry[]} entries
   *   List of intersection entries.
   * @param {IntersectionObserver} observer
   *   The observer managing the change.
   */
  onIntersect(entries, observer) {
    const loadingPromises = entries
      .filter(entry => entry.isIntersecting || entry.intersectionRatio > 0)
      .filter(entry => this.loaders.has(entry.target))
      .map((entry, index) => {
        observer.unobserve(entry.target);
        return this.loaders.get(entry.target).load(index);
      });

    Promise.all(loadingPromises)
      .then(this.loadedEventFire.bind(this, last(entries).target));
  }

  /**
   * Dispatches a load event to the DOM.
   *
   * @param {HTMLElement} [element=document.body]
   *   The element to fire the event from.
   */
  loadedEventFire(element = document.body) {
    const event = new CustomEvent(this.constructor.LOAD_EVENT_NAME, { bubbles: true });
    element.dispatchEvent(event);
  }

  /**
   * Detaches this functionality from the DOM.
   */
  detach() {
    this.observer.disconnect();
  }
}
export const { LOAD_EVENT_NAME } = Collection;

/**
 * Initialises in-view loading for a set of elements.
 *
 * @param {HTMLElement[]} elements
 *   The elements to manage.
 * @param {number} [threshold=0.2]
 *   A number between 0 and 1 as fraction of the element's bounding box that
 *   should be visible before it is considered in the viewport.
 *
 * @return {Collection}
 *   The collection handler for a set of items.
 */
function init(elements, threshold = 0.2) {
  if ('IntersectionObserver' in window) {
    return new Collection(elements, threshold);
  }

  Collection.load(elements);
}
export default init;

((Drupal) => {
  /**
   * Adds lazy-loading and in-viewport animations.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.{{ CAMEL }}Inview = {
    attach(context) {
      const elements = Array.from(context.querySelectorAll(SELECTOR))
        .concat((typeof context.matches === 'function' && context.matches(SELECTOR)) ? [context] : []);

      if (elements.length > 0) {
        const [lists, singular] = partition(elements, element => element.matches(LIST_SELECTOR));

        lists.forEach((list) => {
          const { selector, ratio } = list.dataset;
          const items = Array.from(list.querySelectorAll(selector));

          activeElements.set(list, init(items, ratio));
        });

        singular.forEach(ele => activeElements.set(ele, init([ele], 0)));
      }
    },
    detach(context, settings, trigger) {
      if (trigger === 'unload') {
        Array.from(context.querySelectorAll(SELECTOR))
          .concat((context.matches(SELECTOR)) ? [context] : [])
          .filter((element) => {
            const handler = activeElements.get(element);
            return handler && typeof handler.detach === 'function';
          })
          .forEach(element => activeElements.get(element).detach());
      }
    },
  };
})(Drupal);
