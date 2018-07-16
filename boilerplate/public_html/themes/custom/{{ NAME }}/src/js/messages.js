/**
 * @file
 * Show Drupal status messages through iziToast.
 */

import IziToast from 'izitoast';
import ROUTED_EVENT from './router/';

/**
 * Mapping of Drupal message types to iziToast presets.
 *
 * @var {object}
 */
const TYPE_DICTIONARY = {
  status: 'success',
  warning: 'warning',
  error: 'error',
};

// Set default iziToast settings.
IziToast.settings({
  timeout: false,
  progressBar: false,
});

/**
 * Displays messages.
 */
function runMessages() {
  let i = 0;

  Object.entries(window.drupalSettings.{{ CAMEL }}.messages)
    .forEach(([type, messages]) => {
      messages.forEach((message) => {
        setTimeout(() => IziToast[TYPE_DICTIONARY[type]]({ message }), i * 200);
        i += 1;
      });
    });
}
runMessages();

document.addEventListener(ROUTED_EVENT, runMessages);
