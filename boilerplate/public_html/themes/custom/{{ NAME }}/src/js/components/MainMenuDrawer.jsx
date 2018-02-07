/**
 * @file
 * Contains main menu drawer menu preact component.
 */

import { h, Component } from 'preact';
import MainMenuMenu from './MainMenuMenu';

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
    this.setFocusTargetButton = this.setFocusTarget.bind(this, 'drawerTitle');
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
   * Opens the drawer from a click event.
   *
   * @param {Event} event
   *   The event from which the open command comes from.
   */
  open(event) {
    this.setState({
      open: true,
      // Focus to drawer title if keyboard synthetic click (e.g. enter key)
      focus: event.x + event.y === 0 && 'drawerTitle',
    });
  }

  /**
   * Closes the drawer from an Escape key press event.
   *
   * @param {Event} event
   *   The keyboard event.
   */
  escClose(event) {
    if (event.key === 'Escape') {
      this.close(event);
    }
  }

  /**
   * Closes the drawer from a click event.
   *
   * @param {Event} event
   *   The event from which the close command comes from.
   */
  close(event) {
    this.setState({
      open: false,
      // Focus to open button if keyboard synthetic click (e.g. enter key)
      focus: event.x + event.y === 0 && 'openButton',
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

    // Compensate for possible scrollbar layout jump
    this.docBody.style.paddingRight = open ? `${this.scrollbarWidth}px` : '';
  }

  /**
   * Closes the drawer if an element clicked was a link.
   *
   * @param {Event} event
   *   The object that represents a click or keyboard event within the drawer
   *   element.
   */
  navigateClose(event) {
    if (event.target.tagName === 'A') {
      this.close(event);
    }
  }

  /**
   * @inheritDoc
   */
  render({ menuTree, classes, hide }, { open }) {
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
          {Drupal.t('Open full menu')}
        </button>

        <button
          class="c-drawer-menu__close-btn"
          aria-controls="drawer-menu"
          aria-hidden={String(!open)}
          tabIndex={open ? 0 : -1}
          onClick={this.close}
        >
          {Drupal.t('Close full menu')}
        </button>

        <div
          id="drawer-menu"
          class={`c-drawer-menu__drawer ${open ? 'is-open' : ''}`}
          style={!open && { marginRight: this.scrollbarWidth * -1 }}
          onClick={this.navigateClose}
          onKeyPress={this.navigateClose}
          role="presentation"
        >
          <h2
            class="c-drawer-menu__title"
            ref={this.setFocusTargetTitle}
            tabIndex="-1"
          >
            {Drupal.t('Main menu')}
          </h2>
          <MainMenuMenu menuTree={menuTree} type="drawer" />
        </div>
      </div>
    );
  }
}
