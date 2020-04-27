/**
 * @file
 * Development Webpack configuration.
 */

const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.base');

module.exports = baseConfig.map(config =>
  merge(config(false), {
    entry: {
      // HMR client relies on EventSource that is not supported for the legacy
      // bundle targets, hence only add it for modern config.
      main:
        config.name === 'modern'
          ? [`webpack-hot-middleware/client?reload=true&name=${config.name}`]
          : [],
    },
    devtool: 'eval-source-map',
    plugins: [new webpack.HotModuleReplacementPlugin()],
  }),
);
