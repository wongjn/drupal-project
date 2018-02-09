/**
 * @file
 * Contains the main menu drawer menu item preact component.
 */

import { h, Component } from 'preact';
import MainMenuDrawerMenu from './MainMenuDrawerMenu';
import MainMenuItem from './MainMenuItem';

/**
 * Main menu drawer item preact component.
 */
export default class MainMenuDrawerItem extends Component {
  /**
   * @inheritDoc
   */
  shouldComponentUpdate({ nextActiveTrail }) {
    return this.props.activeTrail !== nextActiveTrail;
  }

  /**
   * @inheritDoc
   */
  render(props) {
    return (
      <MainMenuItem
        {...props}
        linkClassBase="c-drawer-menu__link"
        MenuComponent={MainMenuDrawerMenu}
      />
    );
  }
}
