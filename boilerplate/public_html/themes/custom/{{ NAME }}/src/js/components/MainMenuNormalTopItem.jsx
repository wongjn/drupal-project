/**
 * @file
 * Contains the main menu “normal” top-level menu item preact component.
 */

import { h } from 'preact';
import MainMenuNormalItem from './MainMenuNormalItem';

/**
 * Returns a “normal” top-level menu item preact component.
 *
 * @param {object} props
 *   The props passed to this component.
 * @return {JSX}
 *   The menu component.
 */
export default function MainMenuNormalTopItem(props) {
  const liProps = {
    ref: props.setLiRef.bind(null, props.index),
    style: props.hidden ? { visibility: 'hidden' } : null,
    'aria-hidden': props.hidden ? 'true' : 'false',
  };

  return <MainMenuNormalItem {...props} liProps={liProps} />;
}
