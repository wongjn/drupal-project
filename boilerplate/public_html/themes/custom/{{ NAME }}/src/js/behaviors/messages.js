/**
 * @file
 * Show Drupal status messages through iziToast.
 */

import IziToast from 'izitoast';

// Set default iziToast settings.
IziToast.settings({
  timeout: false,
  progressBar: false,
});

export default class Messages {
  constructor(element) {
    const json =
      'content' in element ? element.content.textContent : element.textContent;

    let i = 0;
    Object.entries(JSON.parse(json.trim())).forEach(([type, messages]) => {
      messages.forEach(message => {
        setTimeout(
          () => IziToast[this.constructor.TYPE_DICTIONARY[type]]({ message }),
          i * 200,
        );
        i += 1;
      });
    });

    element.parentElement.removeChild(element);
  }
}
/**
 * Mapping of Drupal message types to iziToast presets.
 *
 * @var {object}
 */
Messages.TYPE_DICTIONARY = {
  status: 'success',
  warning: 'warning',
  error: 'error',
};
