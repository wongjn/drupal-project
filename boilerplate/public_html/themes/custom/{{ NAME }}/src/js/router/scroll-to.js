/**
 * @file
 * Contains utility scroll function.
 */

/**
 * Scrolls window to a point.
 *
 * @param {string|number} target
 *   The absolute Y distance or a CSS selector of an element to scroll to.
 * @param {bool} [smooth=false]
 *   Set to true to smooth scroll to the target.
 */
export default function scrollTo(target, smooth = false) {
  const behavior = smooth ? 'smooth' : 'auto';
  if (typeof target === 'string') {
    const targetElement = document.querySelector(target);
    if (targetElement) {
      targetElement.focus({ preventScroll: smooth });

      const scrollOptions = {
        behavior,
        block: 'start',
        inline: 'nearest',
      };
      targetElement.scrollIntoView(scrollOptions);
    }
  }
  // Absolute scrollY coordinate.
  else if (typeof target === 'number') {
    (document.getElementById('main-content') || document.body).focus();

    requestAnimationFrame(() => {
      window.scroll({
        left: window.scrollX,
        top: target,
        behavior,
      });
    });
  }
}
