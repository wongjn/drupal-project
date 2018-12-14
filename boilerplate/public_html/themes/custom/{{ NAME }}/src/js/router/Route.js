/**
 * @file
 * Contains the class for a Route used by the router.
 */

import { bins, attachBins } from './bins';

const domParser = new DOMParser();

// CSS selector for script element containing drupalSettings JSON object.
const SETTINGS_SELECTOR = '[data-drupal-selector="drupal-settings-json"]';

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
  const querySelector = pathSettings.currentQuery
    ? `[data-drupal-link-query='${queryString}']`
    : ':not([data-drupal-link-query])';
  const originalSelectors = [
    `[data-drupal-link-system-path="${pathSettings.currentPath}"]`,
  ];
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
    ...originalSelectors.map(
      selector => `${selector}[hreflang="${pathSettings.currentLanguage}"]`,
    ),
  ];

  // Add query string selector for pagers, exposed filters.
  selectors = selectors.map(current => current + querySelector);

  // Add classes to the DOM elements.
  Array.from(context.querySelectorAll(selectors.join(','))).forEach(element => {
    element.classList.add('is-active');
  });
}

/**
 * Class to represent a Route.
 *
 * @prop {string} title
 *   The document title for this route.
 * @prop {object} content
 *   The markup regions for this route, keyed by area attribute value.
 * @prop {object} settings
 *   drupalSettings object for this route.
 * @prop {HTMLElement[]} assets
 *   List of asset elements.
 * @prop {bool} assetsLoaded
 *   Whether the assets have already been loaded.
 */
export default class Route {
  /**
   * Constructs a Route object.
   *
   * @param {string} markup
   *   HTML markup of the route.
   */
  constructor(markup) {
    const dom = domParser.parseFromString(markup, 'text/html');
    const contentBins = Array.from(dom.getElementsByTagName('router-content'));

    this.title = dom.title || '';
    this.settings = drupalSettings;

    // If new drupalSettings in data:
    const settingsElement = dom.querySelector(SETTINGS_SELECTOR);
    if (settingsElement) {
      // Parse the JSON.
      this.settings = JSON.parse(settingsElement.textContent);
      // Remove from the DOM.
      settingsElement.parentElement.removeChild(settingsElement);
    }

    this.assets = dom.querySelector('router-assets')
      ? Array.from(dom.querySelector('router-assets').children)
      : [];
    this.assetsLoaded = this.assets.length < 1;

    this.content = contentBins.reduce((map, bin) => {
      writeActiveLinks(bin, this.settings.path);

      map[bin.getAttribute('area')] = bin.innerHTML;
      return map;
    }, {});
  }

  /**
   * Load assets into the DOM.
   */
  async loadAssets() {
    if (this.assetsLoaded) {
      return;
    }

    // Merge drupalSettings for scripts to read on load.
    window.drupalSettings = Object.assign(drupalSettings, this.settings);
    await Promise.all(this.insertAssets());
    this.assetsLoaded = true;
  }

  /**
   * Injects assets into the DOM.
   *
   * @return {Promise[]}
   *   A promise for each element added to the DOM.
   */
  insertAssets() {
    return this.assets.map(element => {
      // Asset already in the DOM, skip.
      if (document.documentElement.innerHTML.includes(element.outerHTML)) {
        return;
      }

      // Special loading technique for scripts so that they are executed.
      if (element.tagName === 'SCRIPT') {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.addEventListener('error', reject);
          script.addEventListener('load', resolve);
          script.async = element.async;
          document.body.appendChild(script);
          script.src = element.src;
        });
      }

      document.body.appendChild(element);
      return Promise.resolve();
    });
  }

  /**
   * Replaces page content.
   */
  contentEnter() {
    document.title = this.title;

    // Swap dynamic content areas.
    Object.entries(bins).forEach(([key, bin]) => {
      const content = this.content[key];

      if (bin.innerHTML !== content) {
        bin.innerHTML = content;
      }
    });

    // Merge drupalSettings for behaviors to read.
    window.drupalSettings = Object.assign(drupalSettings, this.settings);

    // Attach behaviors after all content has been added in case there are
    // cross-element modifications by behaviors.
    attachBins(drupalSettings);
  }

  /**
   * Fetches a route from remote.
   *
   * @param {URL} originalUrl
   *   The URL of the route to fetch.
   * @return {Route}
   *   The route instance.
   *
   * @throws {Error}
   */
  static async getFromRemote(originalUrl) {
    // Clone URL parameter to avoid mutations.
    const url = new URL(originalUrl);

    url.searchParams.set('_drupal_ajax', '1');
    url.searchParams.set('_wrapper_format', 'frontend_router');

    const { ajaxPageState } = drupalSettings;
    url.searchParams.set('ajax_page_state[theme]', ajaxPageState.theme);
    url.searchParams.set(
      'ajax_page_state[theme_token]',
      ajaxPageState.theme_token,
    );
    url.searchParams.set('ajax_page_state[libraries]', ajaxPageState.libraries);

    const response = await fetch(url, { credentials: 'same-origin' });

    if (!response.ok) {
      throw new Error('Network error.');
    }

    if (!response.headers.get('Content-Type').includes('text/html')) {
      throw new Error('Path is a file.');
    }

    const responseText = await response.text();

    // Is a page not using the current Drupal theme:
    if (responseText === '__INVALID_THEME__') {
      throw new Error('Redirecting to an unroutable page.');
    }

    return new Route(responseText);
  }
}
