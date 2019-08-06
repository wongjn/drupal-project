<?php

namespace Drupal\Tests\{{ NAME }}\Functional;

use Drupal\Tests\BrowserTestBase;
use Drupal\Tests\{{ NAME }}\Traits\ThemeSetTrait;

/**
 * A test base class for this theme.
 */
abstract class ThemeFunctionalTestBase extends BrowserTestBase {
  
  use ThemeSetTrait;

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();
    $this->setDefaultTheme();
  }

}
