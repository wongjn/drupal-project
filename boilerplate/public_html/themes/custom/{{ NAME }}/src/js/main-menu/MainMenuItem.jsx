/**
 * @file
 * Contains the main menu base menu item preact component.
 */

import { h, Component } from 'preact';

/**
 * Main menu base item preact component.
 */
export default class MainMenuItem extends Component {
  /**
   * Returns classes attribute value to add to an anchor element.
   *
   * @return {String}
   *   The class attribute value.
   */
  linkClasses() {
    if (typeof this.props.linkClassBase !== 'string') {
      return '';
    }

    const baseName = this.props.linkClassBase;
    let classes = `${baseName} ${baseName}--${this.props.depth === 0 ? 'top' : 'sub'}`;

    if (this.props.activeTrail) {
      classes += ' is-active-trail';
    }

    return classes;
  }

  /**
   * @inheritDoc
   */
  render({ url, title, depth, children = [], MenuComponent, liProps = {}, target }) {
    const subMenu = children.length > 0 &&
      <MenuComponent menuTree={children} depth={depth + 1} />;

    return (
      <li {...liProps}>
        <a href={url} class={this.linkClasses()} target={target}>{title}</a>
        {subMenu}
      </li>
    );
  }
}
