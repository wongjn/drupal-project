/**
 * @file
 * Production Webpack configuration.
 */

const baseConfig = require('./webpack.config.base');

module.exports = baseConfig.map(config => config(true));
