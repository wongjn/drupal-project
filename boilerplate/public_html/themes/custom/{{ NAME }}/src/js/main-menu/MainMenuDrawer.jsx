/**
 * @file
 * Contains main menu drawer menu preact component.
 */

import { h, Component } from 'preact';
import MainMenuDrawerMenu from './MainMenuDrawerMenu';

/**
 * Main menu drawer menu preact component.
 */
export default class MainMenuDrawer extends Component {
  /**
   * @inheritDoc
   */
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      focus: false,
    };

    this.focusTargets = {};
    this.docBody = document.body;

    this.scrollbarWidth = 0;
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.escClose = this.escClose.bind(this);
    this.navigateClose = this.navigateClose.bind(this);
    this.setFocusTargetButton = this.setFocusTarget.bind(this, 'openButton');
    this.setFocusTargetTitle = this.setFocusTarget.bind(this, 'drawerTitle');
  }

  /**
   * @inheritDoc
   */
  componentDidMount() {
    // Add Esc to close the drawer
    document.addEventListener('keydown', this.escClose);
  }

  /**
   * @inheritDoc
   */
  componentDidUpdate() {
    const focusTarget = this.state.focus;
    if (focusTarget && focusTarget in this.focusTargets) {
      this.focusTargets[focusTarget].focus();
    }
  }

  /**
   * @inheritDoc
   */
  componentWillUnmount() {
    // Remove Esc event listener
    document.removeEventListener('keydown', this.escClose);
  }

  /**
   * Sets DOM element reference for focus management.
   *
   * @param {string} name
   *   The object key to use as the name of the element.
   * @param {HTMLElement} element
   *   The element to reference to.
   */
  setFocusTarget(name, element) {
    this.focusTargets[name] = element;
  }

  /**
   * Opens the drawer.
   */
  open() {
    this.setState({
      open: true,
      // Focus to drawer title
      focus: 'drawerTitle',
    });
  }

  /**
   * Closes the drawer from an Escape key press event.
   *
   * @param {Event} event
   *   The keyboard event.
   * @param {string} event.key
   *   The name of the key that was pressed.
   */
  escClose({ key }) {
    if (key === 'Escape' && this.state.open) {
      this.close();
    }
  }

  /**
   * Closes the drawer.
   */
  close() {
    this.setState({
      open: false,
      // Focus to open button
      focus: 'openButton',
    });
  }

  /**
   * Modifies scroll-ability of the document body.
   *
   * @param {bool} open
   *   Whether this drawer component state is set to open.
   */
  modifyBodyScroll(open) {
    const beforeWidth = this.docBody.offsetWidth;

    // Remove scrolling from body
    this.docBody.style.overflow = open ? 'hidden' : '';

    // Update scrollbar width
    this.scrollbarWidth = Math.abs(this.docBody.offsetWidth - beforeWidth);

    if (this.scrollbarWidth !== 0) {
      // Compensate for possible scrollbar layout jump
      this.docBody.style.paddingRight = open ? `${this.scrollbarWidth}px` : '';
    }
  }

  /**
   * Closes the drawer if an element clicked was a link.
   *
   * @param {Event} event
   *   The object that represents a click or keyboard event within the drawer
   *   element.
   * @param {HTMLElement} event.target
   *   The element that was clicked.
   */
  navigateClose({ target }) {
    if (target.tagName === 'A') {
      this.close();
    }
  }

  /**
   * @inheritDoc
   */
  render({ menuTree, classes, hide }, { open }) {
    const oldOpen = this._open;
    this._open = open;

    this.modifyBodyScroll(open);

    return (
      <div class={`${classes} c-drawer-menu`} style={hide && 'display:none'}>
        <button
          ref={this.setFocusTargetButton}
          class="c-drawer-menu__open-btn"
          aria-controls="drawer-menu"
          aria-hidden={String(open)}
          tabIndex={open ? -1 : 0}
          onClick={this.open}
        >
          {this.constructor.l18n.open}
        </button>

        <button
          class="c-drawer-menu__close-btn"
          aria-controls="drawer-menu"
          aria-hidden={String(!open)}
          tabIndex={open ? 0 : -1}
          onClick={this.close}
        >
          {this.constructor.l18n.close}
        </button>

        <div
          id="drawer-menu"
          class={`c-drawer-menu__drawer ${open ? 'is-open' : ''}`}
          style={!open && { marginRight: this.scrollbarWidth * -1 }}
          onClick={this.navigateClose}
          role="presentation"
        >
          <h2
            class="c-drawer-menu__title"
            ref={this.setFocusTargetTitle}
            tabIndex="-1"
          >
            {this.constructor.l18n.title}
          </h2>
          {
            // Only rerender menus if open state was the same - this means the
            // current rendering is NOT to open the drawer, and means that the
            // menu has changed.
          }
          <MainMenuDrawerMenu menuTree={menuTree} rerender={this._open === oldOpen} />
        </div>
      </div>
    );
  }
}

MainMenuDrawer.l18n = {
  open: Drupal.t('Open full menu'),
  close: Drupal.t('Close full menu'),
  title: Drupal.t('Main menu'),
};
