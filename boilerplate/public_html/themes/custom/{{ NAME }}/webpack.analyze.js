/**
 * @file
 * Webpack bundle analysis configuration based on modern production.
 */

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const webpackConfig = require('./webpack.config')({ production: true })[1];

webpackConfig.output.chunkFilename = '[name].js';
webpackConfig.plugins.push(new BundleAnalyzerPlugin({ analyzerPort: 0 }));

module.exports = webpackConfig;
