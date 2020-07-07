<?php

namespace Drupal\Tests\{{ NAME }}\Functional\Block;

use Drupal\Tests\BrowserTestBase;

/**
 * Tests output of the page title.
 *
 * @group {{ NAME }}
 */
class PageTitleBlockTest extends BrowserTestBase {

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

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();
    $this->drupalPlaceBlock('page_title_block', ['id' => 'title', 'region' => 'content']);
  }

  /**
   * Tests output.
   */
  public function testOutput() {
    $this->drupalGet('');
    $this->assertSession()->elementExists('css', '#block-title h1[class="o-title"]');
  }

}
