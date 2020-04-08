/**
 * @file
 * Partial Webpack configuration.
 */

const path = require('path');
const { DefinePlugin } = require('webpack');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

const getBase = name => ({
  name,
  entry: [path.resolve(__dirname, '../src/js')],
  output: {
    filename: `${name}.js`,
    chunkFilename: '[chunkhash].js',
    path: path.resolve(__dirname, '../dist/js'),
    publicPath: '/themes/custom/{{ NAME }}/dist/js/',
  },
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
        use: 'svelte-loader',
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
      },
    ],
  },
  resolve: {
    alias: {
      Sass: path.resolve(__dirname, '../src/sass'),
      svelte: path.resolve('node_modules', 'svelte'),
    },
    extensions: ['.mjs', '.js', '.svelte'],
    mainFields: ['svelte', 'browser', 'module', 'main'],
  },
  plugins: [
    new LodashModuleReplacementPlugin(),
    new DefinePlugin({ BUNDLE_TYPE: JSON.stringify(name) }),
  ],
});

module.exports = [getBase('legacy'), getBase('modern')];
