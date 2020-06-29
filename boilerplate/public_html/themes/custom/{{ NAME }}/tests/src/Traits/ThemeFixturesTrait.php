<?php

namespace Drupal\Tests\{{ NAME }}\Traits;

/**
 * Add fixtures for theme tests.
 */
trait ThemeFixturesTrait {

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
