/**
 * @file
 * Full menu drawer menu.
 */

import Drupal from 'Drupal';
import Cookies from 'js-cookie';

/**
 * Cookie name for saving state across pages.
 *
 * @constant
 */
const COOKIE_NAME = '{{ NAME }}_menu_drawer';

/**
 * Drupal viewport offset change event listener name.
 */
const OFFSET_CHANGE_HOOK = 'drupalViewportOffsetChange.{{ CAMEL }}Drawer';

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
  openButtonToggle(Cookies.get(COOKIE_NAME) ? 'show' : 'hide');

  let drawerDestroy = false;

  const initDrawer = async () => {
    const finishLoading = setLoading(openButton);

    drawerDestroy = new Promise(resolve =>
      import('./Drawer.svelte').then(({ default: Drawer }) => {
        const drawer = new Drawer({
          target: wrapper.parentElement,
          props: {
            menu,
            open: true,
            baseUrl: drupalSettings.path.baseUrl,
            offsets: 'displace' in Drupal ? Drupal.displace.offsets : {},
          },
          intro: true,
        });

        const drawerOpen = () => drawer.$set({ open: true });
        const drawerClose = () => drawer.$set({ open: false });
        drawer.$on('close', drawerClose);

        // Focus on microtask queue so that it is after svelte update.
        drawer.$on('outroend', () => queueMicrotask(() => openButton.focus()));

        if ('jQuery' in window) {
          jQuery(document).on(OFFSET_CHANGE_HOOK, (_, offsets) =>
            drawer.$set({ offsets }),
          );
        }

        openButton.removeEventListener('click', initDrawer);
        openButton.addEventListener('click', drawerOpen);

        resolve(() => {
          openButton.removeEventListener('click', drawerOpen);
          drawer.$destroy();

          if ('jQuery' in window) {
            jQuery(document).off(OFFSET_CHANGE_HOOK);
          }
        });
      }),
    );

    await drawerDestroy;
    finishLoading();
  };

  const onLineBreak = ({ detail: isBroken }) => {
    openButtonToggle(isBroken ? 'show' : 'hide');

    if (isBroken) {
      Cookies.set(COOKIE_NAME, 1, { expires: 30, path: '/' });
    } else {
      Cookies.remove(COOKIE_NAME);
    }
  };

  openButton.addEventListener('click', initDrawer);
  wrapper.addEventListener('linebreak', onLineBreak);

  return () => {
    openButton.removeEventListener('click', initDrawer);
    wrapper.removeEventListener('linebreak', onLineBreak);
    if (drawerDestroy) {
      drawerDestroy.then(f => f());
    }
  };
};
