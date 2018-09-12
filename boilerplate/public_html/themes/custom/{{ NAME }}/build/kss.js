/**
 * @file
 * Builds KSS styleguide.
 */

const kss = require('kss');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readDir = promisify(fs.readdir);

/**
 * The CSS directory that the styleguide generator will pull CSS from.
 */
const CSS_DIR = path.resolve(__dirname, '../dist/css');

/**
 * CSS sub-directories in order of inclusion.
 */
const CSS_SUBDIRS = ['base', 'layout', 'components', 'objects'];

/**
 * Scans a directory for files.
 *
 * Differs from fs.readdir() by returning file pathes with the given directory
 * path prepended.
 *
 * @param {string} directory
 *   The directory to scan in.
 * @return {string[]}
 *   The list of files in the directory. Gives an empty array if the directory
 *   does not exist.
 */
async function readDirFull(directory) {
  try {
    return (await readDir(directory)).map(file => path.join(directory, file));
  } catch (e) {
    return [];
  }
}

module.exports = async config => {
  // Get list of all files.
  const files = (await Promise.all([
    ...CSS_SUBDIRS.map(subdir => readDirFull(path.join(CSS_DIR, subdir))),
    [path.join(CSS_DIR, 'theme.css')],
    [path.join(CSS_DIR, 'utilities.css')],
  ]))
    // Reduce list to single level list.
    .reduce((list, fileGroup) => [...list, ...fileGroup], []);

  const styleguideDestination = path.join(__dirname, '..', config.destination);

  if (!fs.existsSync(styleguideDestination)) {
    fs.mkdirSync(styleguideDestination);
  }

  const stream = fs.createWriteStream(
    path.join(styleguideDestination, 'styles.css'),
  );
  files.forEach(async file => {
    await new Promise((resolve, reject) => {
      stream.write(fs.readFileSync(file, 'utf8'), error => {
        if (error) {
          reject(error);
        }

        resolve();
      });
    });
  });
  stream.end();

  config.css = './styles.css';
  return kss(config);
};
