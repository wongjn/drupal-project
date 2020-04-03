/**
 * @file
 * Main JS entry point.
 */

import './main-menu';
import './scrollbar-size';
import { behaviorsRegistrationInit } from './lib/behaviors';

import(/* webpackChunkName: "async" */ './in-view').then(({ default: f }) =>
  f(),
);

if (BUNDLE_TYPE === 'legacy') {
  // All browsers that support ES modules natively also support external-use
  // SVGs, so only polyfill for the legacy bundle.
  import(
    /* webpackChunkName: "async" */ './lib/svg-polyfill'
  ).then(({ default: f }) => f());
}

behaviorsRegistrationInit();
