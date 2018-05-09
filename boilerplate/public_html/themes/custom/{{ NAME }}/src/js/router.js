/**
 * @file
 * Frontend router.
 */

import partition from 'lodash/partition';
import ROUTED_EVENT from './router-events';
import requestAnimationFramePromise from './request-animation-frame-promise';
import { TRANSITIONEND } from './supports';

// Disable browser's scrolling
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

// Make body tag focusable for route navigation aftermath.
document.body.tabIndex = '-1';

/**
 * Regex to match common administritive paths.
 */
const ADMIN_PATH = /^\/(((node|taxonomy\/term|user)\/[0-9]+\/(edit|revisions|delete)|user\/logout)$|admin\/|node\/add)/;

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
 * Mark links as active.
 *
 * Code adapted from {@see Drupal.behaviors.activeLinks}.
 *
 * @param {Node} context
 *   The DOM element to search within.
 * @param {object} pathSettings
 *   Path settings from drupalSettings.
 */
function writeActiveLinks(context, pathSettings) {
  if (typeof pathSettings.currentQuery === 'object') {
    // Remove queries for AJAX/router
    delete pathSettings.currentQuery._drupal_ajax;
    delete pathSettings.currentQuery._wrapper_format;
    delete pathSettings.currentQuery.ajax_page_state;

    if (Object.keys(pathSettings.currentQuery).length === 0) {
      delete pathSettings.currentQuery;
    }
  }

  const queryString = JSON.stringify(pathSettings.currentQuery);
  const querySelector = pathSettings.currentQuery ?
    `[data-drupal-link-query='${queryString}']` :
    ':not([data-drupal-link-query])';
  const originalSelectors = [`[data-drupal-link-system-path="${pathSettings.currentPath}"]`];
  let selectors;

  // If this is the front page, we have to check for the <front> path as
  // well.
  if (pathSettings.isFront) {
    originalSelectors.push('[data-drupal-link-system-path="<front>"]');
  }

  // Add language filtering.
  selectors = [
    // Links without any hreflang attributes (most of them).
    ...originalSelectors.map(selector => `${selector}:not([hreflang])`),
    // Links with hreflang equals to the current language.
    ...originalSelectors.map(selector => `${selector}[hreflang="${pathSettings.currentLanguage}"]`),
  ];

  // Add query string selector for pagers, exposed filters.
  selectors = selectors.map(current => current + querySelector);

  // Add classes to the DOM elements.
  Array.from(context.querySelectorAll(selectors.join(',')))
    .forEach((element) => {
      element.classList.add('is-active');
    });
}

/**
 * Class to represent a Route.
 *
 * @prop {string} title
 *   The document title for this route.
 * @prop {Map} content
 *   The markup regions for this route, keyed by area attribute.
 * @prop {object} settings
 *   drupalSettings object for this route.
 * @prop {object} assets
 *   Data of assets associated with this route.
 */
class Route {
  /**
   * Creates a Route from a string of reponse HTML markup.
   *
   * @param {string} domString
   *   The DOM string to parse.
   * @return {Route}
   *   The route.
   */
  static fromDrupal(domString) {
    const parsedDOM = this.DOMParser.parseFromString(domString, 'text/html');
    return this.fromElements(parsedDOM);
  }

  /**
   * Creates a Route from a DOM object.
   *
   * @param {Node} dom
   *   The DOM object to parse a route from.
   * @return {Route}
   *   The route.
   */
  static fromElements(dom) {
    // Get elements
    const bins = Array.from(dom.getElementsByTagName('router-content'));

    let settings;
    // If new drupalSettings in data:
    const settingsElement = dom.querySelector('[data-drupal-selector="drupal-settings-json"]');
    if (settingsElement) {
      // Parse the JSON
      settings = JSON.parse(settingsElement.textContent);
      // Remove self
      settingsElement.parentElement.removeChild(settingsElement);
    }

    const assets = [dom.head, dom.querySelector('router-assets')]
      .map((collection) => {
        if (collection && collection.children) {
          const items = Array.from(collection.children);

          // Split assets list into scripts and everything else
          const [scripts, others] = partition(items, ({ tagName, src }) => (
            tagName === 'SCRIPT' && src.length > 0
          ));

          // Remove title tag from loading assets
          others.filter(({ tagName }) => tagName !== 'TITLE');

          return {
            scripts: scripts.map(({ src }) => src),
            others: others.reduce((output, asset) => `${output}${asset.outerHTML}`, ''),
          };
        }

        return false;
      });

    bins.forEach((bin) => {
      writeActiveLinks(bin, settings.path || drupalSettings.path);
    });

    return new Route({
      title: dom.title || '',
      content: new Map(bins.map(bin => [bin.getAttribute('area'), bin.innerHTML])),
      settings: settings || drupalSettings,
      assets,
    });
  }

