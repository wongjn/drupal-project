/**
 * @file
 * Contains a Swup-powered router for Drupal.
 */

import Swup from 'swup';
import request from './modules/request';
import writeActiveLinks from './modules/writeActiveLinks';
import { ROUTED_EVENT } from './events';

const adminPaths = [
  // Entity CRUD paths.
  '(node|taxonomy/term|user)/[0-9]+/(edit|revisions|delete)',
  // Entity add.
  '(node|block)/add',
  // Block editing.
  'block/([0-9])',
  // Admin section.
  'admin(/|$)',
  // User logout and plain 'user' path (cannot handle the redirection).
  'user/logout|user$',
];

// Regex to match common administrative paths.
const ADMIN_PATH = new RegExp(
  `^${drupalSettings.path.baseUrl}(${adminPaths.join('|')})`,
);

/**
 * Swup-powered router for Drupal.
 */
export default class Router extends Swup {
  /**
   * @inheritdoc
   */
  constructor(options) {
    super(options);

    // Override requesting method.
    this.getPage = request;

    this._handlers.willReplaceContent.push(this.detachBehaviors.bind(this));

    this.onContentReplaced = this.onContentReplaced.bind(this);
    document.addEventListener(ROUTED_EVENT, this.onContentReplaced);
  }

  /**
   * @inheritDoc
   */
  enable() {
    super.enable();

    this.options.writeActiveLinks = drupalSettings.{{ CAMEL }}.writeActiveLinks;
    if (this.options.writeActiveLinks) {
      const elements = Array.from(document.querySelectorAll('[data-swup]'));
      elements.forEach(writeActiveLinks);
    }
  }

  /**
   * @inheritdoc
   */
  destroy() {
    super.destroy();
    document.addEventListener(ROUTED_EVENT, this.onContentReplaced);
  }

  /**
   * @inheritdoc
   */
  linkClickHandler(event) {
    const { pathname, href } = event.delegateTarget;

    // Skip routing for known admin paths.
    if (ADMIN_PATH.test(pathname)) {
      window.location.href = href;
      return;
    }

    super.linkClickHandler(event);
  }

  /**
   * @inheritdoc
   */
  linkMouseoverHandler(event) {
    const { pathname } = event.delegateTarget;

    // Skip preloading for known admin paths.
    if (ADMIN_PATH.test(pathname)) {
      return;
    }

    super.linkMouseoverHandler(event);
  }

  /**
   * Detaches Drupal behaviors.
   */
  detachBehaviors() {
    Array.from(document.querySelectorAll(this.options.elements)).forEach(
      element => {
        Drupal.detachBehaviors(element, drupalSettings, 'unload');
      },
    );
  }

  /**
   * Manages content replacement.
   */
  async onContentReplaced() {
    // Drupal behavior management.
    Array.from(document.querySelectorAll(this.options.elements)).forEach(
      element => {
        if (this.options.writeActiveLinks) {
          writeActiveLinks(element, drupalSettings.path);
        }
        Drupal.attachBehaviors(element, drupalSettings);
      },
    );

    document.getElementById('main-content').focus();
  }
}
