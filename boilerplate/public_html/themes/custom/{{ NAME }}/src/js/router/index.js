/**
 * @file
 * Frontend router.
 */

import Router from './Router';
import assetManager from './plugins/assetManager';

// Routable links.
const linkSelectors = [
  `a[href^="${window.location.origin}"]`,
  'a[href^="/"]',
  'a[href^="#"]',
  'a[href^="?"]',
];

const router = new Router({
  elements: ['router-content'],
  LINK_SELECTOR: linkSelectors
    .map(selector => `${selector}:not([data-no-swup])`)
    .join(','),
  // animationSelector: '',
  plugins: [assetManager],
  pageClassPrefix: false,
  debugMode: process.env.NODE_ENV === 'development',
  animateScroll: false,
});

if (module.hot) {
  module.hot.dispose(() => router.destroy());
  module.hot.accept();
}
