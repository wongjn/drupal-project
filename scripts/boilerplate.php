<?php
/**
 * @file
 * Boilerplate copying.
 */

echo var_dump($argv);
die();

if ($argc < 2) {
  throw new Exception('Need Human name argument');
}

const BOILERPLATE_ROOT = 'boilerplate';

$machine_name = basename(realpath('.'));
$human_name   = $argv[1];
$upper_camel  = upper_camel($machine_name);

// Token replacements in filenames or file content.
$replacements = [
  '{{ NAME }}'   => $machine_name,
  '{{ HUMAN }}'  => $human_name,
  '{{ CAMEL }}'  => lcfirst($upper_camel),
  '{{ UCAMEL }}' => $upper_camel,
  BOILERPLATE_ROOT . DIRECTORY_SEPARATOR => '',
];

$finfo = new finfo(FILEINFO_MIME_TYPE);

echo "Copying boilerplate files...\n";
foreach (scan_directory_recursive(BOILERPLATE_ROOT) as $file_path) {
  $destination = strtr($file_path, $replacements);
  rename($file_path, $destination);

  if (strpos($finfo->file($destination), 'text/') === 0) {
    $content = strtr(file_get_contents($destination), $replacements);
    file_put_contents($destination, $content);
  }
}

echo "Rewriting composer.json\n";
$config = json_decode(file_get_contents('composer.json'), TRUE);
unset($config['post-create-project-cmd']);
file_put_contents('composer.json', json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

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
 * Scans a directory for files recursively.
 *
 * @param string $directory
 *   The directory to search in.
 * @param string[] $results
 *   Internal variable to track results for the recursion aspect.
 *
 * @return string[]
 *   List of all files within the given directory.
 */
function scan_directory_recursive($directory, array &$results = []) {
  $files = scandir($directory);

  foreach ($files as $value) {
    $path = realpath($directory . DIRECTORY_SEPARATOR . $value);

    if (!is_dir($path)) {
      $results[] = $path;
    }
    elseif ($value != '.' && $value != '..') {
      scan_directory_recursive($path, $results);
      $results[] = $path;
    }
  }

  return $results;
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
      rrmdir($entry->getRealPath());
    }
  }

  rmdir($directory);
}
