/**
 * @file
 * Production Webpack configuration.
 */

const baseConfig = require('./webpack.config.base');
const merge = require('webpack-merge');
const webpack = require('webpack');

module.exports = merge(baseConfig, {
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new webpack.optimize.UglifyJsPlugin({ sourceMap: true }),
  ],
});
