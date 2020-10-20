/**
 * @file
 * Bootstrap menu file.
 */

import attachLineBreak from './handlers/line-break';
import attachSubmenuEdge from './handlers/submenu-edge';
import attachDrawer from './handlers/drawer';
import attachParentTap from './handlers/parent-tap';
import attachHoverHide from './handlers/hover-hide';

const wrapper = document.querySelector('.js-main-menu');
const menu = wrapper && wrapper.querySelector('.c-main-menu__top-menu');

if (wrapper && menu) {
  // Apply functionality from sub-module files.
  const destroy = [
    attachLineBreak({ wrapper, menu }),
    attachSubmenuEdge({ wrapper, menu }),
    attachDrawer({ wrapper, menu }),
    attachParentTap({ wrapper, menu }),
    attachHoverHide({ wrapper, menu }),
  ];

  wrapper.classList.remove('is-menu-loading');

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => destroy.filter(Boolean).forEach(f => f()));
  }
}
