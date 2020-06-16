/**
 * @file
 * Global config for PostCSS.
 */

const CSSNano = require('cssnano');

module.exports = {
  // mergeLonghand transformation collapses min()/max() declarations with
  // padding, margin and border properties. This is undesired as we need to
  // supply fallbacks.
  plugins: [CSSNano({ preset: ['default', { mergeLonghand: false }] })],
};
