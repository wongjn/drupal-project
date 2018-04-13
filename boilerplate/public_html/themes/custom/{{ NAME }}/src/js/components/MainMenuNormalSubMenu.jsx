/**
 * @file
 * Contains the main menu “normal” submenu list List preact component.
 */

import { h, Component } from 'preact';
import debounce from 'lodash/debounce';
import MainMenuNormalItem from './MainMenuNormalItem';

/**
 * A “normal” sub-menu list preact component.
 */
export default class MainMenuNormalSubMenu extends Component {
  /**
   * @inheritDoc
   */
  constructor(props) {
    super(props);

    this.state = { overlaps: false };
  }

  /**
   * @inheritDoc
   */
  componentDidMount() {
    this.resizeUpdater();

    this.resizeUpdater = debounce(this.resizeUpdater.bind(this), 500);
    window.addEventListener('resize', this.resizeUpdater);
  }

  /**
   * @inheritDoc
   */
  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeUpdater);
  }

  /**
   * Returns class HTML attribute for this menu.
   *
   * @return {string}
   *   The class attribute value.
   */
  getClasses() {
    const BASE_NAME = 'c-main-menu__sub-menu';
    const classesArray = [BASE_NAME];

    if (this.props.depth > 1) {
      classesArray.push(`${BASE_NAME}--deep`);
    }

    if (this.state.overlaps) {
      classesArray.push('is-moved');
    }

    return classesArray.join(' ');
  }

  /**
   * Updates whether this menu is overlapping the browser on the right side.
   */
  resizeUpdater() {
    // Remove position class temporarily
    this.base.classList.remove('is-moved');

    // Add timeout so that deeper menus get queried much later than parents.
    setTimeout(() => {
      const winWidth = window.innerWidth;
      const position = this.base.getBoundingClientRect();

      // Restore CSS class if neccesary
      if (this.state.overlaps) {
        this.base.classList.add('is-moved');
      }

      this.setState({ overlaps: winWidth < position.right });
    }, this.props.depth);
  }

  /**
   * @inheritDoc
   */
  renderItems() {
    const { menuTree, depth = 1 } = this.props;

    return menuTree.map(item => (
      <MainMenuNormalItem
        {...item}
        key={`${depth}:${item.index}`}
        depth={depth}
      />
    ));
  }

  /**
   * @inheritDoc
   */
  render() {
    return <ul class={this.getClasses()}>{this.renderItems()}</ul>;
  }
}
