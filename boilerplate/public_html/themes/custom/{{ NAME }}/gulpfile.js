/**
 * @file
 * Gulp Tasks.
 */

/* eslint no-console: "off" */

const browserSync = require('browser-sync');
const del = require('del');
const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackDevConfig = require('./build/webpack.config.dev');
const webpackProdConfig = require('./build/webpack.config.prod');
const kss = require('./build/kss');

const browserSyncDrupal = browserSync.create('drupal');
const browserSyncStyleguide = browserSync.create('styleguide');

const config = {
  sass: {
    src: './src/sass/**/*.scss',
    base: 'src/sass',
    nodeSass: {},
  },
  styleguide: {
    destination: './styleguide',
    homepage: './README.md',
    title: '{{ LABEL }} Styleguide',
  },
  icons: {
    src: './src/icons/*.svg',
  },
  webpackStats: {
    cachedAssets: false,
    modules: false,
    colors: true,
    excludeAssets: /\.map$/,
    hash: false,
  },
};
config.styleguide.source = config.sass.base;

gulp.task('sass', () =>
  gulp
    .src(config.sass.src, { base: config.sass.base })
    .pipe(plugins.plumber())
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.cached('sass'))
    .pipe(plugins.sassInheritance({ dir: config.sass.base }))
    .pipe(plugins.sass(config.sass.nodeSass).on('error', plugins.sass.logError))
    .pipe(plugins.postcss())
    .pipe(plugins.sourcemaps.write('../sourcemaps'))
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSyncDrupal.stream()),
);

gulp.task('styleguide', ['sass'], async () => {
  await kss(config.styleguide);
  browserSyncStyleguide.reload();
});

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

gulp.task('icons:watch', ['icons'], done => {
  browserSyncDrupal.reload();
  done();
});

gulp.task('js', cb => {
  webpack(webpackProdConfig, (err, stats) => {
    if (err) return cb(err);
    console.log(stats.toString(config.webpackStats));
    cb();
  });
});

gulp.task('watch', ['sass', 'icons', 'styleguide'], () => {
  const webpackCompiler = webpack(webpackDevConfig);
  
  browserSyncDrupal.init({
    ghostMode: false,
    proxy: '{{ NAME }}.local',
    open: false,
    middleware: [
      webpackDevMiddleware(webpackCompiler, {
        stats: config.webpackStats,
        publicPath: webpackDevConfig.output.publicPath,
      }),
      webpackHotMiddleware(webpackCompiler),
    ],
  });

  browserSyncStyleguide.init({
    ui: false,
    server: {
      server: [config.styleguide.destination, './'],
    },
    port: 5000,
    ghostMode: false,
    open: false,
  });

  plugins.watch(
    config.sass.src,
    () => gulp.start('sass') && gulp.start('styleguide'),
  );
  plugins.watch(config.icons.src, () => gulp.start('icons:watch'));
});

gulp.task('build', ['sass', 'icons', 'js', 'styleguide']);

gulp.task('clean', () => del(['dist']));
