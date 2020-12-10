<?php

namespace Drupal\Tests\{{ NAME }}\Kernel\Views;

use Drupal\views\Tests\ViewTestData;

/**
 * General views display output tests.
 *
 * @group {{ NAME }}
 */
class ViewsTest extends ViewsTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = ['views_test_config'];

  /**
   * {@inheritdoc}
   */
  public static $testViews = ['test_view_embed'];

  /**
   * {@inheritdoc}
   */
  protected function setUp($import_test_views = TRUE): void {
    parent::setUp(FALSE);
    ViewTestData::createTestViews(get_class($this), ['views_test_config']);
  }

  /**
   * Tests that an extraneous div wrapper is removed from view output.
   *
   * @see \Drupal\{{ NAME }}\{{ UCAMEL }}PreRender::view()
   */
  public function testRemovedDivWrapper() {
    $this->isolatedRender(['#type' => 'view', '#name' => 'test_view_embed']);

    $element = $this->cssSelect('div[class*="js-view-dom-id-"]')[0];
    $this->assertEquals('body', $element->xpath('..')[0]->getName());
  }

}
