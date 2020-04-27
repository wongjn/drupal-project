/**
 * @file
 * Svelte config for jamesbirtles.svelte-vscode VSCode extension.
 */

const sveltePreprocess = require('svelte-preprocess');
const postcssConfig = require('./postcss.config');

module.exports = {
  preprocess: sveltePreprocess({
    scss: { renderSync: true },
    postcss: postcssConfig,
  }),
};
