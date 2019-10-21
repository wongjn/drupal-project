/**
 * @file
 * Plugin-style functionality orchestration.
 */

/**
 * Adds an event listener.
 *
 * @callback orchestratorOn
 *
 * @param {string} event
 *   The name of the event to listen on.
 * @param {function} callback
 *   The function to call when the event is fired.
 */

/**
 * Fires all event listeners of the a given event type.
 *
 * @callback orchestratorFire
 *
 * @param {string} event
 *   The name of the event to fire.
 * @param {object|void} [data=undefined]
 *   (optional) Extra data of the event.
 */

/**
 * Orchestrating object that 'plugins' can attach to.
 *
 * @typedef Orchestrator
 *
 * @prop {orchestratorOn} on
 *   Adds an event listener.
 * @prop {orchestratorFire} fire
 *   Fires all event listeners of the a given event type.
 */

/**
 * Creates a plugin-style orchestrator.
 *
 * @param {object} [fields={}]
 *   (optional) Object mapping of a any extra fields to add.
 *
 * @return {Orchestrator}
 *   The orchestrator.
 */
export default (fields = {}) => ({
  ...fields,
  _listeners: {},
  on(event, callback) {
    this._listeners[event] = (this._listeners[event] || []).concat(callback);
  },
  fire(event, data) {
    if (event in this._listeners) {
      this._listeners[event].forEach(callback => callback(data));
    }
  },
});
