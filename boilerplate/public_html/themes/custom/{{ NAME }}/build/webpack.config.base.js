/**
 * @file
 * Partial Webpack configuration.
 */

const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: [path.resolve(__dirname, '../src/js')],
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
  plugins: [
    new webpack.HashedModuleIdsPlugin(),
    // Vendor chunks
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      deepChildren: true,
      minChunks: module => module.context && module.context.indexOf('node_modules') > -1,
    }),
    // Common async chunks
    new webpack.optimize.CommonsChunkPlugin({
      async: 'lazyChunk',
      deepChildren: true,
      minChunks: 2,
    }),
  ],
};
