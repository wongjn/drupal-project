<?php

namespace Drupal\Tests\{{ NAME }}\Kernel\Views;

use Drupal\Tests\block\Traits\BlockCreationTrait;
use Drupal\Tests\user\Traits\UserCreationTrait;
use Drupal\views\Tests\ViewTestData;

/**
 * Tests alterations made to views blocks.
 *
 * @see {{ NAME }}_preprocess_block()
 *
 * @group {{ NAME }}
 */
class ViewsBlockTest extends ViewsTestBase {

  use BlockCreationTrait;
  use UserCreationTrait;

  /**
   * {@inheritdoc}
   */
  public static $modules = ['block', 'block_test_views'];

  /**
   * {@inheritdoc}
   */
  public static $testViews = ['test_view_block'];

  /**
   * {@inheritdoc}
   */
  protected function setUp($import_test_views = TRUE) {
    parent::setUp(FALSE);
    ViewTestData::createTestViews(get_class($this), ['block_test_views']);
  }

  /**
   * Tests classes on views blocks.
   */
  public function testViewsBlockClass() {
    $this->renderBlock();

    $block = $this->cssSelect('#block-test')[0];
    $attributes = $block->attributes();

    $this->assertStringNotContainsString('views-element-container', (string) $attributes->class, '"views-element-container" class removed from block.');
  }

  /**
   * Tests contextual links alterations.
   */
  public function testViewsBlockContextualLinks() {
    $this->enableModules(['contextual', 'views_ui']);
    $this->setUpCurrentUser([], [], TRUE);

    $this->renderBlock();

    $elements = $this->cssSelect('#block-test [data-contextual-id]');
    $this->assertCount(1, $elements, 'One set of contextual links in the block.');

    $data = (string) $elements[0]->attributes()->{'data-contextual-id'};
    $this->assertStringContainsString('entity.view.edit_form:', $data, 'Contextual links contain link to edit the view.');
  }

  /**
   * Renders a views block.
   */
  protected function renderBlock() {
    $block = $this->placeBlock('views_block:test_view_block-block_1', ['id' => 'test']);
    $build = $this->container
      ->get('entity_type.manager')
      ->getViewBuilder('block')
      ->view($block);
    $this->isolatedRender($build);
  }

}
