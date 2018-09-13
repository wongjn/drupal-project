/**
 * @file
 * Creates a loader element to indicate routing progress.
 */

const logo = '';

// Create loader element
const loaderElement = document.createElement('div');
loaderElement.classList.add('c-router-loader');
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
 *   loader root element.
 */
export default function setProgress(stateName) {
  Object.entries(CLASSES).forEach(([state, className]) => {
    const op = state === stateName ? 'add' : 'remove';
    loaderElement.classList[op](className);
  });

  return new Promise(resolve => {
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
