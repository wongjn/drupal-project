/**
 * @file
 * Partial Webpack configuration.
 */

const path = require('path');

module.exports = {
  entry: ['regenerator-runtime/runtime', path.resolve(__dirname, '../src/js')],
  output: {
    filename: '[name].js',
    chunkFilename: '[chunkhash].js',
    path: path.resolve(__dirname, '../dist/js'),
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
  resolve: {
    extensions: [
      '.js',
      '.json',
      '.jsx',
    ],
  },
};
