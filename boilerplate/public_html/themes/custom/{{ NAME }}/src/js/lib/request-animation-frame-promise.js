/**
 * @file
 * Contains the function for a requestAnimationFrame promise.
 */

/**
 * Returns a promise that resolves on next animation frame.
 *
 * @return {Promise}
 *   A promise that resolves on next animation frame.
 */
export default function requestAnimationFramePromise() {
  return new Promise(resolve => requestAnimationFrame(resolve));
}
