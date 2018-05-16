/**
 * @file
 * Creates a loader element to indicate routing progress.
 */

import { TRANSITIONEND } from '../supports';

const logo = '';

// Create loader element
const loaderElement = document.createElement('div');
loaderElement.classList.add('c-router-loader');
if (!TRANSITIONEND) {
  loaderElement.classList.add('has-no-transitionend');
}
loaderElement.innerHTML = `
<div class="c-router-loader__inner"></div>
<div class="c-router-loader__logo">
  <img src="${logo}" class="c-router-loader__logo-glyph"/>
</div>`;
document.body.appendChild(loaderElement);

/**
 * Dictionary of CSS classnames for states for the loader.
 *
 * @var {object}
 */
const CLASSES = {
  in: 'is-entering',
  out: 'is-leaving',
};

/**
 * Sets the progress state.
 *
 * @param {'in'|'out'|'inactive'} stateName
 *   The progress state to set.
 *
 * @return {Promise}
 *   A promise that resolves when the first transition has finished on the
 *   loader root element, or straight away if the user agent does not support
 *   the transitionend event.
 */
export default function setProgress(stateName) {
  Object.entries(CLASSES).forEach(([state, className]) => {
    const op = state === stateName ? 'add' : 'remove';
    loaderElement.classList[op](className);
  });

  if (!TRANSITIONEND) {
    if (stateName === 'out') {
      return setProgress('inactive');
    }

    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const transitionEnder = ({ target }) => {
      if (target !== loaderElement) {
        return;
      }

      resolve();
      loaderElement.removeEventListener('transitionend', transitionEnder);

      if (stateName === 'out') {
        setProgress('inactive');
      }
    };
    loaderElement.addEventListener('transitionend', transitionEnder);
  });
}
