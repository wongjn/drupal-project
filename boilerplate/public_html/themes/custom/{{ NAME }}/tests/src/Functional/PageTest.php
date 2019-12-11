<?php

namespace Drupal\Tests\{{ NAME }}\Functional;

use Drupal\Tests\BrowserTestBase;

/**
 * Tests page layout markup.
 *
 * @group {{ NAME }}
 */
class PageTest extends BrowserTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'block',
  ];

  /**
   * {@inheritdoc}
   */
  protected $defaultTheme = '{{ NAME }}';

}
