/**
 * @file
 * Top-level initiation script.
 */

/* eslint-disable no-console */

import cache from './cache';
import Route from './Route';
import { onLinkClick, onPopState, onLinkHover } from './orchestrator';

/**
 * Sets the initial route.
 *
 * @param {string} pageMarkup
 *   The page HTML.
 */
function setInitialRoute(pageMarkup) {
  const url = new URL(window.location.href);
  const route = new Route(pageMarkup, url);
  route.assetsLoaded = true;

  // Set up landing state (would be null otherwise).
  const routerData = {
    routeURL: window.location.href,
    title: route.title,
    scrollPosition: window.scrollY,
  };
  window.history.replaceState(routerData, route.title, url.toString());

  if (process.env.NODE_ENV === 'development') {
    console.log('Replaced existing route:', routerData);
  }

  // Do not set a cache entry if bigPipe exists. This is because we would save
  // bigPipe placeholders in the route data meaning that these placeholder
  // would not get rendered again by bigPipe if the user ever navigated back
  // to this page via the history API.
  if (!('bigPipePlaceholderIds' in drupalSettings)) {
    cache.set(url, route);
  }
}

/**
 * Initializes routing.
 *
 * @param {string} initialPage
 *   The initial page HTML markup.
 *
 * @listens event:click
 * @listens event:popstate
 */
export default function init(initialPage = '') {
  if (initialPage) {
    setInitialRoute(initialPage);
  }

  document.addEventListener('click', onLinkClick);
  document.addEventListener('mouseover', onLinkHover);
  document.addEventListener('focusin', onLinkHover);
  window.addEventListener('popstate', onPopState);
}
