/**
 * @file
 * Production Webpack configuration.
 */

const baseConfig = require('./webpack.config.base');
const merge = require('webpack-merge');

module.exports = merge(baseConfig, { mode: 'production' });
