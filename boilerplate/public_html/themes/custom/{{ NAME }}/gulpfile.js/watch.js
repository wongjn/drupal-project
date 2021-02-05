/**
 * @file
 * Watching Gulp tasks.
 */

const { series, watch } = require('gulp');
const { create } = require('browser-sync');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const { sassSrc, compileSass } = require('./css');
const { compileStyleguide, kssConfig } = require('./styleguide');
const { iconSrc, compileIcons } = require('./icons');
const webpackConfig = require('../webpack.config');

// Browsersync instance for website development.
const website = create('website');
// Browsersync instance for viewing the styleguide.
const styleguide = create('styleguide');

/**
 * Streams compiled CSS to website Browsersync.
 *
 * @return {NodeJS.ReadWriteStream}
 *   The task stream.
 */
function streamSass() {
  return compileSass().pipe(website.stream());
}

/**
 * Reloads the styleguide Browsersync instance.
 *
 * @param {function} done
 *   The callback function to call once a reload has been called.
 */
function styleguideReload(done) {
  styleguide.reload();
  done();
}

/**
 * Initiates file watching and Browsersync instance servers.
 */
function watcher() {
  const config = webpackConfig();
  const webpackCompiler = webpack(config);

  website.init({
    proxy: '{{ UPPER }}_URL' in process.env
      ? process.env.{{ UPPER }}_URL
      : '{{ NAME_SNAKE }}.test',
    middleware: [
      webpackDevMiddleware(webpackCompiler, {
        writeToDisk: filePath => /\/assets\.\w+\.php$/.test(filePath),
      }),
      webpackHotMiddleware(webpackCompiler),
    ],
    ui: false,
    ghostMode: false,
    open: false,
  });

  styleguide.init({
    server: [kssConfig.destination, './'],
    port: 5000,
    ui: false,
    ghostMode: false,
    open: false,
  });

  watch(
    sassSrc,
    { ignoreInitial: false },
    series(streamSass, compileStyleguide, styleguideReload),
  );
  watch(iconSrc, { ignoreInitial: false }, compileIcons);
}

exports.watch = series(compileIcons, watcher);