  /**
   * Creates an instance of Route from raw object data.
   *
   * @param {object} data
   *   Raw object data.
   */
  constructor(data) {
    this.title = data.title;
    this.content = data.content;
    this.settings = data.settings;

    this.assets = {
      top: data.assets[0] || false,
      bottom: data.assets[1] || false,
      loaded: false,
    };
  }

  /**
   * Loads assets to the top and bottom of the current DOM.
   */
  async loadAssets() {
    const loadingPromises = [];

    if (this.assets.top) {
      loadingPromises.push(...this.constructor.insertAssets(
        this.assets.top,
        document.head,
        this.settings,
      ));
    }
    if (this.assets.bottom) {
      loadingPromises.push(...this.constructor.insertAssets(
        this.assets.bottom,
        document.body,
        this.settings,
      ));
    }

    // Wait for loading to be done
    await Promise.all(loadingPromises);

    this.assets.loaded = true;
  }

  /**
   * Injects assets and scripts into the DOM.
   *
   * @param {object} assets
   *   The collection of assets to load. There is a split between scripts and
   *   "other" assets since scripts need to be loaded in a specfic way for them
   *   to execute.
   * @param {string[]} assets.scripts
   *   URLs of scripts to load.
   * @param {string} assets.others
   *   Other assets to load, such as styles, link tags.
   * @param {Element} location
   *   The DOM element to load the assets into.
   * @param {object} [settings={}]
   *   (optional) New drupalSettings object from the loading route.
   * @return {Promise[]}
   *   A promise for each script included that resolves once it has loaded or
   *   rejects if there was some kind of error.
   */
  static insertAssets({ scripts = [], others = '' }, location, settings = {}) {
    location.insertAdjacentHTML('beforeend', others);

    // Merge drupalSettings for scripts to read.
    window.drupalSettings = Object.assign(drupalSettings, settings);

    return scripts.map(src => new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.addEventListener('error', reject);
      script.addEventListener('load', resolve);
      script.async = false;
      location.appendChild(script);
      script.src = src;
    }));
  }
}
Route.DOMParser = new DOMParser();

/**
 * Object for managing progress indicator.
 */
const Loader = {
  /**
   * The progress bar element.
   *
   * @var {HTMLElement}
   */
  element: document.createElement('div'),

  /**
   * Dictionary of CSS classnames for states for the loader.
   *
   * @var {object}
   */
  CLASSES: {
    in: 'is-entering',
    out: 'is-leaving',
  },

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
  setProgress(stateName) {
    Object.entries(this.CLASSES).forEach(([state, className]) => {
      const op = state === stateName ? 'add' : 'remove';
      this.element.classList[op](className);
    });

    if (!TRANSITIONEND) {
      if (stateName === 'out') {
        return this.setProgress('inactive');
      }

      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const transitionEnder = ({ srcElement }) => {
        if (srcElement !== Loader.element) {
          return;
        }

        resolve();
        this.element.removeEventListener('transitionend', transitionEnder);

        if (stateName === 'out') {
          this.setProgress('inactive');
        }
      };
      this.element.addEventListener('transitionend', transitionEnder);
    });
  },
};
Loader.element.classList.add('c-router-loader');
if (!TRANSITIONEND) {
  Loader.element.classList.add('has-no-transitionend');
}
Loader.element.innerHTML = `
<div class="c-router-loader__inner"></div>
<div class="c-router-loader__logo">
  <img src="${drupalSettings.{{ CAMEL }}.path}/logo.svg" class="c-router-loader__logo-glyph"/>
</div>`;
document.body.appendChild(Loader.element);

