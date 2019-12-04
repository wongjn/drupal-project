<?php

namespace Drupal\Tests\{{ NAME }}\Kernel\Block;

use Drupal\block_content\Entity\BlockContent;
use Drupal\Tests\block\Traits\BlockCreationTrait;
use Drupal\Tests\{{ NAME }}\Kernel\FieldableEntityTestBase;

/**
 * Base class for block content output tests.
 */
abstract class BlockContentTestBase extends FieldableEntityTestBase {

  use BlockCreationTrait;

  /**
   * {@inheritdoc}
   */
  protected $entityType = 'block_content';

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'block',
    'block_content',
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUpEntityBundle() {
    parent::setUpEntityBundle();

    $this->viewBuilder = $this->container->get('entity_type.manager')->getViewBuilder('block');
  }

  /**
   * Renders a placed custom block with the given parameters/field values.
   *
   * @param array $parameters
   *   (optional) Parameters to create a custom block.
   *
   * @return \Drupal\block_content\BlockContentInterface
   *   The block content entity.
   */
  protected function renderEntity(array $parameters = []) {
    $parameters += ['region' => 'content'];

    $block_settings = [];
    foreach (['id', 'label', 'region', 'view_mode', 'visibility', 'weight'] as $key) {
      if (isset($parameters[$key])) {
        $block_settings[$key] = $parameters[$key];
        // Remove extra values that do not belong in the parameters array.
        unset($parameters[$key]);
      }
    }

    $block_content = BlockContent::create(['type' => $this->bundle] + $parameters);
    $block_content->save();

    $block = $this->placeBlock("block_content:{$block_content->uuid()}", $block_settings);
    $this->isolatedRender($this->viewBuilder->view($block));

    return $block_content;
  }

}
