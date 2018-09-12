/**
 * @file
 * Webpack bundle analysis configuration based on production.
 */

const merge = require('webpack-merge');
const prodConfig = require('./webpack.config.prod');

module.exports = merge(prodConfig, {
  output: {
    chunkFilename: '[name].js',
  },
});
