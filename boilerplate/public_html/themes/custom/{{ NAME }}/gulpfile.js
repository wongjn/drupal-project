/**
 * @file
 * Gulp Tasks.
 */

/* eslint no-console: "off" */

const browserSync = require('browser-sync').create();
const del = require('del');
const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const webpack = require('webpack');
const webpackDevConfig = require('./build/webpack.config.dev');
const webpackProdConfig = require('./build/webpack.config.prod');

const config = {
  sass: {
    src: './src/sass/**/*.scss',
    base: 'src/sass',
  },
  icons: {
    src: './src/icons/*.svg',
  },
  images: {
    src: [
      './src/images/*.png',
      './src/images/*.gif',
      './src/images/*.jpg',
      './src/images/*.jpeg',
      './src/images/*.svg',
    ],
  },
  webpackStats: {
    modules: false,
    colors: true,
    excludeAssets: /\.map$/,
  },
};

gulp.task('sass', () => gulp.src(config.sass.src, { base: config.sass.base })
  .pipe(plugins.plumber())
  .pipe(plugins.sourcemaps.init())
  .pipe(plugins.cached('sass'))
  .pipe(plugins.sassInheritance({ dir: config.sass.base }))
  .pipe(plugins.sass().on('error', plugins.sass.logError))
  .pipe(plugins.postcss())
  .pipe(plugins.sourcemaps.write('../sourcemaps'))
  .pipe(gulp.dest('dist/css'))
  .pipe(browserSync.stream()));


gulp.task('icons', () => {
  del('dist/icons-*.svg');

  return gulp.src(config.icons.src)
    .pipe(plugins.plumber())
    .pipe(plugins.svgstore())
    .pipe(plugins.svgmin({
      plugins: [
        { cleanupIDs: false },
        { removeUnknownsAndDefaults: { defaultAttrs: false } },
      ],
    }))
    .pipe(plugins.rev())
    .pipe(gulp.dest('dist'));
});

gulp.task('icons:watch', ['icons'], (done) => {
  browserSync.reload();
  done();
});


gulp.task('images', () => gulp.src(config.images.src)
  .pipe(plugins.plumber())
  .pipe(plugins.cached('images'))
  .pipe(plugins.imagemin())
  .pipe(gulp.dest('dist/images')));


gulp.task('js', (cb) => {
  webpack(webpackProdConfig, (err, stats) => {
    if (err) return cb(err);
    console.log(stats.toString(config.webpackStats));
    cb();
  });
});


gulp.task('watch', ['sass', 'icons', 'images'], () => {
  browserSync.init({
    ghostMode: false,
    proxy: '127.0.0.1:8888',
    open: false,
  });

  webpack(webpackDevConfig).watch({}, (err, stats) => {
    if (err) return console.error(err);
    console.log(stats.toString(config.webpackStats));
    browserSync.reload();
  });

  plugins.watch(config.sass.src, () => gulp.start('sass'));
  plugins.watch(config.icons.src, () => gulp.start('icons:watch'));
  plugins.watch(config.images.src, () => gulp.start('images'));
});

gulp.task('build', ['sass', 'icons', 'images', 'js']);

gulp.task('clean', () => del(['dist']));
