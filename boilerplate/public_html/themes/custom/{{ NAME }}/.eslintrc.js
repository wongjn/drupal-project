/**
 * ESLint configuration based on Drupal core's.
 *
 * Cannot use ESlint's built-in config extending system since it tries to
 * resolve some node modules in the parent config directory (/core/ in this
 * case).
 */

const config = require('../../../core/.eslintrc.json');

config.parser = 'babel-eslint';

config.parserOptions = config.parserOptions || {};
config.parserOptions.ecmaVersion = 2017;

config.rules = config.rules || {};
config.rules['import/no-extraneous-dependencies'] = [
  2,
  {
    "devDependencies": [
      "./build/*.js",
      "**/gulpfile.js/**/*.js",
      "**/postcss.config.js",
      "**/svelte.config.js",
      "**/webpack.*.js"
    ],
    "optionalDependencies": false
  }
];

// False positives for Typescript-style JSDoc.
config.rules['valid-jsdoc'] = 0;

module.exports = config;
