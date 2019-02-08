/**
 * @file
 * Entry point of the router.
 *
 * Used to save the initial page state before the async code-split router script
 * executes, since it will most likely execute after other scripts have modified
 * the DOM.
 */
const initialPage = document.documentElement.outerHTML;

import(/* webpackPrefetch: true, webpackChunkName: "entry-async" */ './init').then(
  ({ default: init }) => init(initialPage),
);
