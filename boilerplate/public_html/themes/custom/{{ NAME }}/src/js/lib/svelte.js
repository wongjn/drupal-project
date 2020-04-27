/**
 * @file
 * Svelte-related utilities.
 */

import { createFocusTrapper } from './dom';

/* eslint-disable import/prefer-default-export */

/**
 * Action to keep focus trapped within a given element.
 *
 * @param {HTMLElement} node
 *   DOM element to trap focus within.
 * @param {Object} [options]
 *   Options.
 * @param {boolean} options.trap
 *   Set to true to activate trapping, false to disable.
 *
 * @return {Object}
 *   The focus trap action.
 */
export const focusTrap = (node, options = { trap: false }) => {
  let trapper;

  const destroy = () =>
    trapper && document.removeEventListener('focusin', trapper);

  const update = ({ trap }) => {
    destroy();

    if (trap) {
      trapper = createFocusTrapper(node);
      document.addEventListener('focusin', trapper);
    }
  };

  // Initial pass.
  update(options);

  return { update, destroy };
};
