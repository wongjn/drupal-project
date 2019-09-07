<?php

namespace Drupal\Tests\{{ NAME }}\Kernel;

/**
 * Tests region theming.
 *
 * @group {{ NAME }}
 */
class RegionTest extends ThemeKernelTestBase {

  /**
   * Region base render array.
   *
   * @var array
   */
  protected $buildBase = [
    '#theme_wrappers' => ['region'],
    '#children' => ['#markup' => ''],
  ];

}
