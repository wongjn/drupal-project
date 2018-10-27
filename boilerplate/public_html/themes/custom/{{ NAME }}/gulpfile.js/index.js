/**
 * @file
 * Gulp entry file.
 */

const del = require('del');
const { series, parallel } = require('gulp');
const { compileSass } = require('./css');
const { compileStyleguide } = require('./styleguide');
const { compileIcons } = require('./icons');
const { compileJS } = require('./js');
const { watch } = require('./watch');

/**
 * Cleans the compilation directory.
 *
 * @return {Promise}
 *   A promise that resolves once the directory has been deleted.
 */
function clean() {
  return del(['dist']);
}

// Builds assets for production.
exports.build = series(
  clean,
  parallel(series(compileSass, compileStyleguide), compileIcons, compileJS),
);

// Initiates asset compilation watching with live-reloading.
exports.watch = watch;
