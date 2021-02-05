/**
 * @file
 * Sets Webpack public path dynamically per environment.
 */

import drupalSettings from 'drupalSettings';

// eslint-disable-next-line camelcase
__webpack_public_path__ = `${drupalSettings.{{ CAMEL }}.path}/dist/js/`;
