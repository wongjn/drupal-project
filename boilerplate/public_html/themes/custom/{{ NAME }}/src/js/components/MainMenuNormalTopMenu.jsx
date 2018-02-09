/**
 * @file
 * Contains the “normal” top-level menu list preact component.
 */

import { h, Component } from 'preact';
import debounce from 'lodash/debounce';
import MainMenuNormalTopItem from './MainMenuNormalTopItem';

/**
 * Main menu “normal” top-level menu list preact component.
 */
export default class MainMenuNormalTopMenu extends Component {
  /**
   * @inheritDoc
   */
  constructor(props) {
    super(props);

    this.state = { hideCutIndex: -1 };

    this.items = [];
    this.setLiRef = this.setLiRef.bind(this);
    this.updateHideCutIndex = this.updateHideCutIndex.bind(this);
  }

  /**
   * @inheritDoc
   */
  componentDidMount() {
    this.updateHideCutIndex();
    this.debouncedUpdateHideCutIndex = debounce(this.updateHideCutIndex, 200);
    window.addEventListener('resize', this.debouncedUpdateHideCutIndex);
  }

  /**
   * @inheritDoc
   */
  componentWillUnmount() {
    window.removeEventListener('resize', this.debouncedUpdateHideCutIndex);
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
   * Updates the point at which the children list items break to a new line.
   */
  updateHideCutIndex() {
    if (!this.items) {
      return;
    }

    const first = this.items[0].offsetTop;
    const hideCutIndex = this.items
      .slice(1)
      .reduce((foundIndex, item, index) => {
        // Already found line break index, skip
        if (foundIndex > -1) {
          return foundIndex;
        }

        return item.offsetTop === first ? foundIndex : index;
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
        this._showDrawer = showDrawer;
        requestAnimationFrame(this.updateHideCutIndex);
      }
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

    const style = hideCutIndex >= 1 || hideCutIndex === -1 ? '' : { visibility: 'hidden' };
    return <ul class="c-main-menu__top-menu" style={style}>{items}</ul>;
  }
}

/**
 * Event name for when there is a change in the hide cut index value
 *
 * @var {string}
 */
MainMenuNormalTopMenu.HIDE_CUT_INDEX_CHANGE = 'hidecutindexchange';
