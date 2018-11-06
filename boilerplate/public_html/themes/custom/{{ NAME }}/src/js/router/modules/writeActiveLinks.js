/**
 * @file
 * Active links writer.
 */

export default (context, pathSettings = drupalSettings.path) => {
  if (typeof pathSettings.currentQuery === 'object') {
    // Remove queries for AJAX/router
    delete pathSettings.currentQuery._drupal_ajax;
    delete pathSettings.currentQuery._wrapper_format;
    delete pathSettings.currentQuery.ajax_page_state;

    if (Object.keys(pathSettings.currentQuery).length === 0) {
      delete pathSettings.currentQuery;
    }
  }

  const queryString = JSON.stringify(pathSettings.currentQuery);
  const querySelector = pathSettings.currentQuery
    ? `[data-drupal-link-query='${queryString}']`
    : ':not([data-drupal-link-query])';
  const originalSelectors = [
    `[data-drupal-link-system-path="${pathSettings.currentPath}"]`,
  ];
  let selectors;

  // If this is the front page, we have to check for the <front> path as
  // well.
  if (pathSettings.isFront) {
    originalSelectors.push('[data-drupal-link-system-path="<front>"]');
  }

  // Add language filtering.
  selectors = [
    // Links without any hreflang attributes (most of them).
    ...originalSelectors.map(selector => `${selector}:not([hreflang])`),
    // Links with hreflang equals to the current language.
    ...originalSelectors.map(
      selector => `${selector}[hreflang="${pathSettings.currentLanguage}"]`,
    ),
  ];

  // Add query string selector for pagers, exposed filters.
  selectors = selectors.map(current => current + querySelector);

  // Add classes to the DOM elements.
  Array.from(context.querySelectorAll(selectors.join(','))).forEach(element => {
    element.classList.add('is-active');
  });
};
