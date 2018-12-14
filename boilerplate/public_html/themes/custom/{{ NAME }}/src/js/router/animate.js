/**
 * @file
 * Page animations handling.
 */

// Selector for key page animation elements.
const ANIMATION_SELECTOR = 'none';

/**
 * Creates a Promise that resolves on transition end.
 *
 * @param {HTMLElement} element
 *   The element to listen on. The transitions MUST be on the element itself.
 * @return {Promise}
 *   A promise to resolve on transitionend event.
 */
function transitionEndPromise(element) {
  return new Promise(resolve => {
    // Create function value so that it can be removed.
    // @todo replace with { once: true } option once all supported platforms
    // support it.
    const resolver = ({ target }) => {
      if (element !== target) {
        return;
      }

      element.removeEventListener('transitionend', resolver);
      resolve();
    };

    element.addEventListener('transitionend', resolver);
  });
}

/**
 * Animates elements.
 *
 * @param {'in'|'out'} which
 *   The direction of the animation; 'in' for a new page coming into view or
 *   'out' for the page leaving.
 * @return {Promise}
 *   A promise that resolves once all animation elements have finished
 *   animating.
 */
export default function animate(which) {
  const animatables = Array.from(document.querySelectorAll(ANIMATION_SELECTOR));
  const promises = animatables.map(transitionEndPromise);

  const operation = which === 'out' ? 'add' : 'remove';
  document.body.classList[operation]('is-animating');

  return Promise.all(promises);
}
