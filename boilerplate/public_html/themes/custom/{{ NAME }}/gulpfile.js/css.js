/**
 * @file
 * CSS Gulp tasks.
 */

const { src, dest } = require('gulp');
const cached = require('gulp-cached');
const sassInheritance = require('gulp-sass-inheritance');
const sass = require('gulp-sass');
sass.compiler = require('sass');
const postcss = require('gulp-postcss');
const Fiber = require('fibers');

// SASS files glob.
const sassSrc = './src/sass/**/*.scss';

/**
 * Compiles SASS to CSS.
 *
 * @return {NodeJS.ReadWriteStream}
 *   The task stream of SASS/CSS files.
 */
function compileSass() {
  const base = 'src/sass';

  return src(sassSrc, { base, sourcemaps: true })
    .pipe(cached('sass'))
    .pipe(sassInheritance({ dir: base }))
    .pipe(sass({ fiber: Fiber }).on('error', sass.logError))
    .pipe(postcss())
    .pipe(dest('dist/css', { sourcemaps: '.' }));
}

exports.sassSrc = sassSrc;
exports.compileSass = compileSass;
