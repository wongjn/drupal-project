/**
 * @file
 * Partial Webpack configuration.
 */

const path = require('path');
const { DefinePlugin } = require('webpack');
const ChunkRenamePlugin = require('webpack-chunk-rename-plugin');

const getBase = name => ({
  name,
  context: path.resolve(__dirname, '../'),
  entry: {
    main: [
      './src/js/menu/index.js',
      './src/js/in-view.js',
      './src/js/scrollbar-size.js',
      ...(name === 'legacy' ? ['./src/js/svg-polyfill.js'] : []),
    ],
  },
  output: {
    filename: `[name].${name}.js`,
    chunkFilename: '[chunkhash].js',
    path: path.resolve(__dirname, '../dist/js'),
    publicPath: '/themes/custom/{{ NAME }}/dist/js/',
  },
  optimization: {
    moduleIds: 'hashed',
    runtimeChunk: 'single',
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
    new DefinePlugin({ BUNDLE_TYPE: JSON.stringify(name) }),
    new ChunkRenamePlugin({ initialChunksWithEntry: true }),
  ],
});

module.exports = [getBase('legacy'), getBase('modern')];
