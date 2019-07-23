/**
 * @file
 * Development Webpack configuration.
 */

const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.base');

module.exports = baseConfig.map(config =>
  merge(config, {
    entry:
      // HMR client relies on EventSource that is not supported for the legacy
      // bundle targets, hence only add it for modern config.
      config.name === 'modern'
        ? ['webpack-hot-middleware/client?reload=true']
        : [],
    devtool: 'eval-source-map',
    mode: 'development',
    plugins: [new webpack.HotModuleReplacementPlugin()],
  }),
);
