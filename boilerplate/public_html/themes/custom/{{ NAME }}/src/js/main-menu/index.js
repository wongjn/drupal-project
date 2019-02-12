import debounce from 'lodash/debounce';
import resizeObserverLoader from '../lib/resize-observer-load';
import { ROUTED_EVENT } from '../router/events';
import LineBreak from './handlers/line-break';
import SubmenuEdge from './handlers/submenu-edge';
import Drawer from './handlers/drawer';
import ActiveTrail from './handlers/active-trail';
import ParentTap from './handlers/parent-tap';

const handlers = [LineBreak, SubmenuEdge, Drawer, ActiveTrail, ParentTap];

// Relevant elements.
const wrapper = document.querySelector('.js-main-menu');
const menu = wrapper.querySelector('.js-main-menu__menu');

// Construct the instances for each handler.
const instances = handlers.map(Handler => new Handler({ wrapper, menu }));
wrapper.classList.remove('is-menu-loading');

/**
 * Creates a plugin action function.
 *
 * @param {string} event
 *   The event name.
 * @return {function}
 *   The plugin action function, all arguments are supplied to plugin methods.
 */
function createEventMediator(event) {
  const methodName = `on${event.charAt(0).toUpperCase()}${event.slice(1)}`;
  return (...args) => {
    instances.forEach(instance => {
      if (typeof instance[methodName] === 'function') {
        instance[methodName](...args);
      }
    });
  };
}

// Menu element resize observations.
let observer = { disconnect() {} };
resizeObserverLoader.then(Observer => {
  observer = new Observer(debounce(createEventMediator('resize'), 500));
  observer.observe(menu);
});

// Front-end router event.
const routed = createEventMediator('routed');
const onRouted = ({ detail: path }) => routed(path);
document.addEventListener(ROUTED_EVENT, onRouted);

if (module.hot) {
  module.hot.accept();
  module.hot.dispose(() => {
    observer.disconnect();
    document.removeEventListener(ROUTED_EVENT, onRouted);
    createEventMediator('destroy')();
  });
}
