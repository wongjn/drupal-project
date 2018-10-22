/**
 * @file
 * Development Webpack configuration.
 */

const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.base');

module.exports = merge(baseConfig, {
  entry: ['webpack-hot-middleware/client?reload=true'],
  devtool: 'eval-source-map',
  mode: 'development',
  plugins: [new webpack.HotModuleReplacementPlugin()],
});