const Router = {
  /**
   * Returnshe localStorage key for unroutable routes cache.
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
  bins: new Map(Array.from(document.getElementsByTagName('router-content')).map(bin => [bin.getAttribute('area'), bin])),

  /**
   * Routes the client to a new page.
   *
   * @param {string} href
   *   The href to navigate to.
   */
  async navigate(href, { historyPushState = true, scrollPosition = 0 } = {}) {
    // Rewrite current state if replacing to add scroll position information
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

    const enteringLoaderPromise = Loader.setProgress('in');

    // Set as active navigation path
    this._navigatingTo = href;

    this.bins.forEach((bin) => {
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
      fetchURL.searchParams.set('ajax_page_state[theme_token]', ajaxPageState.theme_token);
      fetchURL.searchParams.set('ajax_page_state[libraries]', ajaxPageState.libraries);

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
      }
      catch (error) {
        // Routing was not possible - send client to the href
        window.location.href = href;
        return;
      }

      this.cache.set(cacheKey, route);
    }

    await enteringLoaderPromise;

    // Aborted this navigation, do nothing further
    if (this._navigatingTo !== href) {
      Loader.setProgress('inactive');
      return;
    }

    // Load assets (JS and CSS) if not loaded before for the route.
    if (!route.assets.loaded) {
      await route.loadAssets();
    }

    const scrollTo = url.hash && historyPushState ? url.hash : scrollPosition;
    this.contentEnter(route, { scrollTo });

    if (historyPushState) {
      window.history.pushState({
        routeURL: href,
        title: route.title,
        scrollPosition: 0,
      }, route.title, href);
    }
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
    Array.from(this.bins)
      .forEach(([key, bin]) => {
        if (route && bin.innerHTML !== route.content.get(key)) {
          bin.innerHTML = route.content.get(key);
        }
      });
    // Attach behaviors after all content is in in-case of cross-content
    // modifications.
    this.bins.forEach((bin) => {
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
    }
    else if (typeof scrollTo === 'number') {
      scroll({ smooth: false, scrollTo });
      document.body.focus();
    }

    await requestAnimationFramePromise();
    await requestAnimationFramePromise();
    Loader.setProgress('out');

    document.dispatchEvent(new CustomEvent(ROUTED_EVENT, { detail: drupalSettings.path }));
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

    const { host, pathname, hash } = link;

    // Return early if:
    if (
      // External
      host !== window.location.host ||
      // Admin
      ADMIN_PATH.test(pathname) ||
      // File
      pathname.includes('.') ||
      // Hash on this page
      (pathname === window.location.pathname && hash)
    ) {
      return;
    }

    event.preventDefault();

    // Set initial route if not already set.
    if (!this.intialRoute) {
      this.setIntialRoute();
    }

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
   * Sets initial route data and history state.
   *
   * Call this as late as possible for bigPipe to replace placeholders.
   */
  setIntialRoute() {
    this.intialRoute = Route.fromElements(document);
    this.intialRoute.assets.loaded = true;

    const url = window.location.href;

    // Set up landing state (would be null otherwise)
    window.history.replaceState(
      {
        routeURL: url,
        title: this.intialRoute.title,
        scrollPosition: window.scrollY,
      },
      this.intialRoute.title,
      url,
    );

    const urlObject = new URL(url);
    this.cache.set(`${urlObject.pathname}:${urlObject.searchParams}`, this.intialRoute);
  },
};
const localStorageUnroutables = localStorage.getItem(Router.unroutableRoutesStorageKey);
Router.unroutableRoutesCache = JSON.parse(localStorageUnroutables) || [];

// Add popstate listener, for example when the browser back button is pressed
window.addEventListener('popstate', Router.onPopState.bind(Router));

// Check that Maps can be made into Arrays.
// @todo: Remove if condition when
// https://github.com/Financial-Times/polyfill-service/issues/1209 is fixed.
if (Array.from(new Map([['a', 'b']])).length > 0) {
  // Add link click listener
  document.addEventListener('click', Router.onLinkClick.bind(Router));
}
