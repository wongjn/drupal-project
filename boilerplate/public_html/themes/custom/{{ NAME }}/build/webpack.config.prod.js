/**
 * @file
 * Production Webpack configuration.
 */

const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.base');

module.exports = baseConfig.map(config =>
  merge(config, { mode: 'production' }),
);
