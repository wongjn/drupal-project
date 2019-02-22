/**
 * @file
 * Navigation procedure.
 */
import animate from './animate';
import announce from './announcer';
import { detachBins } from './bins';
import cache from './cache';
import { dispatchEvent } from './events';
import Route from './Route';
import scrollTo from './scroll-to';
import requestAnimationFramePromise from '../lib/request-animation-frame-promise';

/* eslint-disable no-console */

// Tracks the URL being navigated to, in case it gets cancelled midway.
let navigatingTo = null;

/**
 * Navigates to a new URL.
 *
 * @param {URL} url
 *   The url to navigate to.
 * @param {object} options
 *   Options.
 * @param {bool} [options.newPage=true]
 *   Whether the page should be added to the history.
 * @param {number} [options.scrollPosition=0]
 *   The scroll position to place the window after navigation.
 * @param {Location} [options.previousLocation=window.location]
 *   The previous window location. Used to detect hash-only changes.
 */
export default async function navigate(url, options = {}) {
  const {
    newPage = true,
    scrollPosition = 0,
    previousLocation = window.location,
  } = options;

  navigatingTo = url;

  const isHashChangeOnly =
    previousLocation.pathname === url.pathname &&
    previousLocation.search === url.search;

  // Disable any browser auto scrolling (for forward/back history traversal).
  window.history.scrollRestoration = 'manual';

  // If pushing, rewrite current state to add scroll position information.
  if (newPage) {
    const routerData = {
      routeURL: previousLocation.href,
      title: document.title,
      scrollPosition: window.scrollY,
    };

    window.history.replaceState(
      { routerData },
      routerData.title,
      routerData.routeURL,
    );

    if (process.env.NODE_ENV === 'development') {
      console.log('Replaced existing route:', routerData);
    }
  }

  // Attempt to get from cache, might be a promise if already fetching.
  let route = cache.get(url);

  // Check if we should animate the page; only when navigating to a new page
  // (not popstate) and that it is not only a change in hash.
  const canAnimate = (newPage || !route) && !isHashChangeOnly;
  const animationPromise = canAnimate ? animate('out') : Promise.resolve();

  if (!isHashChangeOnly) detachBins(drupalSettings);

  // Get route.
  if (!route) {
    route = await Route.getFromRemote(url);
    cache.set(url, route);
  } else if (route instanceof Promise) {
    route = await route;
  }

  await Promise.all([route.loadAssets(), animationPromise]);

  // Aborted this particular navigation, do nothing further.
  if (navigatingTo !== url) return;

  if (newPage) {
    const routerData = {
      routeURL: url.toString(),
      title: route.title,
      scrollPosition: 0,
    };
    window.history.pushState({ routerData }, route.title, url.toString());

    if (process.env.NODE_ENV === 'development') {
      console.log('Pushed new route:', routerData);
    }
  }

  if (!isHashChangeOnly) {
    route.contentEnter();
    dispatchEvent(route.settings.path);
  }

  // If new page and there is a hash in the URL, use it otherwise use the
  // saved scrollPosition since popState instances probably will not have the
  // scroll position on the hash.
  const scrollTarget = url.hash && newPage ? url.hash : scrollPosition;
  scrollTo(scrollTarget, newPage);

  // Restore auto window scrolling for manual page refresh.
  window.history.scrollRestoration = 'auto';
  navigatingTo = null;

  if (!isHashChangeOnly) announce(route.title);

  // Wait a frame so that CSS transitions actually happen.
  await requestAnimationFramePromise();
  animate('in');
}
