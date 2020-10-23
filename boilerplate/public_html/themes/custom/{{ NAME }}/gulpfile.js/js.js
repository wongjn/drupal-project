/**
 * @file
 * JS Gulp tasks.
 */

/* eslint no-console: "off" */

const webpack = require('webpack');
const webpackConfig = require('../webpack.config');

// Config for Webpack stats output.
const statsConfig = {
  cachedAssets: false,
  modules: false,
  colors: true,
  excludeAssets: /\.map$/,
  hash: false,
};

/**
 * Builds JS via Webpack for production.
 *
 * @param {function} done
 *   The callback function to call once compilation has been complete. If there
 *   was an error, it will be passed to the callback as the first argument.
 */
function compileJS(done) {
  webpack(webpackConfig({ production: true }), (err, stats) => {
    if (err) return done(err);
    console.log(stats.toString(statsConfig));
    done();
  });
}

exports.statsConfig = statsConfig;
exports.compileJS = compileJS;
