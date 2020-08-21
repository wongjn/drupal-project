/**
 * @file
 * Partial Webpack configuration.
 */

const path = require('path');
const { DefinePlugin } = require('webpack');
const { StatsWriterPlugin } = require('webpack-stats-plugin');
const svelteConfig = require('../svelte.config');

const getBase = name => ({
  name,
  context: path.resolve(__dirname, '../'),
  entry: {
    main: [
      './src/js/webpack-path.js',
      './src/js/main-menu/index.js',
      './src/js/in-view.js',
      ...(name === 'legacy' ? ['./src/js/svg-polyfill.js'] : []),
    ],
  },
  output: {
    filename: `[name].${name}.js`,
    chunkFilename: '[chunkhash].js',
    path: path.resolve(__dirname, '../dist/js'),
    publicPath: '/themes/custom/{{ NAME }}/dist/js/',
    ecmaVersion: name === 'legacy' ? 5 : 6,
  },
  optimization: { splitChunks: { chunks: 'all' } },
  module: {
    rules: [
      {
        test: /\.(m?js|svelte)$/,
        exclude: /node_modules\/(?!(rambda|svelte))/,
        use: {
          loader: 'babel-loader',
          options: { envName: name },
        },
      },
      {
        test: /\.svelte$/,
        exclude: /node_modules/,
        use: {
          loader: 'svelte-loader',
          options: { ...svelteConfig },
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
      svelte: path.resolve(__dirname, '../node_modules/svelte'),
    },
    mainFields: ['svelte', 'browser', 'module', 'main'],
  },
  plugins: [
    new DefinePlugin({ BUNDLE_TYPE: JSON.stringify(name) }),
    new StatsWriterPlugin({
      filename: `stats.${name}.json`,
      fields: ['entrypoints'],
    }),
  ],
});

module.exports = [getBase('legacy'), getBase('modern')];
