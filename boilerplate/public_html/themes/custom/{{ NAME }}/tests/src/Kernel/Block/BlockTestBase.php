<?php

namespace Drupal\Tests\{{ NAME }}\Kernel\Block;

use Drupal\Tests\block\Traits\BlockCreationTrait;
use Drupal\Tests\{{ NAME }}\Kernel\ThemeKernelTestBase;

/**
 * Base class for testing block output.
 */
class BlockTestBase extends ThemeKernelTestBase {

  use BlockCreationTrait;

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'block',
    'user',
  ];

  /**
   * Places and renders (in isolation) a block.
   *
   * @param string $plugin_id
   *   The plugin ID of the block type for this block instance.
   * @param array $settings
   *   (optional) An associative array of settings for the block entity. See
   *   \Drupal\Tests\block\Traits\BlockCreationTrait::placeBlock() for details
   *   on what this parameter accepts.
   *
   * @return \Drupal\block\BlockInterface
   *   The block.
   */
  protected function placeRenderBlock($plugin_id, array $settings = []) {
    $block = $this->placeBlock($plugin_id, $settings);

    $build = $this->container
      ->get('entity_type.manager')
      ->getViewBuilder('block')
      ->view($block);
    $this->isolatedRender($build);

    return $block;
  }

}
