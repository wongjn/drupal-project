/**
 * @file
 * Development Webpack configuration.
 */

const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.base');

module.exports = merge(baseConfig, {
  devtool: 'eval-source-map',
  mode: 'development',
});
