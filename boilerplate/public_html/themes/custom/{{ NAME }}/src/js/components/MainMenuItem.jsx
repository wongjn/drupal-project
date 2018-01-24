

/**
 * @file
 * Contains the main menu item preact component.
 */

import { h, Component } from 'preact';
import Menu from './MainMenuMenu';

/**
 * Main menu item preact component.
 */
export default class MainMenuItem extends Component {

  /**
   * @inheritDoc
   */
  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };

    this.indirectClose = this.indirectClose.bind(this);
    this.onTouch = this.onTouch.bind(this);
    this.onRef = this.onRef.bind(this);
  }

  /**
   * @inheritDoc
   */
  componentDidMount() {
    if (this.props.children.length > 0) {
      document.addEventListener('touchstart', this.indirectClose);
    }
  }

  /**
   * @inheritDoc
   */
  componentWillUnmount() {
    document.removeEventListener('touchstart', this.indirectClose);
  }

  /**
   * Preact ref call.
   *
   * @param {Node} element
   *   The element to reference.
   */
  onRef(element) {
    this.ele = element;

    if (typeof this.props.itemRef === 'function') {
      this.props.itemRef(element, this.props.index);
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
      });
    }
  }

  /**
   * Closes the submenu (if any and open) on elsewhere touch.
   *
   * @param {TouchEvent} event
   *   The object representing the touch event.
   */
  indirectClose(event) {
    if (this.state.open && !this.isChild(event.srcElement)) {
      this.setState({
        open: false,
      });
    }
  }

  /**
   * Queries whether an element is a child of this component's root.
   *
   * @param {Node} element
   *   The element to query about.
   *
   * @return {bool}
   *   Returns true if the given element is a child.
   */
  isChild(element) {
    if (element === null) {
      return false;
    }

    if (element === this.ele) {
      return true;
    }

    return this.isChild(element.parentElement);
  }

  /**
   * Returns classes attribute value to add to an anchor element.
   *
   * @return {String}
   *   The class attribute value.
   */
  linkClasses() {
    const baseName = `${
      this.props.type === 'normal' ?
        'c-main-menu' :
        'c-drawer-menu'
    }__link`;

    let classes = `${baseName} ${baseName}--${this.props.depth === 0 ? 'top' : 'sub'}`;

    if (this.props.activeTrail) {
      classes += ' is-active-trail';
    }

    return classes;
  }

  /**
   * @inheritDoc
   */
  render({ url, title, depth, type, hidden, children = [] }, { open }) {
    const subMenu = children.length > 0 &&
      <Menu menuTree={children} depth={depth + 1} type={type} />;

    return (
      <li
        onTouchEnd={this.onTouch}
        className={open ? 'is-open' : ''}
        style={hidden ? 'visibility: hidden' : ''}
        ref={this.onRef}
      >
        <a href={url} className={this.linkClasses()}>{title}</a>
        {subMenu}
      </li>
    );
  }
}
