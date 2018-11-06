/**
 * @file
 * Asset management Swup plugin.
 */

import clone from 'lodash/clone';
import { ROUTED_EVENT } from '../events';

// Keep track of routes' drupalSettings.
const routeSettings = {};
const loadedAssets = [];

const parser = new DOMParser();

let swupInstance;

/**
 * Initializes the plugin.
 */
function init() {
  const { pathname, search } = window.location;
  const url = `${pathname}${search}`;

  // Add drupalSettings for initial page.
  routeSettings[url] = clone(drupalSettings);
}

/**
 * Parses HTML string to DOM objects.
 *
 * @param {string} string
 *   The string of HTML.
 *
 * @return {Document}
 *   A DOM document object.
 */
function parseStringToDOM(string) {
  return parser.parseFromString(string, 'text/html');
}

/**
 * Returns whether an asset element is injectable.
 *
 * @param {HTMLElement} assetElement
 *   The asset element to check.
 *
 * @return {bool}
 *   Returns true if injectable into the DOM.
 */
function isInjectableAsset({ tagName, outerHTML }) {
  return tagName !== 'TITLE' && !loadedAssets.includes(outerHTML);
}

/**
 * Injects an asset element into the DOM.
 *
 * @param {HTMLElement} assetElement
 *   The asset element.
 *
 * @return {Promise}
 *   A promise that fulfills once the inserted asset has loaded.
 */
function injectAsset(assetElement) {
  loadedAssets.push(assetElement.outerHTML);

  if (assetElement.tagName !== 'SCRIPT') {
    document.body.appendChild(assetElement);
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.addEventListener('error', reject);
    script.addEventListener('load', resolve);
    script.async = false;
    document.body.appendChild(script);
    script.src = assetElement.src;
  });
}

/**
 * Adds assets for the current page.
 *
 * @param {string} pageURL
 *   The page URL.
 *
 * @return {Promise}
 *   A promise that all inserted assets have loaded.
 */
function getAssets(pageURL) {
  const page = swupInstance.cache.getPage(pageURL);
  const dom = parseStringToDOM(page.originalContent);

  // Drupal settings for this page, default to current settings.
  let settings = drupalSettings;

  // If new drupalSettings in data:
  const settingsElement = dom.querySelector(
    '[data-drupal-selector="drupal-settings-json"]',
  );
  if (settingsElement) {
    // Parse the JSON.
    settings = JSON.parse(settingsElement.textContent);

    // Remove self from parsed DOM so that it does not get added as an asset
    // element.
    settingsElement.parentElement.removeChild(settingsElement);
  }

  const assetBin = dom.querySelector('router-assets');
  const assets = assetBin
    ? Array.from(assetBin.children).filter(isInjectableAsset)
    : [];

  return { assets, settings };
}

/**
 * Loads assets for a route.
 */
async function load() {
  const { pathname, search } = window.location;
  const url = `${pathname}${search}`;

  let assetsToLoad = [];
  let settings = drupalSettings;

  if (!(url in routeSettings)) {
    ({ settings, assets: assetsToLoad } = getAssets(url));
    routeSettings[url] = settings;
  }

  // Update drupalSettings.
  Object.assign(window.drupalSettings, settings);

  await Promise.all(assetsToLoad.map(injectAsset));

  // Dispatch custom event after assets have loaded.
  document.dispatchEvent(
    new CustomEvent(ROUTED_EVENT, { detail: drupalSettings.path }),
  );
}

/**
 * Asset manager.
 */
export default {
  name: 'assetManager',
  exec(_, swup) {
    swupInstance = swup;
    swupInstance.on('enabled', init);
    swupInstance.on('contentReplaced', load);
  },
};
