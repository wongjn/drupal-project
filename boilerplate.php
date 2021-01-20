<?php

/**
 * @file
 * Boilerplate copying.
 */

if ($argc < 2) {
  throw new Exception('Need Human name argument');
}

const BOILERPLATE_ROOT = 'boilerplate';

$snake_name = basename(realpath('.'));
$machine_name = str_replace('-', '_', $snake_name);
$human_name = $argv[1];
$vendor = isset($argv[2]) ? $argv[2] : 'vendor';
$upper_camel = upper_camel($machine_name);

// Token replacements in filenames or file content.
$replacements = [
  '{{ NAME }}' => $machine_name,
  '{{ NAME_SNAKE }}' => $snake_name,
  '{{ LABEL }}' => $human_name,
  '{{ CAMEL }}' => lcfirst($upper_camel),
  '{{ UCAMEL }}' => $upper_camel,
  '{{ UPPER }}' => strtoupper($machine_name),
];

$finfo = new finfo(FILEINFO_MIME_TYPE);

echo "Copying boilerplate files...\n";
boilerplate_generate(BOILERPLATE_ROOT, '.');
copy('public_html/sites/example.settings.local.php', 'public_html/sites/default/settings.local.php');

echo "Rewriting composer.json\n";
file_put_contents('composer.json', preg_replace(
  ['/("name": ").+"/', '/("description": ").+"/'],
  [sprintf('$1%s/%s"', $vendor, $machine_name), sprintf('$1%s Drupal 8 project managed with composer."', $human_name)],
  file_get_contents('composer.json'),
  1,
));

echo "Removing boilerplate files...\n";
remove_directory_recursive(BOILERPLATE_ROOT);
unlink(__FILE__);

/**
 * Converts a string to upper camel case.
 *
 * Assumes all non-alphanumeric characters not specified in $mask parameter are
 * word boundaries.
 *
 * @param string $string
 *   The string to convert.
 * @param string[] $mask
 *   A list of non-alphanumeric characters to preserve.
 *
 * @return string
 *   The given string in upper camel case.
 */
function upper_camel($string, array $mask = []) {
  // Non-alpha and non-numeric characters become spaces.
  $string = preg_replace('/[^a-z0-9' . implode('', $mask) . ']+/i', ' ', $string);
  $string = trim($string);

  // Uppercase the first character of each word.
  $string = ucwords($string);
  $string = str_replace(' ', '', $string);

  return $string;
}

/**
 * Generate the boilerplate files with replacemenets.
 *
 * @param string $source
 *   Source path.
 * @param string $dest
 *   Destination path.
 * @return bool
 *   Returns true on success, false on failure.
 */
function boilerplate_generate($source, $dest) {
  global $replacements, $finfo;
  $dest = strtr($dest, $replacements);

  // Move a file
  if (is_file($source)) {
    $result = rename($source, $dest);

    if ($result && strpos($finfo->file($dest), 'text/') === 0) {
      $replaced_content = strtr(file_get_contents($dest), $replacements);
      return !!file_put_contents($dest, $replaced_content);
    }

    return $result;
  }

  // Make destination directory
  if (!is_dir($dest)) {
    mkdir($dest, 0755);
  }

  // Loop through the folder
  $dir = dir($source);
  while (false !== $entry = $dir->read()) {
    // Skip pointers
    if ($entry == '.' || $entry == '..') {
      continue;
    }

    // Deep copy directories
    boilerplate_generate("$source/$entry", "$dest/$entry");
  }

  // Clean up
  $dir->close();
}

/**
 * Deletes all files in a directory recursively.
 *
 * @param string $directory
 *   The directory to remove.
 */
function remove_directory_recursive($directory) {
  $iterator = new DirectoryIterator($directory);

  foreach ($iterator as $entry) {
    if ($entry->isFile()) {
      unlink($entry->getRealPath());
    }
    elseif (!$entry->isDot() && $entry->isDir()) {
      remove_directory_recursive($entry->getRealPath());
    }
  }

  rmdir($directory);
}
