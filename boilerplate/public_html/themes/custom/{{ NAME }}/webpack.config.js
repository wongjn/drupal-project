/**
 * @file
 * Webpack configuration.
 */

const path = require('path');
const { DefinePlugin, HotModuleReplacementPlugin } = require('webpack');
const { StatsWriterPlugin } = require('webpack-stats-plugin');
const svelteConfig = require('./svelte.config');

/**
 * Builds a Webpack configuration.
 *
 * @param {Object} options
 *   (optional) Options for the built configuration.
 * @param {boolean} [options.production=false]
 *   (optional) Set to `true` to set to production build configuration. Default
 *   `false`.
 *
 * @return {(name: 'modern'|'legacy') => import('webpack').Configuration}
 *   The config builder.
 */
const buildConfig = ({ production = false } = {}) => name => ({
  name,
  context: __dirname,
  entry: {
    main: [
      './src/js/webpack-path.js',
      './src/js/main-menu/index.js',
      './src/js/in-view.js',
      // All browsers that support ES6 modules also support external-use SVGs so
      // only need to polyfill for legacy environment.
      ...(name === 'legacy' ? ['./src/js/svg-polyfill.js'] : []),
      // HMR client relies on EventSource that is not supported for the legacy
      // bundle targets, hence only add it for modern config.
      ...(name === 'modern' && !production
        ? [`webpack-hot-middleware/client?reload=true&name=${name}`]
        : []),
    ],
  },
  output: {
    filename: `[name].${name}.js`,
    chunkFilename: '[chunkhash].js',
    path: path.resolve(__dirname, './dist/js'),
    publicPath: '/themes/custom/{{ NAME }}/dist/js/',
    environment: {
      arrowFunction: name === 'modern',
      bigIntLiteral: name === 'modern',
      const: name === 'modern',
      destructuring: name === 'modern',
      forOf: name === 'modern',
    },
  },
  devtool: production ? false : 'eval-source-map',
  mode: production ? 'production' : 'development',
  optimization: { splitChunks: { chunks: 'all' } },
  module: {
    rules: [
      {
        test: /\.(m?js|svelte)$/,
        exclude: /node_modules\/(?!svelte)/,
        use: {
          loader: 'babel-loader',
          options: { envName: name },
        },
        // Work-around for https://github.com/sveltejs/svelte/issues/4806.
        resolve: { fullySpecified: false },
      },
      {
        test: /\.svelte$/,
        exclude: /node_modules/,
        use: {
          loader: 'svelte-loader',
          options: {
            dev: !production,
            ...svelteConfig,
          },
        },
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
      },
    ],
  },
  resolve: {
    alias: {
      svelte: path.resolve(__dirname, './node_modules/svelte'),
    },
    mainFields: ['svelte', 'browser', 'module', 'main'],
  },
  externals: { 'js-cookie': 'Cookies' },
  plugins: [
    new DefinePlugin({ BUNDLE_TYPE: JSON.stringify(name) }),
    new StatsWriterPlugin({
      filename: `stats.${name}.json`,
      fields: ['entrypoints'],
    }),
    ...(!production ? [new HotModuleReplacementPlugin()] : []),
  ],
});

/**
 * Builds a Webpack configuration.
 *
 * @param {Object} env
 *   (optional) Options for the built configuration.
 * @param {boolean} [env.production=false]
 *   (optional) Set to `true` to set to production build configuration. Default
 *   `false`.
 *
 * @return {import('webpack').Configuration[]}
 *   A multi-compiler configuration.
 */
module.exports = env => ['legacy', 'modern'].map(buildConfig(env));
