/**
* Patches node-modules for custom fixes.
*/

const { promises: fs } = require('fs');
const path = require('path');

[
  // Remove once kaisermann/svelte-preprocess#149 lands.
  {
    file: 'svelte-preprocess/dist/transformers/scss.js',
    search: 'y("node-sass","sass"',
    replace: 'y("sass","node-sass"',
  },
  // Remove once cssnano/cssnano#894 lands.
  {
    file: 'postcss-convert-values/dist/index.js',
    search: /(lowerCasedValue === 'calc')/,
    replace:
      '$1 || lowerCasedValue === "max" || lowerCasedValue === "min" || lowerCasedValue === "clamp"',
  },
].forEach(({ file, search, replace }) => {
  const target = path.resolve(__dirname, '../node_modules', file);
  fs.readFile(target, 'utf8')
    .then((content) => content.replace(search, replace))
    .then((content) => fs.writeFile(target, content))
    .catch((error) => console.error(error)); // eslint-disable-line no-console
});
