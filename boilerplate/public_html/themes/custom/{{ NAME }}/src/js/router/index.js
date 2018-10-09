/**
 * @file
 * Frontend router.
 */

import requestAnimationFramePromise from '../request-animation-frame-promise';
import setProgress from './loader';
import Route from './route';
import { ROUTED_EVENT } from './events';

// Make body tag focusable for route navigation aftermath.
document.body.tabIndex = '-1';

/**
 * Regex to match common administritive paths.
 */
const ADMIN_PATH = new RegExp(
  `^${
  drupalSettings.path.baseUrl
  }(((node|taxonomy/term|user)/[0-9]+/(edit|revisions|delete)|user/logout)$|admin/|node/add)`,
);

/**
 * Scrolls to the top of the page.
 *
 * @param {object} options
 *   List of options.
 * @param {bool} [options.smooth=true]
 *   Whether the scroll should be smooth.
 * @param {number} [options.scrollTo=0]
 *   The Y-coordinate to scroll to.
 */
function scroll({ smooth = true, scrollTo = 0 } = {}) {
  if (smooth) {
    window.scroll({ top: scrollTo, behavior: 'smooth' });
    return;
  }

  window.scroll(window.screenX, scrollTo);
}

/**
 * Determines whether a URL is routable.
 *
 * @param {URL|object} urlData
 *   The URL as an object of its properties.
 * @param {string} urlData.host
 *   The URL's host.
 * @param {string} urlData.pathname
 *   The URL portion after the host (starts with a slash) but with no query
 *   parameters or hash.
 * @param {string} urlData.hash
 *   The string after any hash (#) in the URL.
 *
 * @return {bool}
 *   Returns true if unroutable URL.
 */
function isUnroutableURL({ host, pathname, hash } = {}) {
  return (
    // External
    host !== window.location.host ||
    // Admin
    ADMIN_PATH.test(pathname) ||
    // File
    pathname.includes('.') ||
    // Hash on this page
    (pathname === window.location.pathname && hash)
  );
}

