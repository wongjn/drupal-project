/**
 * @file
 * Contains the class for a Route used by the router.
 */

import partition from 'lodash/partition';

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
export default class Route {
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
