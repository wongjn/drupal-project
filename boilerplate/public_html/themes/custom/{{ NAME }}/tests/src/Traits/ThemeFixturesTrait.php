<?php

namespace Drupal\Tests\{{ NAME }}\Traits;

/**
 * Add fixtures for theme tests.
 */
trait ThemeFixturesTrait {

  /**
   * List of fixture files created.
   *
   * Keyed by file path with the value of the backed up file (if one exists).
   *
   * @var string[]
   */
  protected static $fixtureFiles = [];

  /**
   * Constructs a fixture file.
   *
   * Will also backup the existing file if one would be overwritten.
   *
   * @param string $path
   *   The path of the file, relative to theme root.
   * @param string $content
   *   (optional) Content of the stub file. Default empty string.
   */
  protected static function setUpFixtureFile($path, $content = ''): void {
    $file = realpath(__DIR__ . '/../../..') . "/$path";

    self::$fixtureFiles[$file] = NULL;

    $backup = "$file.test_backup";
    if (file_exists($file) && !file_exists($backup)) {
      self::$fixtureFiles[$file] = $backup;
      rename($file, $backup);
    }
    elseif (!file_exists(dirname($file))) {
      mkdir(dirname($file), 0777, TRUE);
    }

    file_put_contents($file, $content);
  }

  /**
   * Undoes setup stub files.
   */
  protected static function tearDownFixtureFiles(): void {
    foreach (self::$fixtureFiles as $current => $backup) {
      $backup ? rename($backup, $current) : unlink($current);
    }

    self::$fixtureFiles = [];
  }

  /**
   * Add SVG icons fixture to use for ex_icons.
   */
  protected function setUpIconsFixture() {
    $file = __DIR__ . '/../../../dist/icons.svg';

    if (!file_exists($file)) {
      mkdir(dirname($file), 0777, TRUE);
      copy(__DIR__ . '/../../fixtures/icons.svg', $file);
    }
  }

}
