/**
 * @file
 * Event names to dispatch/subscribe to related to the router.
 */

/**
 * Event name for when the router has routed to another page.
 */
export const ROUTED_EVENT = 'frontend_routed';

/**
 * Fires a routed event with the given path settings.
 *
 * @param {object} pathSettings
 *   The path settings from drupalSettings.
 *
 * @fires event:frontend_routed
 */
export function dispatchEvent(pathSettings = drupalSettings.path) {
  /**
   * Indicates a page has been navigated to.
   *
   * @param {object} detail
   *   The path settings from drupalSettings
   *
   * @event frontend_routed
   */
  const event = new CustomEvent(ROUTED_EVENT, { detail: pathSettings });
  document.dispatchEvent(event);

  if (process.env.NODE_ENV === 'development') {
    console.log('Dispatched routed event.', pathSettings);
  }
}
