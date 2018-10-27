/**
 * @file
 * SVG icon Gulp tasks.
 */

const { src, dest } = require('gulp');
const svgstore = require('gulp-svgstore');
const svgmin = require('gulp-svgmin');

// SVG icon files glob.
const iconSrc = './src/icons/*.svg';

// SVGO config.
const svgoConfig = {
  plugins: [
    { cleanupIDs: false },
    { removeUnknownsAndDefaults: { defaultAttrs: false } },
  ],
};

/**
 * Compiles separate icon SVGs into symbol a spritesheet.
 *
 * @return {NodeJS.ReadWriteStream}
 *   The task stream of icon files.
 */
function compileIcons() {
  return src(iconSrc)
    .pipe(svgstore())
    .pipe(svgmin(svgoConfig))
    .pipe(dest('dist'));
}

exports.iconSrc = iconSrc;
exports.compileIcons = compileIcons;
