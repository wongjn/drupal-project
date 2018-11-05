/**
 * @file
 * Contains the class for a Route used by the router.
 */

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
 * @prop {Map} content
 *   The markup regions for this route, keyed by area attribute.
 * @prop {object} settings
 *   drupalSettings object for this route.
 * @prop {object} assets
 *   Data of assets associated with this route.
 */
export default class Route {
  /**
   * Creates a Route from a string of response HTML markup.
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
   * @param {object} options
   *   Options when creating the route object.
   *
   * @return {Route}
   *   The route.
   */
  static fromElements(dom, { assetsLoaded = false } = {}) {
    // Get elements
    const bins = Array.from(dom.getElementsByTagName('router-content'));

    let settings;
    // If new drupalSettings in data:
    const settingsElement = dom.querySelector(
      '[data-drupal-selector="drupal-settings-json"]',
    );
    if (settingsElement) {
      // Parse the JSON
      settings = JSON.parse(settingsElement.textContent);
      // Remove self
      settingsElement.parentElement.removeChild(settingsElement);
    }

    bins.forEach(bin => {
      writeActiveLinks(bin, settings.path || drupalSettings.path);
    });

    return new Route({
      title: dom.title || '',
      content: new Map(
        bins.map(bin => [bin.getAttribute('area'), bin.innerHTML]),
      ),
      settings: settings || drupalSettings,
      assets:
        dom.querySelector('router-assets') &&
        Array.from(dom.querySelector('router-assets').children),
      assetsLoaded,
    });
  }

  /**
   * Creates an instance of Route from raw object data.
   *
   * @param {object} data
   *   Raw object data.
   */
  constructor({ title, content, settings, assets, assetsLoaded = false }) {
    this.title = title;
    this.content = content;
    this.settings = settings;
    this.assets = assets;

    this._assetsLoaded = assetsLoaded;
  }

  /**
   * Loads assets to the top and bottom of the current DOM.
   */
  async loadAssets() {
    window.drupalSettings = Object.assign(drupalSettings, this.settings);

    if (this._assetsLoaded) {
      await Promise.all(this.assets.map(this.constructor.injectAsset));
      this._assetsLoaded = true;
    }
  }

  /**
   * Injects an asset element into the DOM.
   *
   * @param {HTMLElement} assetElement
   *   The asset element node.
   * @return {Promise}
   *   A promise that resolves once it has loaded or rejects if there was some
   *   kind of error.
   */
  static injectAsset(assetElement) {
    if (assetElement.tagName === 'SCRIPT') {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.addEventListener('error', reject);
        script.addEventListener('load', resolve);
        script.async = false;
        document.body.appendChild(script);
        script.src = assetElement.src;
      });
    }

    document.body.appendChild(assetElement);
    return Promise.resolve();
  }
}
Route.DOMParser = new DOMParser();
