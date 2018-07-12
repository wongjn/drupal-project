/**
 * @file
 * Contains the main menu drawer menu list preact component.
 */

import { h, Component } from 'preact';
import MainMenuDrawerItem from './MainMenuDrawerItem';

/**
 * Base CSS class name for menu lists.
 *
 * @var {string}
 */
const BASE_NAME = 'c-drawer-menu__menu';

/**
 * The main menu drawer menu list preact component.
 */
export default class MainMenuDrawerMenu extends Component {
  /**
   * @inheritDoc
   */
  shouldComponentUpdate({ rerender: nextRerender = true }) {
    return nextRerender;
  }

  /**
   * @inheritDoc
   */
  render({ menuTree, depth = 0 }) {
    const classes = `${BASE_NAME} ${BASE_NAME}--${depth === 0 ? 'top' : 'sub'}`;

    const items = menuTree.map(item => (
      <MainMenuDrawerItem
        {...item}
        key={`${depth}:${item.index}`}
        depth={depth}
      />
    ));

    return <ul class={classes}>{items}</ul>;
  }
}
