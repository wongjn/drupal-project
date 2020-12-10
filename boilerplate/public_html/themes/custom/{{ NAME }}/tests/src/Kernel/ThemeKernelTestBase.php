<?php

namespace Drupal\Tests\{{ NAME }}\Kernel;

use Drupal\KernelTests\KernelTestBase;
use Drupal\Tests\{{ NAME }}\Traits\AssertOutputTrait;
use Drupal\Tests\{{ NAME }}\Traits\RandomTrait;
use Drupal\Tests\{{ NAME }}\Traits\ThemeSetTrait;

/**
 * A test base class for this theme.
 */
abstract class ThemeKernelTestBase extends KernelTestBase {

  use AssertOutputTrait;
  use RandomTrait;
  use ThemeSetTrait;

  /**
   * {@inheritdoc}
   */
  protected static $modules = ['system'];

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->setDefaultTheme();
  }

}
