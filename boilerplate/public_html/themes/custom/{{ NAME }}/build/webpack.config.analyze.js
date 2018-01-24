/**
 * @file
 * Webpack bundle analysis configuration based on production.
 */

const prodConfig = require('./webpack.config.prod');
const merge = require('webpack-merge');

module.exports = merge(prodConfig, {
  output: {
    chunkFilename: '[name].js',
  },
});
