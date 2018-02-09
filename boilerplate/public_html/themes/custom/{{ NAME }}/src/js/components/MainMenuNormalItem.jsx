/**
 * @file
 * Contains the main menu “normal” menu item preact component.
 */

import { h, Component } from 'preact';
import MainMenuNormalSubMenu from './MainMenuNormalSubMenu';
import MainMenuItem from './MainMenuItem';
import ROUTED_EVENT from '../router-events';

/**
 * Main menu “normal” menu item preact component.
 */
export default class MainMenuNormalItem extends Component {
  /**
   * @inheritDoc
   */
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      touch: false,
    };

    this.indirectClose = this.indirectClose.bind(this);
    this.onRouted = this.onRouted.bind(this);
    this.onTouch = this.onTouch.bind(this);
  }

  /**
   * @inheritDoc
   */
  componentDidMount() {
    if (this.props.children.length > 0) {
      document.addEventListener('touchstart', this.indirectClose);
      document.addEventListener(ROUTED_EVENT, this.onRouted);
    }
  }

  /**
   * @inheritDoc
   */
  componentWillUnmount() {
    document.removeEventListener('touchstart', this.indirectClose);
    document.removeEventListener(ROUTED_EVENT, this.onRouted);
  }

  /**
   * On routing change.
   */
  onRouted() {
    if (this.state.open) {
      this.setState({ open: false });
    }
  }

  /**
   * Opens the submenu (if any) on touch.
   *
   * @param {TouchEvent} event
   *   The object representing the touch event.
   */
  onTouch(event) {
    if (this.props.children.length > 0 && !this.state.open) {
      event.preventDefault();

      this.setState({
        open: true,
        touch: true,
      });
    }
  }

  /**
   * Closes the submenu if a touch event happens outside of children.
   *
   * @param {TouchEvent} event
   *   The object representing the touch event.
   */
  indirectClose(event) {
    if (this.state.open && !this.base.contains(event.target)) {
      this.setState({ open: false });
    }
  }

  /**
   * @inheritDoc
   */
  render(props, { open }) {
    const liProps = Object.assign({}, props.liProps, {
      onTouchEnd: this.onTouch,
      class: open ? 'is-open' : '',
    });

    return (
      <MainMenuItem
        {...props}
        liProps={liProps}
        linkClassBase="c-main-menu__link"
        MenuComponent={MainMenuNormalSubMenu}
      />
    );
  }
}
