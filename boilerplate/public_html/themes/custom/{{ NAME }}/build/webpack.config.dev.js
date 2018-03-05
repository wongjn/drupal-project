/**
 * @file
 * Development Webpack configuration.
 */

const baseConfig = require('./webpack.config.base');
const merge = require('webpack-merge');

module.exports = merge(baseConfig, {
  entry: ['preact/debug'],
  devtool: 'eval-source-map',
  mode: 'development',
  resolve: {
    alias: {
      preact$: 'preact/dist/preact.js',
    },
  },
});