const Router = {
  /**
   * Returns the localStorage key for unroutable routes cache.
   *
   * @return {string}
   *   The localStorage key for unroutable routes cache.
   */
  get unroutableRoutesStorageKey() {
    return 'routerUnroutableRoutes';
  },

  /**
   * A list of URLs already navigated once.
   *
   * @var {Map}
   */
  cache: new Map(),

  /**
   * The dynamic content areas.
   *
   * @var {HTMLElement[]}
   */
  bins: new Map(
    Array.from(document.getElementsByTagName('router-content')).map(bin => [
      bin.getAttribute('area'),
      bin,
    ]),
  ),

  /**
   * List of forms not in dynamic router content areas.
   *
   * @var {HTMLFormElement[]}
   */
  staticForms: Array.from(document.getElementsByTagName('form')).filter(
    formElement =>
      !formElement.closest('router-content') &&
      !isUnroutableURL(new URL(formElement.action)),
  ),

  /**
   * Routes the client to a new page.
   *
   * @param {string} href
   *   The href to navigate to.
   */
  async navigate(href, { historyPushState = true, scrollPosition = 0 } = {}) {
    // Disable any browser auto scrolling (for forward/back history traversal)
    window.history.scrollRestoration = 'manual';

    // If pushing, rewrite current state to add scroll position information
    if (historyPushState) {
      const { routeURL, title } = window.history.state;
      const overwrittenState = {
        routeURL,
        title,
        scrollPosition: window.scrollY,
      };
      window.history.replaceState(overwrittenState, title, routeURL);
    }

    const url = new URL(href);

    const cacheKey = `${url.pathname}:${url.searchParams}`;

    // Route directly to unroutable path from cache:
    if (this.unroutableRoutesCache.includes(cacheKey)) {
      window.location.href = href;
      return;
    }

    const enteringLoaderPromise = setProgress('in');

    // Set as active navigation path
    this._navigatingTo = href;

    this.bins.forEach(bin => {
      Drupal.detachBehaviors(bin, drupalSettings);
    });

    // Attempt to get from cache:
    let route = this.cache.get(cacheKey);

    if (!route) {
      // Build fetch URL
      const fetchURL = new URL(url);
      fetchURL.searchParams.set('_drupal_ajax', '1');
      fetchURL.searchParams.set('_wrapper_format', 'frontend_router');

      const { ajaxPageState } = drupalSettings;
      fetchURL.searchParams.set('ajax_page_state[theme]', ajaxPageState.theme);
      fetchURL.searchParams.set(
        'ajax_page_state[theme_token]',
        ajaxPageState.theme_token,
      );
      fetchURL.searchParams.set(
        'ajax_page_state[libraries]',
        ajaxPageState.libraries,
      );

      try {
        const response = await fetch(fetchURL, { credentials: 'same-origin' });

        if (!response.ok) {
          throw new Error('Network error.');
        }

        if (!response.headers.get('Content-Type').includes('text/html')) {
          this.addUnroutableRoute(cacheKey);
          throw new Error('Path is a file.');
        }

        const responseText = await response.text();

        // Is a page not using the current Drupal theme:
        if (responseText === '__INVALID_THEME__') {
          this.addUnroutableRoute(cacheKey);
          throw new Error('Redirecting to an unroutable page.');
        }

        route = Route.fromDrupal(responseText);
      } catch (error) {
        // Routing was not possible - send client to the href
        window.location.href = href;
        return;
      }

      this.cache.set(cacheKey, route);
    }

    await enteringLoaderPromise;

    // Aborted this navigation, do nothing further
    if (this._navigatingTo !== href) {
      setProgress('inactive');
      return;
    }

    // Load assets (JS and CSS) if not loaded before for the route.
    if (!route.assets.loaded) {
      await route.loadAssets();
    }

    const scrollTo = url.hash && historyPushState ? url.hash : scrollPosition;
    this.contentEnter(route, { scrollTo });

    // Update action URLs of static forms to the new page.
    this.staticForms.forEach(formElement => {
      formElement.action = url.pathname;
    });

    if (historyPushState) {
      window.history.pushState(
        {
          routeURL: href,
          title: route.title,
          scrollPosition: 0,
        },
        route.title,
        href,
      );
    }

    // Restore auto window scrolling (for refreshing the page for example)
    window.history.scrollRestoration = 'auto';

    document.body.focus();
  },

  /**
   * Add (new) content into the page.
   *
   * @param {Route|bool} [route=false]
   *   The route containing data to replace content, or pass false to re-display
   *   the current DOM content (useful for cancelled navigation situations).
   * @param {object} [options={}]
   *   Additional options when entering new content.
   * @param {string|number} [options.scrollTo=0]
   *   Pass a CSS selector to scroll to the element on load (such as for anchor
   *   tags with a hash) or a number as the Y-coordinate.
   */
  async contentEnter(route = false, { scrollTo = 0 } = {}) {
    if (this._navigatingTo === null) {
      route = false;
    }

    if (route) {
      document.title = route.title;
      window.drupalSettings = Object.assign(drupalSettings, route.settings);
    }

    // Swap dynamic content areas.
    Array.from(this.bins).forEach(([key, bin]) => {
      if (route && bin.innerHTML !== route.content.get(key)) {
        bin.innerHTML = route.content.get(key);
      }
    });
    // Attach behaviors after all content is in in-case of cross-content
    // modifications.
    this.bins.forEach(bin => {
      Drupal.attachBehaviors(bin, drupalSettings);
    });

    if (typeof scrollTo === 'string') {
      // Resolve scroll position for hash links
      const scrollToElement = document.querySelector(scrollTo);
      if (scrollToElement) {
        if ('scrollIntoView' in Element) {
          scrollToElement.scrollIntoView();
        }
        scrollToElement.focus();
      }
    } else if (typeof scrollTo === 'number') {
      scroll({ smooth: false, scrollTo });
      document.body.focus();
    }

    await requestAnimationFramePromise();
    await requestAnimationFramePromise();
    setProgress('out');

    document.dispatchEvent(
      new CustomEvent(ROUTED_EVENT, { detail: drupalSettings.path }),
    );
    this._navigatingTo = null;
  },

  /**
   * Reacts on a popstate history event.
   *
   * @param {PopStateEvent} event
   *   The event representing a popstate event.
   */
  onPopState(event) {
    if (event.state == null) {
      return;
    }

    const { routeURL, title, scrollPosition = 0 } = event.state;
    if (routeURL) {
      document.title = title;
      this.navigate(routeURL, { historyPushState: false, scrollPosition });
    }
  },

  /**
   * Reacts on a link click.
   *
   * @param {MouseEvent} event
   *   An object representing a click event.
   */
  onLinkClick(event) {
    const link = event.target.closest('a');

    if (!link) {
      return;
    }

    // Return early if unroutable
    if (isUnroutableURL(link)) return;

    event.preventDefault();

    // Already on clicked location:
    if (link.href === window.location.href) {
      document.body.focus();
      scroll();
      // Do nothing further
      return;
    }

    this.navigate(link.href);
  },

  /**
   * Adds an unroutable URL to the cache.
   *
   * @param {string} url
   *   The URL to add to the unroutable routes cache.
   */
  addUnroutableRoute(url) {
    this.unroutableRoutesCache.push(url);

    const data = JSON.stringify(this.unroutableRoutesCache);
    localStorage.setItem(this.unroutableRoutesStorageKey, data);
  },

  /**
   * Sets initial route data and history state for the first page a user visits.
   */
  setIntialRoute() {
    const initialRoute = Route.fromElements(document);
    initialRoute.assets.loaded = true;

    const url = window.location.href;

    // Set up landing state (would be null otherwise)
    window.history.replaceState(
      {
        routeURL: url,
        title: initialRoute.title,
        scrollPosition: window.scrollY,
      },
      initialRoute.title,
      url,
    );

    // Do not set a cache entry if bigPipe exists. This is because we would save
    // bigPipe placeholders in the route data meaning that these placeholder
    // would not get rendered again by bigPipe if the user ever navigated back
    // to this page via the history API.
    if (!('bigPipePlaceholderIds' in drupalSettings)) {
      const urlObject = new URL(url);
      this.cache.set(
        `${urlObject.pathname}:${urlObject.searchParams}`,
        initialRoute,
      );
    }
  },
};
const localStorageUnroutables = localStorage.getItem(
  Router.unroutableRoutesStorageKey,
);
Router.unroutableRoutesCache = JSON.parse(localStorageUnroutables) || [];
Router.setIntialRoute();

// Add popstate listener, for example when the browser back button is pressed
window.addEventListener('popstate', Router.onPopState.bind(Router));

// Check that Maps can be made into Arrays.
// @todo: Remove if condition when
// https://github.com/Financial-Times/polyfill-service/issues/1209 is fixed.
if (Array.from(new Map([['a', 'b']])).length > 0) {
  // Add link click listener
  document.addEventListener('click', Router.onLinkClick.bind(Router));
}
