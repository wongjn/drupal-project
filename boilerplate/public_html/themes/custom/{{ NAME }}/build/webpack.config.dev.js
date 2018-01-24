/**
 * @file
 * Development Webpack configuration.
 */

const baseConfig = require('./webpack.config.base');
const webpack = require('webpack');
const merge = require('webpack-merge');

module.exports = merge(baseConfig, {
  entry: ['preact/debug'],
  devtool: 'eval-source-map',
  resolve: {
    alias: {
      preact$: 'preact/dist/preact.js',
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
  ],
});
