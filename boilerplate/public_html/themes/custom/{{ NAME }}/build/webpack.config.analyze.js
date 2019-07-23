/**
 * @file
 * Webpack bundle analysis configuration based on production.
 */

const merge = require('webpack-merge');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const prodConfig = require('./webpack.config.prod');

module.exports = prodConfig.map(config =>
  merge(config, {
    output: { chunkFilename: '[name].js' },
    plugins: [new BundleAnalyzerPlugin({ analyzerPort: 0 })],
  }),
);
