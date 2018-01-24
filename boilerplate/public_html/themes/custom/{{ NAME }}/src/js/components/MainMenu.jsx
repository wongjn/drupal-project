/**
 * @file
 * Main menu root component.
 */

import { h, Component } from 'preact';
import throttle from 'lodash/throttle';
import MainMenuMenu from './MainMenuMenu';
import MainMenuDrawer from './MainMenuDrawer';

/**
 * Main menu preact component.
 */
export default class MainMenu extends Component {

  /**
   * @inheritDoc
   */
  constructor(props) {
    super(props);

    this.state = {
      shownCount: 0,
    };

    this.itemElements = [];
    this.setItemRef = this.setItemRef.bind(this);
  }

  /**
   * @inheritDoc
   */
  componentDidMount() {
    this.resizeWatch();
    this.resizeWatch = throttle(this.resizeWatch.bind(this), 200);
    window.addEventListener('resize', this.resizeWatch);
  }

  /**
   * @inheritDoc
   */
  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeWatch);
  }

  /**
   * Sets DOM element reference for a menu item element.
   *
   * @param {HTMLElement} element
   *   The element to reference to.
   * @param {number} index
   *   The index number of the navigation item within this list.
   */
  setItemRef(element, index) {
    this.itemElements[index] = element;
  }

  /**
   * Maintains single line top-level layout of the menu items.
   */
  resizeWatch() {
    const first = this.itemElements[0];

    let shownCount = this.itemElements
      .slice(1)
      .reduce((count, element) => {
        if (element.offsetTop > first.offsetTop) {
          return count;
        }

        return count + 1;
      }, 1);

    if (shownCount === this.itemElements.length) {
      shownCount = 999;
    }

    this.setState({
      shownCount,
    });
  }

  /**
   * @inheritDoc
   */
  render({ menuTree }, { shownCount }) {
    const topMenuTree = menuTree.map((item, i) => Object.assign({}, item, {
      itemRef: this.setItemRef,
      hidden: i >= shownCount,
    }));

    const style = this.itemElements.length > 0 && {
      height: `${this.itemElements[0].offsetHeight}px`,
      visibility: shownCount < 2 ? 'hidden' : '',
      overflow: shownCount < 2 ? 'hidden' : '',
    };

    return (
      <div className="c-main-menu">
        <MainMenuMenu menuTree={topMenuTree} style={style} />
        <MainMenuDrawer
          classes="c-main-menu__drawer"
          menuTree={menuTree}
          hide={shownCount > this.itemElements.length}
        />
      </div>
    );
  }
}
