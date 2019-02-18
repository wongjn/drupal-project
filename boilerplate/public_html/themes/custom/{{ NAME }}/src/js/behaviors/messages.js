/**
 * @file
 * Show Drupal status messages through iziToast.
 */

import IziToast from 'izitoast';
import { markSideEffectsOnly } from '../lib/behaviors';

// Set default iziToast settings.
IziToast.settings({
  timeout: false,
  progressBar: false,
});

// Mapping of Drupal message types to iziToast presets.
const messageTypes = {
  status: 'success',
  warning: 'warning',
  error: 'error',
};

// Get messages JSON data from an element.
const parseElementJSON = element => JSON.parse(element.dataset.messages || '');

/**
 * Shows messages in a particular style.
 *
 * @param {string} type
 *   The type of messages to toast.
 * @param {string[]} messages
 *   The messages to toast.
 */
function showMessages(type, messages) {
  messages.forEach(message => IziToast[messageTypes[type]]({ message }));
}

export default markSideEffectsOnly(element => {
  const list = parseElementJSON(element);
  Object.entries(list).forEach(([type, messages]) =>
    showMessages(type, messages),
  );
  element.remove();
});
