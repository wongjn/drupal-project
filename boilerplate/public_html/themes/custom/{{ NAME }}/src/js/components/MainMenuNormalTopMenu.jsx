/**
 * @file
 * Contains the “normal” top-level menu list preact component.
 */

import { h, Component } from 'preact';
import debounce from 'lodash/debounce';
import MainMenuNormalTopItem from './MainMenuNormalTopItem';
import requestAnimationFramePromise from '../request-animation-frame-promise';
import ResizeObserverLoader from '../resize-observer-load';

/**
 * Main menu “normal” top-level menu list preact component.
 */
export default class MainMenuNormalTopMenu extends Component {
  /**
   * @inheritDoc
   */
  constructor(props) {
    super(props);

    this.state = {
      hideCutIndex: -1,
      height: 'auto',
    };

    this.items = [];
    this.setLiRef = this.setLiRef.bind(this);
  }

  /**
   * @inheritDoc
   */
  componentDidMount() {
    const debouncedlayoutUpdate = debounce(this.layoutUpdate.bind(this), 200);
    ResizeObserverLoader.then((Observer) => {
      this.observer = new Observer(debouncedlayoutUpdate);
      this.observer.observe(this.base);
    });
  }

  /**
   * @inheritDoc
   */
  componentWillUnmount() {
    this.observer.disconnect();
  }

  /**
   * Sets DOM element reference for child list item elements.
   *
   * @param {number} index
   *   The index of the item in the menu tree.
   * @param {HTMLLIElement} element
   *   The list item element for a child menu item.
   */
  setLiRef(index, element) {
    this.items[index] = element;
  }

  /**
   * Updates layout state.
   */
  layoutUpdate() {
    if (this.items.length > 0) {
      const { offsetTop } = this.items[0];
      const { height } = this.items[0].getBoundingClientRect();
      this.setState({ height: `${height}px` });

      if (this.items.length > 1) {
        this.updateHideCutIndex(offsetTop);
      }
    }
  }

  /**
   * Updates the point at which the children list items break to a new line.
   *
   * @param {number} offsetTop
   *   The first row's offset top.
   */
  async updateHideCutIndex(offsetTop) {
    if (this.items.length < 2) {
      return;
    }

    const hideCutIndex = this.items
      .slice(1)
      .reduce((foundIndex, item, index) => {
        // Already found line break index, skip
        if (foundIndex > -1) {
          return foundIndex;
        }

        return item.offsetTop === offsetTop ? foundIndex : index;
      }, -1);

    // If index has changed:
    if (this.state.hideCutIndex !== hideCutIndex) {
      this.setState({ hideCutIndex });

      const showDrawer = hideCutIndex !== -1;

      // Emit custom event
      const event = new CustomEvent(this.constructor.HIDE_CUT_INDEX_CHANGE, {
        bubbles: true,
        detail: { showDrawer },
      });
      this.base.dispatchEvent(event);

      // Double check for update cut again, in case showing the drawer has now
      // pushed an item to a new line
      if (showDrawer && this._showDrawer !== showDrawer) {
        await requestAnimationFramePromise();
        await requestAnimationFramePromise();
        await this.updateHideCutIndex(offsetTop);
        this.forceUpdate();
      }

      this._showDrawer = showDrawer;
    }
  }

  /**
   * @inheritDoc
   */
  render({ menuTree }, { hideCutIndex }) {
    const items = menuTree.map((item, index) => (
      <MainMenuNormalTopItem
        {...item}
        key={`0:${item.index}`}
        depth={0}
        hidden={hideCutIndex !== -1 && hideCutIndex < index}
        setLiRef={this.setLiRef}
      />
    ));

    const hideAll = hideCutIndex >= 1 || hideCutIndex === -1;
    const style = {
      visibility: hideAll ? '' : 'hidden',
      overflow: hideAll ? '' : 'hidden',
    };
    return <ul class="c-main-menu__top-menu" style={style}>{items}</ul>;
  }
}

/**
 * Event name for when there is a change in the hide cut index value
 *
 * @var {string}
 */
MainMenuNormalTopMenu.HIDE_CUT_INDEX_CHANGE = 'hidecutindexchange';
