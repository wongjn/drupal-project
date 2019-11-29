/**
 * @file
 * Plugin-style functionality orchestration.
 */

/**
 * Orchestrating object that 'plugins' can attach to.
 *
 * @typedef Orchestrator
 *
 * @prop {(event: string, callback: (data?: Object) => void) => void} on
 *   Adds an event listener.
 * @prop {(event: string, data?: Object) => void} fire
 *   Fires all event listeners of the a given event type.
 */

/**
 * Creates a plugin-style orchestrator.
 *
 * @param {Object} [fields={}]
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
