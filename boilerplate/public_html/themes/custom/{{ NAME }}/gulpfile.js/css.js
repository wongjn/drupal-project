/**
 * @file
 * CSS Gulp tasks.
 */

const { src, dest } = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const cached = require('gulp-cached');
const sassInheritance = require('gulp-sass-inheritance');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');

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

  return src(sassSrc, { base })
    .pipe(sourcemaps.init())
    .pipe(cached('sass'))
    .pipe(sassInheritance({ dir: base }))
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss())
    .pipe(sourcemaps.write('.'))
    .pipe(dest('dist/css'));
}

exports.sassSrc = sassSrc;
exports.compileSass = compileSass;
