/**
 * @file
 * Full menu drawer menu.
 */

import { parse } from 'cookie';
import { templateParse } from '../../lib/dom';
import { windowScrollManager } from '../window-scroll-manager';

/**
 * HTML ID for the drawer menu element.
 *
 * @constant
 */
const DRAWER_HTML_ID = 'drawer-menu';

/**
 * 30 days in seconds.
 *
 * @constant
 */
const THIRTY_DAYS = 60 * 60 * 24 * 30;

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
 * Creates a `focusin` event handler to trap focus within the drawer.
 *
 * @param {HTMLElement} drawer
 *   The drawer element.
 *
 * @return {(event: FocusEvent) => void}
 *   A global-level event -listener for the `focusin` event to trap focus within
 *   the given element.
 */
function focusTrapper(drawer) {
  const focusables = Array.from(
    drawer.querySelectorAll('button,a,[tabindex="-1"],[tabindex="0"]'),
  );
  const first = focusables.shift();
  const last = focusables.pop();

  return ({ target, relatedTarget }) => {
    if (!relatedTarget || drawer.contains(target)) return;
    (relatedTarget === last ? first : last).focus();
  };
}

/**
 * Notable elements of the drawer.
 *
 * @typedef {object} drawerToggleElements
 *
 * @prop {HTMLElement} drawer
 *   The drawer element.
 * @prop {HTMLButtonElement} openButton
 *   Button that opens the drawer element.
 */

/**
 * Creates an drawer-toggling function.
 *
 * @param {drawerToggleElements} elements
 *   Notable elements of the drawer.
 *
 * @return {(op: 'open'|'close') => void}
 *   Drawer toggling function.
 */
function drawerToggler({ drawer, openButton }) {
  const topMenu = drawer.querySelector('.c-drawer-menu__top-menu');
  const title = drawer.querySelector('.c-drawer-menu__title');

  // Event listeners.
  let escClose = () => { };
  const focusTrap = focusTrapper(drawer);

  const toggle = op => {
    drawer.classList[op === 'open' ? 'add' : 'remove']('is-open');
    openButton.setAttribute('aria-expanded', String(op === 'open'));

    topMenu.scrollTop = 0;

    // On open, focus drawer title.
    if (op === 'open') title.focus();

    const eventOp = `${op === 'open' ? 'add' : 'remove'}EventListener`;
    document[eventOp]('keydown', escClose);
    document[eventOp]('focusin', focusTrap);

    // On close, focus open button.
    if (op === 'close') openButton.focus();

    windowScrollManager.scrollingToggle(op === 'open');
  };

  escClose = ({ key }) => key === 'Escape' && toggle('close');

  return toggle;
}

/**
 * Creates an event listener to close the drawer when navigating to a new page.
 *
 * @param {() => void} close
 *   Callback to close the menu drawer.
 *
 * @return {EventListener}
 *   Event listener that will close the drawer when navigating to a new page.
 */
const navigateCloser = close => ({ target }) =>
  target.tagName === 'A' && close();

/**
 * Builds the drawer DOM.
 *
 * @param {HTMLUListElement} menu
 *   The menu list from the main DOM.
 *
 * @return {Object<string,HTMLElement>}
 *   Object of remarkable built DOM elements.
 */
function buildDrawer(menu) {
  const clonedMenu = menu.outerHTML
    // Replace main menu classes with drawer classes.
    .replace(/\bc-main-menu/g, 'c-drawer-menu')
    // Remove any attributes from line break handler.
    .replace(/\b(aria-hidden|style)=".*?"/g, '');

  const [drawer, refs] = templateParse(`
    <div id="${DRAWER_HTML_ID}" class="c-drawer-menu">
      <h2 class="c-drawer-menu__title" tabIndex="-1">
        ${Drupal.t('Full Menu')}
      </h2>
      <button
        ref="closeButton"
        tabIndex="0"
        aria-controls="${DRAWER_HTML_ID}"
        class="c-drawer-menu__close-btn"
      >
        ${Drupal.t('Close full menu')}
      </button>
      ${clonedMenu}
    </div>`);

  return { drawer, ...refs };
}

/**
 * Drawer managing object via methods.
 *
 * @typedef {Object} Manager
 *
 * @prop {(data: { isBroken: boolean }) => void} lineBreak
 *   Act on top-level menu item line-breaks.
 * @prop {() => void} destroy
 *   Destroys the object, remove event listeners and observers.
 */

/**
 * Constructs a drawer manager object.
 *
 * @param {import('../').MenuWidget} menuWidget
 *   Orchestrator object for managing the menu.
 *
 * @return {Manager}
 *   The manager object.
 */
function initializeManager({ wrapper, menu }) {
  const openButton = wrapper.querySelector('.c-main-menu__open-btn');
  const { drawer, closeButton } = buildDrawer(menu);
  wrapper.insertAdjacentElement('afterend', drawer);

  const openButtonToggle = openButtonToggler(openButton);
  const drawerToggle = drawerToggler({ drawer, openButton });
  const drawerOpen = drawerToggle.bind(null, 'open');
  const drawerClose = drawerToggle.bind(null, 'close');
  const navigateClose = navigateCloser(drawerClose);

  // Set initial button state from cookie.
  openButtonToggle(COOKIE_NAME in parse(document.cookie) ? 'show' : 'hide');

  openButton.addEventListener('click', drawerOpen);
  closeButton.addEventListener('click', drawerClose);
  drawer.addEventListener('click', navigateClose);

  return {
    lineBreak({ isBroken }) {
      openButtonToggle(isBroken ? 'show' : 'hide');

      const cookieAge = isBroken ? THIRTY_DAYS : 0;
      document.cookie = `${COOKIE_NAME}=1;Max-Age=${cookieAge};path=/`;
    },
    offsetChange(offsets) {
      Array.from(Object.entries(offsets)).forEach(([side, value]) => {
        drawer.style[side] = `${value}px`;
      });
    },
    destroy() {
      drawerClose();
      openButton.removeEventListener('click', drawerOpen);
      closeButton.removeEventListener('click', drawerClose);
      drawer.removeEventListener('click', navigateClose);
      drawer.remove();
    },
  };
}

/** @type {Manager} */
let drawerManager;

/**
 * Initializes this handler.
 * 
 * @param {import('../').MenuWidget} menuWidget
 *   The menu orchestrator object.
 */
export default menuWidget => {
  drawerManager = drawerManager || initializeManager(menuWidget);

  menuWidget.on('lineBreak', drawerManager.lineBreak);
  menuWidget.on('drupalViewportOffsetChange', drawerManager.offsetChange);
  if (module.hot) {
    menuWidget.on('destroy', drawerManager.destroy);
    drawerManager = undefined;
  }
};
