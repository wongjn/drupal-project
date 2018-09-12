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
  webpackStats: {
    modules: false,
    colors: true,
    excludeAssets: /\.map$/,
  },
};

gulp.task('sass', () =>
  gulp
    .src(config.sass.src, { base: config.sass.base })
    .pipe(plugins.plumber())
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.cached('sass'))
    .pipe(plugins.sassInheritance({ dir: config.sass.base }))
    .pipe(plugins.sass().on('error', plugins.sass.logError))
    .pipe(plugins.postcss())
    .pipe(plugins.sourcemaps.write('../sourcemaps'))
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream()),
);

gulp.task('icons', () =>
  gulp
    .src(config.icons.src)
    .pipe(plugins.plumber())
    .pipe(plugins.svgstore())
    .pipe(
      plugins.svgmin({
        plugins: [
          { cleanupIDs: false },
          { removeUnknownsAndDefaults: { defaultAttrs: false } },
        ],
      }),
    )
    .pipe(gulp.dest('dist')),
);

gulp.task('icons:watch', ['icons'], (done) => {
  browserSync.reload();
  done();
});

gulp.task('js', cb => {
  webpack(webpackProdConfig, (err, stats) => {
    if (err) return cb(err);
    console.log(stats.toString(config.webpackStats));
    cb();
  });
});

gulp.task('watch', ['sass', 'icons'], () => {
  browserSync.init({
    ghostMode: false,
    proxy: '{{ NAME }}.local',
    open: false,
  });

  webpack(webpackDevConfig).watch({}, (err, stats) => {
    if (err) return console.error(err);
    console.log(stats.toString(config.webpackStats));
    browserSync.reload();
  });

  plugins.watch(config.sass.src, () => gulp.start('sass'));
  plugins.watch(config.icons.src, () => gulp.start('icons:watch'));
});

gulp.task('build', ['sass', 'icons', 'js']);

gulp.task('clean', () => del(['dist']));
