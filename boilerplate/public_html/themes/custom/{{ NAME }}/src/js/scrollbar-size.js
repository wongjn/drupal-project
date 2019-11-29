/**
 * @file
 * Lets CSS know the browser scrollbar size.
 */

import resizeObserverLoad from './lib/resize-observer-load';

resizeObserverLoad.then(Observer => {
  /** @type {ResizeObserver} */
  const resizeObserver = new Observer(([{ target }], observer) => {
    if (
      document.body.style.overflow === 'hidden' ||
      document.body.style.overflowX === 'hidden'
    ) {
      return;
    }
    
    const { innerHeight, innerWidth } = window;
    const { offsetWidth, offsetHeight } = target;

    const scrollbarSize = innerWidth - offsetWidth;
    document.body.style.setProperty('--scrollbar-width', `${scrollbarSize}px`);

    // If the body is scrollable but the scrollbar width is still zero, then we
    // can ascertain that with or without the scrollbar, --scrollbar-width will
    // always be zero and so no further resize observation needs to be done.
    if (innerHeight < offsetHeight && scrollbarSize === 0) {
      observer.disconnect();
    }
  });
  resizeObserver.observe(document.body);
});
