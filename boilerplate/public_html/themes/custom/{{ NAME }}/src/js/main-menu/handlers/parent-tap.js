/**
 * @file
 * Handles parent touch management.
 */

/**
 * Handler for parent menu item tap.
 *
 * @prop {HTMLLIElement|null} _openParent
 *   The currently open parent.
 */
export default class ParentTap {
  /**
   * Creates an instance of ParentTap.
   *
   * @param {object} elements
   *   Dictionary of noteworthy elements.
   * @param {HTMLULElement} elements.menu
   *   Main menu item list.
   */
  constructor({ menu }) {
    this.menu = menu;
    this._openParent = null;

    this._onTouch = this._onTouch.bind(this);
    this._listeners('add');
  }

  onRouted() {
    if (this._openParent) this._openParent.classList.remove('is-open');
    this._openParent = null;
  }

  onDestroy() {
    this._listeners('remove');
  }

  /**
   * Manages event listeners.
   *
   * @param {'add'|'remove'} operation
   *   The operation to perform for the listeners.
   */
  _listeners(operation) {
    const method = `${operation}EventListener`;
    document[method]('touchstart', this._onTouch, { passive: false });
  }

  /**
   * Reacts on touch event.
   *
   * @param {TouchEvent} event
   *   The touch event object.
   */
  _onTouch(event) {
    const li = event.target.closest('li');

    // Not tap in menu, close any open parent and return.
    if (!this.menu.contains(event.target) || !li) {
      if (this._openParent) this._openParent.classList.remove('is-open');
      this._openParent = null;
      return;
    }

    // No sub menu to open or has already been open, return. Will be closed in
    // onRouted().
    const subMenu = li.querySelector('ul');
    if (!subMenu || li === this._openParent) {
      return;
    }

    // Close previously opened parent if any.
    if (this._openParent) this._openParent.classList.remove('is-open');

    li.classList.add('is-open');
    this._openParent = li;
    event.preventDefault();
    event.stopPropagation();
  }
}
