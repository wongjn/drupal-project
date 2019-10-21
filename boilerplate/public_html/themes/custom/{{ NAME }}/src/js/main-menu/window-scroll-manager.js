/**
 * @file
 * Contains the window scrolling manager object.
 */

/**
 * Manages window scrolling.
 */
export const windowScrollManager = {
  /**
   * Window ScrollX value before drawer is opened.
   *
   * @var {number}
   */
  x: 0,
  /**
   * Window ScrollY value before drawer is opened.
   *
   * @var {number}
   */
  y: 0,
  /**
   * The browser's scrollbar width.
   *
   * False to indicate that it has not been calculated.
   *
   * @var {bool|number}
   */
  barWidth: false,
  /**
   * Toggles scrolling.
   *
   * @param {bool} disable
   *   True to disable scrolling, otherwise false to enable.
   */
  scrollingToggle(disable) {
    if (disable) {
      this.x = window.scrollX;
      this.y = window.scrollY;
    }

    // Get scrollbar width.
    const barWidth = window.innerWidth - document.documentElement.offsetWidth;

    // Remove scrolling from body.
    document.body.style.overflow = disable ? 'hidden' : '';
    // Compensate for possible scrollbar layout jump.
    document.body.style.paddingRight = disable ? `${barWidth}px` : '';

    if (!disable) {
      window.scroll(this.x, this.y);
    }
  },
};

export default windowScrollManager;
