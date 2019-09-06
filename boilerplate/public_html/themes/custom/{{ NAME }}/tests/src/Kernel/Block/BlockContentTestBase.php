<?php

namespace Drupal\Tests\{{ NAME }}\Kernel\Block;

use Drupal\block_content\Entity\BlockContent;
use Drupal\block_content\Entity\BlockContentType;
use Drupal\Core\Entity\Entity\EntityViewDisplay;
use Drupal\Tests\block\Traits\BlockCreationTrait;
use Drupal\Tests\{{ NAME }}\Kernel\ThemeKernelTestBase;
use Drupal\Tests\{{ NAME }}\Traits\EntityCreationTrait;

/**
 * Base class for block content output tests.
 */
abstract class BlockContentTestBase extends ThemeKernelTestBase {

  use BlockCreationTrait;
  use EntityCreationTrait;

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'block',
    'block_content',
    'field',
    'user',
  ];

  /**
   * The block content bundle being tested.
   *
   * @var string
   */
  protected $bundle;

  /**
   * Fields to add to the test block content bundle.
   *
   * Keyed by field name with storage settings as the array value or a string to
   * specify only the field type with the rest of settings as defaults.
   *
   * @var array|string[]
   */
  protected $fields = [];

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    $this->installEntitySchema('block_content');

    BlockContentType::create(['id' => $this->bundle])->save();

    EntityViewDisplay::create([
      'targetEntityType' => 'block_content',
      'bundle' => $this->bundle,
      'mode' => 'default',
      'status' => TRUE,
    ])->save();

    $this->createEntityFields('block_content', $this->bundle, $this->fields);
    $this->maybeCreateFile();
  }

  /**
   * Renders a placed custom block with the given parameters/field values.
   *
   * @param array $parameters
   *   (optional) Parameters to create a custom block.
   * @param string $region
   *   (optional) The region to place the block in before render.
   * @param string $view_mode
   *   (optional) The view mode that should be used to render the block.
   *
   * @return \Drupal\block_content\BlockContentInterface
   *   The block content entity.
   */
  protected function renderPlacedBlock(array $parameters = [], $region = 'content', $view_mode = 'full') {
    $block_content = BlockContent::create(['type' => $this->bundle] + $parameters);
    $block_content->save();

    $block = $this->placeBlock(
      'block_content:' . $block_content->uuid(),
      [
        'region' => $region,
        'view_mode' => $view_mode,
      ]
    );
    $build = $this->container
      ->get('entity_type.manager')
      ->getViewBuilder('block')
      ->view($block);
    $this->isolatedRender($build);

    return $block_content;
  }

}
