<?php

namespace Drupal\Tests\{{ NAME }}_helper\Kernel\Views\area;

use Drupal\Tests\views\Kernel\ViewsKernelTestBase;
use Drupal\views\Tests\ViewTestData;
use Drupal\views\Views;

/**
 * Tests the inview display extender.
 *
 * @group {{ NAME }}_helper
 */
class InviewTest extends ViewsKernelTestBase {

  /**
   * {@inheritdoc}
   */
  public static $modules = [
    '{{ NAME }}_helper',
    '{{ NAME }}_helper_test_views',
  ];

  /**
   * {@inheritdoc}
   */
  public static $testViews = ['test_extender_inview'];

  /**
   * The renderer.
   *
   * @var \Drupal\Core\Render\RendererInterface
   */
  protected $renderer;

  /**
   * {@inheritdoc}
   */
  protected function setUp($import_test_views = TRUE) {
    parent::setUp(FALSE);
    ViewTestData::createTestViews(get_class($this), ['{{ NAME }}_helper_test_views']);

    $this->config('views.settings')
      ->set('display_extenders', ['inview' => 'inview'])
      ->save();

    $this->renderer = $this->container->get('renderer');
  }

  /**
   * Tests inview render modifications.
   */
  public function testRender() {
    $view = Views::getView('test_extender_inview');
    $build = $view->preview('embed_1');
    $this->setRawContent($this->renderer->renderPlain($build));

    $elements = $this->cssSelect('[class*="js-view-dom-id-"].js-inview-list[data-selector=".select"][data-ratio="0.5"]');
    $this->assertCount(1, $elements);
  }

}
