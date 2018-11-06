/**
 * @file
 * Swup request method override.
 */

import swupRequest from 'swup/lib/modules/request';

export default (options, callback) => {
  const originalURL = options.url;

  const routerParams = new URLSearchParams();
  routerParams.set('_drupal_ajax', '1');

  const { ajaxPageState } = drupalSettings;
  routerParams.set('ajax_page_state[theme]', ajaxPageState.theme);
  routerParams.set('ajax_page_state[libraries]', ajaxPageState.libraries);

  const joiner = options.url.includes('?') ? '&' : '?';
  options.url += `${joiner}${routerParams.toString()}`;

  const proxyCallback = callback
    ? (response, request) => {
        // Restore to original URL before calling callback.
        options.url = originalURL;
        callback.call(null, response, request);
      }
    : null;

  swupRequest(options, proxyCallback);
};
