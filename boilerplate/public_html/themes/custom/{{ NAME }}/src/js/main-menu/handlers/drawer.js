/**
 * @file
 * Full menu drawer menu.
 */

import { parse } from 'cookie';

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
 * Sets the loading state.
 *
 * @param {HTMLButtonElement} button
 *   The opening button element.
 *
 * @return {() => void}
 *   Function to call after loading is complete.
 */
function setLoading(button) {
  const id = setTimeout(() => button.classList.add('is-loading'), 1000);

  return () => {
    clearTimeout(id);
    button.classList.remove('is-loading');
  };
}

/**
 * Initializes this handler.
 *
 * @param {Object} elements
 *   Remarkable DOM nodes for the main menu.
 * @param {HTMLElement} elements.wrapper
 *   The root element.
 * @param {HTMLUListElement} elements.menu
 *   Top level menu element.
 */
export default ({ wrapper, menu }) => {
  const openButton = wrapper.querySelector('.c-main-menu__open-btn');
  const openButtonToggle = openButtonToggler(openButton);
  // Set initial button state from cookie.
  openButtonToggle(COOKIE_NAME in parse(document.cookie) ? 'show' : 'hide');

  let drawerDestroy = false;

  const initDrawer = async () => {
    const finishLoading = setLoading(openButton);

    drawerDestroy = new Promise(resolve =>
      import('./Drawer.svelte').then(({ default: Drawer }) => {
        const drawer = new Drawer({
          target: wrapper.parentElement,
          props: { menu, open: true, baseUrl: drupalSettings.path.baseUrl },
          intro: true,
        });

        const drawerOpen = () => drawer.$set({ open: true });
        const drawerClose = () => drawer.$set({ open: false });
        const onOffsetChange = (_, offsets) => drawer.$set(offsets);
        drawer.$on('close', drawerClose);

        // Focus on microtask queue so that it is after svelte update.
        drawer.$on('outroend', () => queueMicrotask(() => openButton.focus()));

        if ('jQuery' in window) {
          jQuery(document).on('drupalViewportOffsetChange', onOffsetChange);
        }

        openButton.removeEventListener('click', initDrawer);
        openButton.addEventListener('click', drawerOpen);

        resolve(() => {
          openButton.removeEventListener('click', drawerOpen);
          drawer.$destroy();

          if ('jQuery' in window) {
            jQuery(document).off('drupalViewportOffsetChange', onOffsetChange);
          }
        });
      }),
    );

    await drawerDestroy;
    finishLoading();
  };

  const onLineBreak = ({ detail: isBroken }) => {
    openButtonToggle(isBroken ? 'show' : 'hide');

    const cookieAge = isBroken ? THIRTY_DAYS : 0;
    document.cookie = `${COOKIE_NAME}=1;Max-Age=${cookieAge};path=/`;
  };

  openButton.addEventListener('click', initDrawer);
  wrapper.addEventListener('linebreak', onLineBreak);

  return () => {
    openButton.removeEventListener('click', initDrawer);
    wrapper.removeEventListener('linebreak', onLineBreak);
    drawerDestroy.then(f => f());
  };
};
