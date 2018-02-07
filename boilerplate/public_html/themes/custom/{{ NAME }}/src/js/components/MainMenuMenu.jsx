/**
 * Contains the Menu List preact component.
 */

import { h, Component } from 'preact';
import MenuItem from './MainMenuItem';

/**
 * Menu List preact component.
 */
export default class MainMenuMenu extends Component {
  /**
   * Returns classes attribute value for a menu list.
   *
   * @return {String}
   *   The class attribute value.
   */
  menuClasses() {
    return this[`${this.props.type || 'normal'}MenuClasses`]();
  }

  /**
   * Returns classes attribute value for a normal menu list.
   *
   * @param {Number} depth
   *   The depth of the menu.
   *
   * @return {String}
   *   The class attribute value.
   */
  normalMenuClasses() {
    const depth = this.props.depth || 0;
    if (depth === 0) {
      return 'c-main-menu__top-menu';
    }

    return `c-main-menu__sub-menu ${depth > 1 ? ' c-main-menu__sub-menu--deep' : ''}`;
  }

  /**
   * Returns classes attribute value for a drawer menu list.
   *
   * @return {String}
   *   The class attribute value.
   */
  drawerMenuClasses() {
    const depth = this.props.depth || 0;

    const baseName = 'c-drawer-menu__menu';
    return `${baseName} ${baseName}--${depth === 0 ? 'top' : 'sub'}`;
  }

  /**
   * @inheritDoc
   */
  render({ menuTree, type = 'normal', depth = 0, style }) {
    const items = menuTree.map(item => (
      <MenuItem
        {...item}
        key={`${depth}:${item.index}`}
        depth={depth}
        type={type}
      />
    ));

    return <ul class={this.menuClasses()} style={style}>{items}</ul>;
  }
}
