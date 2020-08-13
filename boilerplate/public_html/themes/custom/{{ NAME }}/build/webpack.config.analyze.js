/**
 * @file
 * Webpack bundle analysis configuration based on production.
 */

const { merge } = require('webpack-merge');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const prodConfig = require('./webpack.config.prod');

module.exports = merge(prodConfig[1], {
  output: { chunkFilename: '[name].js' },
  plugins: [new BundleAnalyzerPlugin({ analyzerPort: 0 })],
});
