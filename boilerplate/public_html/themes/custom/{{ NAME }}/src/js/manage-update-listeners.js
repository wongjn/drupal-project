/**
 * @file
 * Manages update functions on an object.
 */

import debounce from 'lodash/debounce';
import { LOAD_EVENT_NAME } from './in-view';

/**
 * Adds a (debounced) update listener to an object.
 *
 * @param {function} updater
 *   The updater function.
 * @param {HTMLElement|null} [element=null]
 *   The element to attach in-view listener to.
 *
 * @return {function}
 *   The debounce updater function. attached to some DOM events.
 */
export function addUpdateListener(updater, element = null) {
  if (typeof updater === 'function') {
    const debouncedUpdater = debounce(updater, 500);

    window.addEventListener('resize', debouncedUpdater);
    if (element) {
      element.addEventListener(LOAD_EVENT_NAME, debouncedUpdater);
    }

    updater();
    return debouncedUpdater;
  }
}

/**
 * Removes a (debounced) update listener.
 *
 * @param {function} debouncedUpdater
 *   The debounced updater function to remove.
 * @param {HTMLElement|null} [element=null]
 *   The element to to detach the listener from.
 */
export function removeUpdateListener(debouncedUpdater, element = null) {
  if (typeof debouncedUpdater === 'function') {
    window.removeEventListener('resize', debouncedUpdater);
    if (element) {
      element.removeEventListener(LOAD_EVENT_NAME, debouncedUpdater);
    }
  }
}
