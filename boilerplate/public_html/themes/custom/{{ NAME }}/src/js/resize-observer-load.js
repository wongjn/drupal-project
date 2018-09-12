/**
 * @file
 * Loads a Resize Observer (either native or from polyfill).
 */

import { RESIZE_OBSERVER } from './supports';

const resizeObserverLoad = RESIZE_OBSERVER
  ? Promise.resolve({ default: ResizeObserver })
  : import(/* webpackChunkName: "resize-observer-polyfill" */ 'resize-observer-polyfill');

/**
 * The ResizeObserver constructor as a promise.
 *
 * @var {Promise}
 */
export default resizeObserverLoad.then(module => module.default);
