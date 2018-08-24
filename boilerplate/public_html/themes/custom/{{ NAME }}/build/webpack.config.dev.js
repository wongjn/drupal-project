/**
 * @file
 * Development Webpack configuration.
 */

const baseConfig = require('./webpack.config.base');
const merge = require('webpack-merge');

module.exports = merge(baseConfig, {
  devtool: 'eval-source-map',
  mode: 'development',
});
