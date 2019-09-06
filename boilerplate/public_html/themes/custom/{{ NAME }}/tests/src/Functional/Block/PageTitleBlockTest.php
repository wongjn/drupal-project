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
    'node',
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();
    $this->drupalPlaceBlock('page_title_block', ['region' => 'content']);
  }

  /**
   * Test 'normal' page title style.
   */
  public function testNormalOutput() {
    $this->drupalGet('');
    $this->assertSession()->elementExists('css', '.o-title');
  }

}
