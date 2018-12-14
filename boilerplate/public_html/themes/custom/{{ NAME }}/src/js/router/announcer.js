/**
 * @file
 * Announcer handling for screen-reader accessibility.
 */

const announcer = document.createElement('div');
announcer.classList.add('visually-hidden');
announcer.setAttribute('aria-live', 'polite');
document.body.appendChild(announcer);

/**
 * Announces a new page load to screen-readers.
 *
 * @param {string} title
 *   The full page title of the new page. Assumed that it uses default Drupal
 *   pipe symbol to separate page and site title text.
 */
export default function announce(title = document.title) {
  const pageTitle = title.split('|')[0].trim();
  announcer.innerHTML = Drupal.t(`${pageTitle} page has loaded.`);
}
