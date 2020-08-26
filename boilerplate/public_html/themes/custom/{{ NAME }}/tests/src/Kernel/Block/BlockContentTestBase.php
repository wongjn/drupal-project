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
  protected static $modules = ['block', 'block_content'];

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
   * @param array $values
   *   (optional) Field values for the custom block entity.
   * @param array $block_settings
   *   (optional) Settings to place the block with.
   *
   * @return \Drupal\block_content\BlockContentInterface
   *   The block content entity.
   */
  protected function renderEntity(array $values = [], array $block_settings = []) {
    $block_content = BlockContent::create(['type' => $this->bundle] + $values);
    $block_content->save();

    $block_settings += ['region' => 'content', 'id' => 'block'];
    $block = $this->placeBlock("block_content:{$block_content->uuid()}", $block_settings);
    $this->isolatedRender($this->viewBuilder->view($block));

    return $block_content;
  }

}
