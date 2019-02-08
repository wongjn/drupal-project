/**
 * @file
 * Partial Webpack configuration.
 */

const path = require('path');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

module.exports = {
  entry: [path.resolve(__dirname, '../src/js')],
  output: {
    filename: '[name].js',
    chunkFilename: '[chunkhash].js',
    path: path.resolve(__dirname, '../dist/js'),
    publicPath: '/themes/custom/{{ NAME }}/dist/js/',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  plugins: [new LodashModuleReplacementPlugin()],
};
