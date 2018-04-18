/**
 * @file
 * Main menu root component.
 */

import { h, Component } from 'preact';
import MainMenuNormalTopMenu from './MainMenuNormalTopMenu';
import MainMenuDrawer from './MainMenuDrawer';

/**
 * Converts the first character of a string to uppercase.
 *
 * @param {string} string
 *   The string to modify.
 * @return {string}
 *   The modified string.
 */
function ucFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Main menu preact component.
 */
export default class MainMenu extends Component {
  /**
   * @inheritDoc
   */
  constructor(props) {
    super(props);

    this.state = { hideDrawer: true };
    this.onHideChange = this.onHideChange.bind(this);
  }

  /**
   * Reacts on custom event for hidden element count change on top-level menu.
   *
   * @param {CustomEvent} event
   *   An object representing a change in the hidden number count of items.
   * @param {bool} event.detail.showDrawer
   *   True if the drawer should be shown.
   */
  onHideChange({ detail }) {
    this.setState({ hideDrawer: !detail.showDrawer });
  }

  /**
   * @inheritDoc
   */
  render({ menuTree }, { hideDrawer }) {
    const eventListen = {
      [`on${ucFirst(MainMenuNormalTopMenu.HIDE_CUT_INDEX_CHANGE)}`]: this.onHideChange,
    };

    return (
      <div class="c-main-menu" {...eventListen}>
        <MainMenuNormalTopMenu menuTree={menuTree} />
        <MainMenuDrawer
          classes="c-main-menu__drawer"
          menuTree={menuTree}
          hide={hideDrawer}
        />
      </div>
    );
  }
}
