/**
 * @file
 * Contains utility scroll function.
 */

/**
 * Scrolls window to a point.
 *
 * @param {string|number} target
 *   The absolute Y distance or a CSS selector of an element to scroll to.
 */
export default function scrollTo(target) {
  if (typeof target === 'string') {
    const targetElement = document.querySelector(target);
    if (targetElement) {
      targetElement.scrollIntoView(true);
      targetElement.focus();
    }
  }
  // Absolute scrollY coordinate.
  else if (typeof target === 'number') {
    (document.getElementById('main-content') || document.body).focus();

    requestAnimationFrame(() => {
      window.scroll(window.scrollX, target);
    });
  }
}
