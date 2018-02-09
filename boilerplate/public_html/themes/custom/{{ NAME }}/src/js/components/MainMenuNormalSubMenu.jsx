/**
 * @file
 * Contains the main menu “normal” submenu list List preact component.
 */

import { h } from 'preact';
import MainMenuNormalItem from './MainMenuNormalItem';

/**
 * Base CSS class name for menu lists.
 *
 * @var {string}
 */
const BASE_NAME = 'c-main-menu__sub-menu';

/**
 * Returns a “normal” menu list preact component.
 *
 * @param {object} props
 *   The props passed to this component.
 * @return {JSX}
 *   The menu component.
 */
export default function MainMenuNormalSubMenu({ menuTree, depth = 1 }) {
  const items = menuTree.map(item => (
    <MainMenuNormalItem
      {...item}
      key={`${depth}:${item.index}`}
      depth={depth}
    />
  ));

  const classes = `${BASE_NAME}${depth > 1 ? ` ${BASE_NAME}--deep` : ''}`;

  return <ul class={classes}>{items}</ul>;
}
