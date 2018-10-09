/**
 * @file
 * Global config for PostCSS.
 */

const CSSNano = require('cssnano');

module.exports = {
  plugins: [CSSNano()],
};
