<?php

namespace Drupal\Tests\{{ NAME }}_helper\Kernel\Views;

use Drupal\Component\Utility\Html;
use Drupal\Tests\block\Traits\BlockCreationTrait;
use Drupal\Tests\views\Kernel\ViewsKernelTestBase;

/**
 * Tests alterations to form blocks.
 *
 * @group {{ NAME }}_helper
 * @see {{ NAME }}_helper_block_alter()
 * @see Drupal\{{ NAME }}_helper\Plugin\Block\FormWrapperFixBlockTest
 */
class FormWrapperFixBlockTest extends ViewsKernelTestBase {

  use BlockCreationTrait;

  /**
   * {@inheritdoc}
   */
  protected static $modules = ['block', '{{ NAME }}_helper', 'node'];

  /**
   * {@inheritdoc}
   */
  public static $testViews = ['test_exposed_block'];

  /**
   * Tests views exposed filter block replacement.
   */
  public function testViewsExposedFilterBlock() {
    $block = $this->placeBlock('views_exposed_filter_block:test_exposed_block-page_1', ['id' => 'block']);
    $build = $this->container->get('entity_type.manager')->getViewBuilder('block')->view($block);
    $this->render($build);

    $block_wrapper = $this->cssSelect('#block-block')[0];
    $this->assertFalse(isset($block_wrapper->attributes()['data-drupal-selector']), 'HTML attribute "data-drupal-selector" should not be set on the block element.');

    $form = $this->cssSelect('#block-block form')[0];
    $this->assertEquals('views-exposed-form-test-exposed-block-page-1', $form->attributes()['data-drupal-selector'], 'HTML attribute "data-drupal-selector" should be set on the block content form element.');

    $label = $this->randomMachineName();

    $block->getPlugin()->setConfigurationValue('views_label', $label);
    $block->save();

    Html::resetSeenIds();
    $build = $this->container->get('entity_type.manager')->getViewBuilder('block')->view($block);
    $this->render($build);

    $elements = $this->cssSelect('#block-block > h2');
    $this->assertCount(1, $elements, 'Block title present.');

    $title = reset($elements)[0];
    $this->assertEquals($label, trim((string) $title), 'Block title is overridden.');
  }

}
