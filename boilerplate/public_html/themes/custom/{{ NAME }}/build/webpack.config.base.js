/**
 * @file
 * Partial Webpack configuration.
 */

const path = require('path');
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
        test: /\.js$/,
        exclude: /node_modules\/(?!rambda).*/,
        use: {
          loader: 'babel-loader',
          options: { envName: name },
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
      Sass: path.resolve(__dirname, '../src/sass'),
    },
  },
  plugins: [new LodashModuleReplacementPlugin()],
});

module.exports = [getBase('legacy'), getBase('modern')];
