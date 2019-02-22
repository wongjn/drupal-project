/**
 * @file
 * Contains event listener functions for routing.
 */

import cache from './cache';
import navigate from './navigator';
import Route from './Route';
import scrollTo from './scroll-to';

// Regex fragments for known admin paths.
const adminPaths = [
  // Entity CRUD paths.
  '(node|taxonomy/term|user)/[0-9]+/(edit|revisions|delete)',
  // Entity add.
  '(node|block)/add',
  // Block editing.
  'block/([0-9])',
  // Admin section.
  'admin(/|$)',
  // User logout and plain 'user' path (cannot handle the redirection).
  'user/logout|user$',
];
// Regex to match common administrative paths.
const ADMIN_PATH = new RegExp(
  `^${drupalSettings.path.baseUrl}(${adminPaths.join('|')})`,
);

/**
 * Determines whether a given URL is unroutable.
 *
 * @param {URL} url
 *   The URL to check.
 * @return {bool}
 *   Returns true if not routable.
 */
function isUnroutable({ href, host, pathname, protocol }) {
  return (
    !href ||
    // Is external.
    (host && host !== window.location.host) ||
    // Is not a page link.
    protocol.indexOf('http') !== 0 ||
    // Is known admin page.
    ADMIN_PATH.test(pathname) ||
    // Is probably a file if last component in path has a dot.
    pathname
      .split('/')
      .reverse()[0]
      .includes('.')
  );
}

// Previous location state for popstate handling.
let previousLocation = new URL(window.location);

/**
 * Reacts on click event.
 *
 * @param {MouseEvent} event
 *   The click event object.
 */
export async function onLinkClick(event) {
  const link = event.target.closest('a');

  if (!link || isUnroutable(link)) {
    return;
  }

  event.preventDefault();

  // Clicked on the link to the exact same page.
  if (link.href === window.location.href) {
    scrollTo(link.hash || 0, true);
    return;
  }

  try {
    await navigate(new URL(link.href));
  } catch (error) {
    window.location.href = link.href;

    if (process.env.NODE_ENV === 'development') {
      console.error(error);
    }

    return;
  }

  previousLocation = new URL(window.location);
}

/**
 * Reacts on popstate event.
 *
 * @param {PopStateEvent} event
 *   The popstate event object.
 */
export async function onPopState({ state }) {
  if (!(state && 'routerData' in state)) {
    previousLocation = new URL(window.location);
    return;
  }

  const { routeURL, title, scrollPosition = 0 } = state.routerData;
  document.title = title;
  await navigate(new URL(routeURL), {
    newPage: false,
    scrollPosition,
    previousLocation,
  });

  previousLocation = new URL(window.location);
}

let prefetching = false;

/**
 * Reacts on link hover.
 *
 * @param {MouseEvent} event
 *   The click event object.
 */
export async function onLinkHover(event) {
  const link = event.target.closest('a');

  if (!link || isUnroutable(link) || cache.get(link) || prefetching) {
    return;
  }

  prefetching = true;
  if (process.env.NODE_ENV === 'development') {
    console.log(`Prefetching ${link.pathname}${link.search}${link.hash}`);
  }

  try {
    const url = new URL(link.href);
    const route = Route.getFromRemote(url);
    cache.set(url, route);

    await route;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(error);
    }
  }

  prefetching = false;
}
