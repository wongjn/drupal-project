/**
 * @file
 * Frontend router.
 */

/**
 * Regex to match common administritive paths.
 */
const ADMIN_PATH = /^\/((node|taxonomy\/term|user)\/[0-9]+\/(edit|revisions|delete)$|admin\/|node\/add)/;

/**
 * Flag whether the browser supports 'transitionend' event.
 */
const SUPPORTS_TRANSITION_END = 'ontransitionend' in window;

/**
 * Scrolls to the top of the page.
 */
function scroll() {
  window.scroll({ top: 0, behavior: 'smooth' });
}

/**
 * Returns a promise that resolves on next animation frame.
 *
 * @return {Promise}
 *   A promise that resolves on next animation frame.
 */
function requestAnimationFramePromise() {
  return new Promise(resolve => requestAnimationFrame(resolve));
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
    delete pathSettings.currentQuery._frontend_router;
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
    const assets = [dom.head, dom.querySelector('router-assets')]
      .map((collection) => {
        if (collection && collection.children) {
          return collection;
        }

        return false;
      });

    let settings;

    // If new drupalSettings in data:
    const settingsElement = dom.querySelector('[data-drupal-selector="drupal-settings-json"]');
    if (settingsElement) {
      // Parse the JSON
      settings = JSON.parse(settingsElement.textContent);
      // Remove self
      settingsElement.parentElement.removeChild(settingsElement);
    }

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
  loadAssets() {
    if (this.assets.top) {
      document.head.insertAdjacentHTML('beforeend', this.assets.top.innerHTML);
    }

    if (this.assets.bottom) {
      document.body.insertAdjacentHTML('beforeend', this.assets.bottom.innerHTML);
    }

    this.assets.loaded = true;
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
  element: document.createElement('router-progress'),

  /**
   * The CSS classname when the element is visible.
   *
   * @var {string}
   */
  VISIBLE_CLASS: 'is-visible',

  /**
   * Sets the indicated progress amount.
   *
   * @param {number} progress
   *   The progress to set the bar to, between 0 and 1.
   */
  setProgress(progress) {
    // Validate given parameter to be between 0 and 1
    progress = Math.max(Math.min(progress, 1), 0);

    this.element.classList.add(this.VISIBLE_CLASS);
    this.element.style.transform = `scaleX(${progress})`;
  },

  /**
   * Acts on transitionend event for the progress bar.
   *
   * @param {TransitionEvent} event
   *   An object representing a transitionend event.
   */
  async onTransitionEnd(event) {
    if (event.target !== this.element) {
      return;
    }

    // Not at max, do nothing
    if (this.element.style.transform !== 'scaleX(1)') {
      return;
    }

    // Remove the visible class
    if (this.element.classList.contains(this.VISIBLE_CLASS)) {
      this.element.classList.remove(this.VISIBLE_CLASS);

      // Return early to wait for the opacity to transition out, whereby this
      // function will fire again
      return;
    }

    // Reset back to 0
    this.element.style.transitionDuration = '0s';
    this.element.style.transform = 'scaleX(0)';

    // Wait a frame so that the element can actually scale back without
    // transitioning
    await requestAnimationFramePromise();
    this.element.style.transitionDuration = '';
  },
};
Loader.element.style.transform = 'scaleX(0)';
Loader.element.addEventListener('transitionend', Loader.onTransitionEnd.bind(Loader));
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
   * Most up-to-date drupalSettings object.
   *
   * @var {object}
   */
  drupalSettings,

  /**
   * The dynamic content areas.
   *
   * @var {HTMLElement[]}
   */
  bins: new Map(Array.from(document.getElementsByTagName('router-content')).map(bin => [bin.getAttribute('area'), bin])),

  /**
   * Routes the client to a new page.
   *
   * @param {string} path
   *   The path to navigate to.
   */
  async navigate(path, { historyPushState = true } = {}) {
    // Route directly to unroutable path from cache:
    if (this.unroutableRoutesCache.includes(path)) {
      window.location.href = path;
      return;
    }

    Loader.setProgress(0.1);

    // Set as active navigation path
    this._navigatingTo = path;

    // Create promise so that we can time when the new content can be loaded in.
    const leavingPromise = this.setLeaving();

    // Attempt to get from cache:
    let route = this.cache.get(path);
    if (!route) {
      // Build fetch URL
      const url = new URL(path);
      url.searchParams.set('_drupal_ajax', '1');
      url.searchParams.set('_frontend_router', '1');

      const { ajaxPageState } = this.drupalSettings;
      url.searchParams.set('ajax_page_state[theme]', ajaxPageState.theme);
      url.searchParams.set('ajax_page_state[theme_token]', ajaxPageState.theme_token);
      url.searchParams.set('ajax_page_state[libraries]', ajaxPageState.libraries);

      try {
        const response = await fetch(url, { credentials: 'same-origin' });
        Loader.setProgress(0.15);

        if (!response.ok) {
          throw new Error('Network error.');
        }

        const responseText = await response.text();
        Loader.setProgress(0.2);

        // Is a page not using the current Drupal theme:
        if (responseText === '__INVALID_THEME__') {
          this.addUnroutableRoute(path);
          throw new Error('Redirecting to an unroutable page.');
        }

        route = Route.fromDrupal(responseText);
      }
      catch (error) {
        // Routing was not possible - send client to the path
        window.location.href = path;
        return;
      }

      this.cache.set(path, route);
    }

    await leavingPromise;
    Loader.setProgress(0.5);

    // Aborted this navigation, do nothing further
    if (this._navigatingTo !== path) {
      return;
    }

    // Load assets (JS and CSS) if not loaded before for the route.
    if (!route.assets.loaded) {
      route.loadAssets();
    }

    Loader.setProgress(0.75);
    this.contentEnter(route, { scroll: historyPushState });

    if (historyPushState) {
      window.history.pushState({ routeURL: path, title: route.title }, route.title, path);
      scroll();
    }
  },

  /**
   * Initiate page leaving animations and runtimes.
   *
   * @return {Promise}
   *   A promise that resolves once leaving animations for the page have been
   *   completed.
   */
  setLeaving() {
    // Skip transitioning if no transitionend event can be listened to.
    if (!SUPPORTS_TRANSITION_END) {
      return Promise.resolve();
    }

    document.body.classList.add('is-leaving-page');
    return new Promise((resolve) => {
      this.bins.forEach((bin) => {
        Drupal.detachBehaviors(bin, this.drupalSettings);
      });

      const resolver = (event) => {
        if (event.target.tagName !== 'ROUTER-CONTENT') {
          return;
        }

        resolve();
        document.body.removeEventListener('transitionend', resolver);
      };

      document.body.addEventListener('transitionend', resolver);
    });
  },

  /**
   * Add (new) content into the page.
   *
   * @param {Route|bool} [route=false]
   *   The route containing data to replace content, or pass false to re-display
   *   the current DOM content (useful for cancelled navigation situations).
   */
  async contentEnter(route = false) {
    if (this._navigatingTo === null) {
      route = false;
    }

    if (route) {
      document.title = route.title;
    }

    this.drupalSettings = route ? route.settings : this.drupalSettings;

    // List of promises for animated scale changes.
    const stretchChangePromises = Array.from(this.bins)
      // Filer to only changed content areas
      .filter(([key, bin]) => {
        if (route && bin.innerHTML === route.content.get(key)) {
          Drupal.attachBehaviors(bin, this.drupalSettings);
          return false;
        }

        return true;
      })
      // Get the layout positions before content changes
      .map(([key, bin]) => ({ key, bin, oldRect: bin.getBoundingClientRect() }))
      .map((binEntry) => {
        const { key, bin } = binEntry;

        // Replace with new content
        bin.innerHTML = route.content.get(key);
        Drupal.attachBehaviors(bin, this.drupalSettings);

        return binEntry;
      })
      .map((binEntry) => {
        const { bin, oldRect } = binEntry;

        // Get new content layout data
        const newRect = bin.getBoundingClientRect();

        // Does not support transitionend event or same vertical position
        // do nothing further.
        if (!SUPPORTS_TRANSITION_END ||
          (oldRect.bottom === newRect.bottom && oldRect.top === newRect.top)) {
          return Promise.resolve();
        }

        // Translation amount
        const translate = oldRect.top - newRect.top;

        // Avoid zero-height infinity cases
        let scale;
        if (newRect.height === 0) {
          scale = oldRect.height;
        }
        else if (oldRect.height === 0) {
          scale = 1 / newRect.height;
        }
        else {
          scale = oldRect.height / newRect.height;
        }

        // Temporarily remove duration to set 'from' translation state
        bin.style.transitionDuration = '0s';

        // Set translation state
        bin.style.transform = `translateY(${translate}px) scaleY(${scale})`;
        // Set a 1px height if new height would be 0, since scaling 0 height
        // would still be 0.
        bin.style.height = newRect.height === 0 ? '1px' : '';
        bin.style.marginTop = newRect.height === 0 ? '-1px' : '';

        // Push promise of finished transition to collection so it is known
        // when all are done.
        return new Promise(async (resolve) => {
          // Request two animation frames since first frame can be the current
          // frame instead of the next one.
          await requestAnimationFramePromise();
          await requestAnimationFramePromise();

          // Listen for transition ending
          const resolver = (event) => {
            if (event.target !== bin) {
              return;
            }

            resolve();
            bin.removeEventListener('transitionend', resolver);

            // Remove styles for zero-height container
            if (newRect.height === 0) {
              bin.style.height = '';
              bin.style.marginTop = '';
            }
          };
          bin.addEventListener('transitionend', resolver);

          // Remove some inline styles to start start transitions
          bin.style.transitionDuration = '';
          bin.style.transform = '';
        });
      });

    // Wait for transitions to be done
    await Promise.all(stretchChangePromises);

    // Remove leaving page class
    document.body.classList.remove('is-leaving-page');

    Loader.setProgress(1);


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

    const { routeURL, title } = event.state;
    if (routeURL) {
      document.title = title;
      this.navigate(routeURL, { historyPushState: false });
    }
  },

  /**
   * Reacts on a link click.
   *
   * @param {MouseEvent} event
   *   An object representing a click event.
   */
  onLinkClick(event) {
    if (event.target.tagName !== 'A') {
      return;
    }

    // Return early if external or known admin URL
    const { host, pathname } = event.target;
    if (host !== window.location.host || ADMIN_PATH.test(pathname)) {
      return;
    }

    event.preventDefault();

    // Set initial route if not already set.
    if (!this.intialRoute) {
      this.setIntialRoute();
    }

    // Already on clicked location:
    if (event.target.href === window.location.href) {
      // Show instant 100% progress for feedback
      Loader.setProgress(1);
      scroll();
      // Do nothing further
      return;
    }

    this.navigate(event.target.href);
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
      { routeURL: url, title: this.intialRoute.title },
      this.intialRoute.title,
      url,
    );

    this.cache.set(url, this.intialRoute);
  },
};
const localStorageUnroutables = localStorage.getItem(Router.unroutableRoutesStorageKey);
Router.unroutableRoutesCache = JSON.parse(localStorageUnroutables) || [];

// Add popstate listener, for example when the browser back button is pressed
window.addEventListener('popstate', Router.onPopState.bind(Router));

// Add link click listener
document.addEventListener('click', Router.onLinkClick.bind(Router));
