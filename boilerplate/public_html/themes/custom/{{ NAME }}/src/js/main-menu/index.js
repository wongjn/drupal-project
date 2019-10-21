/**
 * @file
 * Boostrap menu file.
 */

import debounce from 'lodash/debounce';
import resizeObserverLoader from '../lib/resize-observer-load';
import createOrchestrator from '../lib/orchestrator';
import attachLineBreak from './handlers/line-break';
import attachSubmenuEdge from './handlers/submenu-edge';
import attachDrawer from './handlers/drawer';
import attachParentTap from './handlers/parent-tap';

const wrapper = document.querySelector('.js-main-menu');
const menu = wrapper && wrapper.querySelector('.js-main-menu__menu');

if (wrapper && menu) {
  const menuWidget = createOrchestrator({ wrapper, menu });

  // Apply functionality from sub-module files.
  attachLineBreak(menuWidget);
  attachSubmenuEdge(menuWidget);
  attachDrawer(menuWidget);
  attachParentTap(menuWidget);

  wrapper.classList.remove('is-menu-loading');

  // Menu element resize observations.
  const observerPromise = resizeObserverLoader.then(
    ObserverClass =>
      new ObserverClass(debounce(() => menuWidget.fire('resize'), 300)),
  );
  observerPromise.then(observer => observer.observe(menu));

  if ('jQuery' in window) {
    jQuery(document).on('drupalViewportOffsetChange', (event, offsets) =>
      menuWidget.fire('drupalViewportOffsetChange', offsets),
    );
  }

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => {
      observerPromise.then(observer => observer.disconnect());
      menuWidget.fire('destroy');
    });
  }
}
