/**
 * @file
 * Full menu drawer menu.
 */

import templateParse from '../../lib/template-parser';

// HTML ID for the drawer menu element.
const DRAWER_HTML_ID = 'drawer-menu';

/**
 * Clones main menu markup.
 *
 * @param {HTMLULElement} menu
 *   The top-level main menu element.
 * @return {string}
 *   The modified menu ready for injection into the drawer.
 */
function cloneMenu(menu) {
  return (
    menu.outerHTML
      // Replace main menu classes with drawer classes.
      .replace(/(\W)s-main-menu/g, '$1c-drawer-menu')
      // Remove any attributes from line break handler.
      .replace(/ (aria-hidden|style)="(.+?)"/g, '')
  );
}

// Manages window scrolling.
const windowScrollManager = {
  /**
   * Window ScrollX value before drawer is opened.
   *
   * @var {number}
   */
  x: 0,
  /**
   * Window ScrollY value before drawer is opened.
   *
   * @var {number}
   */
  y: 0,
  /**
   * The browser's scrollbar width.
   *
   * False to indicate that it has not been calculated.
   *
   * @var {bool|number}
   */
  barWidth: false,
  /**
   * Toggles scrolling.
   *
   * @param {bool} disable
   *   True to disable scrolling, otherwise false to enable.
   */
  scrollingToggle(disable) {
    if (disable) {
      this.x = window.scrollX;
      this.y = window.scrollY;
    }

    // Get scrollbar width.
    const barWidth = window.innerWidth - document.documentElement.offsetWidth;
    
    // Remove scrolling from body.
    document.body.style.overflow = disable ? 'hidden' : '';
    // Compensate for possible scrollbar layout jump.
    document.body.style.paddingRight = disable ? `${barWidth}px` : '';

    if (!disable) {
      window.scroll(this.x, this.y);
    }
  },
};

/**
 * Drawer manager.
 */
export default class Drawer {
  /**
   * Creates an instance of Drawer.
   *
   * @param {object} elements
   *   Dictionary of noteworthy elements.
   * @param {HTMLULElement} elements.wrapper
   *   The wrapper element of the main menu area.
   * @param {HTMLULElement} elements.menu
   *   Main menu item list.
   */
  constructor({ wrapper, menu }) {
    this._menuTopItems = Array.from(menu.children);

    this._createOpenButtonWidget();
    this._createDrawer(menu);

    this.drawerOpen = this.drawerOpen.bind(this);
    this.drawerClose = this.drawerClose.bind(this);
    this._escClose = this._escClose.bind(this);
    this._trapFocus = this._trapFocus.bind(this);
    this._navigateClose = this._navigateClose.bind(this);

    this._listeners('add');

    wrapper.appendChild(this.openButtonWrapper);
    wrapper.appendChild(this.drawer);
  }

  onResize() {
    const hasHidden = this._menuTopItems.some(
      item => item.getAttribute('aria-hidden') === 'true',
    );
    this.openButtonWrapper.style.display = hasHidden ? '' : 'none';
  }

  onDestroy() {
    this.openButtonWrapper.parentElement.removeChild(this.openButtonWrapper);
    this.drawer.parentElement.removeChild(this.drawer);

    this._drawerListeners('remove');
    this._listeners('remove');
  }

  /**
   * Opens the drawer menu.
   */
  drawerOpen() {
    this.drawer.classList.add('is-open');
    this.topMenu.scrollTop = 0;
    this.title.focus();

    this._drawerListeners('add');

    windowScrollManager.scrollingToggle(true);
  }

  /**
   * Closes the drawer menu.
   */
  drawerClose() {
    this.drawer.classList.remove('is-open');

    this._drawerListeners('remove');

    this.openButton.focus();
    windowScrollManager.scrollingToggle(false);
  }

  /**
   * Manages event listeners for the open drawer element.
   *
   * @param {'add'|'remove'} operation
   *   The operation to perform for the listeners.
   */
  _drawerListeners(operation) {
    const method = `${operation}EventListener`;
    document[method]('keydown', this._escClose);
    document[method]('focusin', this._trapFocus);
  }

  /**
   * Creates the drawer open button DOM.
   */
  _createOpenButtonWidget() {
    const [wrapper, refs] = templateParse(`
      <div class="s-main-menu__drawer" style="display:none">
        <button
          ref="button"
          class="s-main-menu__open-btn"
          aria-hidden="true"
          aria-controls="${DRAWER_HTML_ID}"
          tabIndex="-1"
        >
          <div class="s-main-menu__burger"></div>
          ${Drupal.t('Full menu')}
        </button>
      </div>
    `);

    this.openButtonWrapper = wrapper;
    this.openButton = refs.button;
  }

  /**
   * Creates the drawer element.
   *
   * @param {HTMLUListElement} menu
   *   The top-level main menu element.
   */
  _createDrawer(menu) {
    const [drawer, refs] = templateParse(`
      <div id="${DRAWER_HTML_ID}" class="c-drawer-menu">
        <header class="c-drawer-menu__title" tabIndex="-1" ref="title">
          <h2 class="o-title">${Drupal.t('Full menu')}</h2>
        </header>
        <button
          ref="button"
          tabIndex="0"
          aria-controls="${DRAWER_HTML_ID}"
          class="c-drawer-menu__close-btn"
        >
          ${Drupal.t('Close full menu')}
        </button>
        ${cloneMenu(menu)}
      </div>
    `);

    this.drawer = drawer;
    this.closeButton = refs.button;
    this.title = refs.title;

    this.topMenu = this.drawer.querySelector('.c-drawer-menu__top-menu');
    const links = this.topMenu.querySelectorAll('a');
    this.lastLink = links[links.length - 1];
  }

  /**
   * Manages event listeners.
   *
   * @param {'add'|'remove'} operation
   *   The operation to perform for the listeners.
   */
  _listeners(operation) {
    const method = `${operation}EventListener`;
    this.openButton[method]('click', this.drawerOpen);
    this.closeButton[method]('click', this.drawerClose);
    this.drawer[method]('click', this._navigateClose);
  }

  /**
   * Closes the drawer on keyboard 'esc' key.
   *
   * @param {KeyboardEvent} event
   *   The keyboard event object.
   */
  _escClose({ key }) {
    if (key === 'Escape') {
      this.drawerClose();
    }
  }

  /**
   * Traps focus within the component.
   *
   * @param {FocusEvent} event
   *   The focus event object.
   */
  _trapFocus({ target }) {
    if (this.drawer.contains(target)) {
      this.lastFocused = target;
      return;
    }

    if (this.lastFocused === this.lastLink) {
      this.closeButton.focus();
    } else {
      this.lastLink.focus();
    }
  }

  /**
   * Closes the drawer on link click.
   *
   * @param {MouseEvent} event
   *   The mouse event object.
   */
  _navigateClose({ target }) {
    if (target.tagName === 'A') {
      this.drawerClose();
    }
  }
}
