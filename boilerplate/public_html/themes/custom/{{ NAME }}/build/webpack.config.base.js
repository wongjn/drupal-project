/**
 * @file
 * Partial Webpack configuration.
 */

const path = require('path');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
  entry: ['regenerator-runtime/runtime', path.resolve(__dirname, '../src/js')],
  output: {
    filename: '[name].js',
    chunkFilename: '[chunkhash].js',
    path: path.resolve(__dirname, '../dist/js'),
    // TODO: Revert to dynamically setting publicPath once
    // https://github.com/webpack/webpack/issues/7744 is resolved.
    publicPath: '/themes/custom/{{ NAME }}/dist/js/',
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.esm.js',
    },
    extensions: ['.js', '.json', '.vue'],
  },
  plugins: [new LodashModuleReplacementPlugin(), new VueLoaderPlugin()],
};
