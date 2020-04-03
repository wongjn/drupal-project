/**
 * @file
 * Main JS entry point.
 */

import './main-menu';
import './scrollbar-size';
import { behaviorsRegistrationInit } from './lib/behaviors';

/**
 * Invokes the default property of a given object.
 *
 * @param {Object} obj
 *   The object given.
 *
 * @return {any}
 *   Result from calling the `default` on the given object.
 */
const invokeDefault = ({ default: f }) => f();

import(/* webpackChunkName: "async" */ './in-view').then(invokeDefault);

if (BUNDLE_TYPE === 'legacy') {
  // All browsers that support ES modules natively also support external-use
  // SVGs, so only polyfill for the legacy bundle.
  import(/* webpackChunkName: "async" */ './lib/svg-polyfill').then(
    invokeDefault,
  );
}

behaviorsRegistrationInit();
