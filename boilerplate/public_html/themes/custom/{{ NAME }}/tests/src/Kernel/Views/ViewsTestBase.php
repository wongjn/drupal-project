<?php

namespace Drupal\Tests\{{ NAME }}\Kernel\Views;

use Drupal\Tests\{{ NAME }}\Traits\AssertOutputTrait;
use Drupal\Tests\{{ NAME }}\Traits\ThemeSetTrait;
use Drupal\Tests\views\Kernel\ViewsKernelTestBase;
use Drupal\views\Tests\ViewTestData;

/**
 * Base class for views-related tests.
 */
abstract class ViewsTestBase extends ViewsKernelTestBase {

  use AssertOutputTrait;
  use ThemeSetTrait;

  /**
   * {@inheritdoc}
   */
  protected function setUp($import_test_views = TRUE) {
    parent::setUp(FALSE);
    $this->setDefaultTheme();

    if ($import_test_views) {
      ViewTestData::createTestViews(get_class($this), ['{{ NAME }}_test_views']);
    }
  }

}
