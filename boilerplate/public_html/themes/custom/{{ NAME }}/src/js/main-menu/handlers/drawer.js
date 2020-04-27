/**
 * @file
 * Full menu drawer menu.
 */

import { parse } from 'cookie';
import Drawer from './Drawer.svelte';

/**
 * 30 days in seconds.
 *
 * @constant
 */
const THIRTY_DAYS = 60 * 60 * 24 * 3;

/**
 * Cookie name for saving state across pages.
 *
 * @constant
 */
const COOKIE_NAME = '{{ NAME }}_menu_drawer';

/**
 * Creates a drawer-open button toggling function.
 *
 * @param {HTMLButtonElement} openButton
 *   The button element.
 *
 * @return {(op: 'show'|'hide') => void}
 *   Button toggling function.
 */
function openButtonToggler(openButton) {
  openButton.setAttribute('aria-expanded', 'false');
  const buttonWrapper = openButton.closest('.c-main-menu__drawer');

  return op => {
    buttonWrapper.style.display = op === 'show' ? '' : 'none';
  };
}

/**
 * Initializes this handler.
 *
 * @param {import('../').MenuWidget} menuWidget
 *   The menu orchestrator object.
 */
export default menuWidget => {
  const { wrapper, menu } = menuWidget;

  const openButton = wrapper.querySelector('.c-main-menu__open-btn');
  const openButtonToggle = openButtonToggler(openButton);
  // Set initial button state from cookie.
  openButtonToggle(COOKIE_NAME in parse(document.cookie) ? 'show' : 'hide');

  /** @type {import('svelte').SvelteComponent} */
  const drawer = new Drawer({
    target: wrapper.parentElement,
    props: {
      menu,
      open: false,
    },
  });

  const drawerOpen = () => drawer.$set({ open: true });
  const drawerClose = () => drawer.$set({ open: false });

  openButton.addEventListener('click', drawerOpen);

  drawer.$on('close', drawerClose);
  // Focus on microtask queue so that it is after svelte update.
  drawer.$on('outroend', () => queueMicrotask(() => openButton.focus()));

  menuWidget.on('lineBreak', ({ isBroken }) => {
    openButtonToggle(isBroken ? 'show' : 'hide');

    const cookieAge = isBroken ? THIRTY_DAYS : 0;
    document.cookie = `${COOKIE_NAME}=1;Max-Age=${cookieAge};path=/`;
  });

  menuWidget.on('drupalViewportOffsetChange', drawer.$set.bind(drawer));

  if (module.hot) {
    menuWidget.on('destroy', () => {
      openButton.removeEventListener('click', drawerOpen);
      drawer.$destroy();
    });
  }
};
