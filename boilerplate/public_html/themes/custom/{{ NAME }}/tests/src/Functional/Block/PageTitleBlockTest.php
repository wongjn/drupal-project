<?php

namespace Drupal\Tests\{{ NAME }}\Functional\Block;

use Drupal\Tests\{{ NAME }}\Functional\ThemeFunctionalTestBase;

/**
 * Tests output of the page title.
 *
 * @group {{ NAME }}
 */
class PageTitleBlockTest extends ThemeFunctionalTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'block',
  ];

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
