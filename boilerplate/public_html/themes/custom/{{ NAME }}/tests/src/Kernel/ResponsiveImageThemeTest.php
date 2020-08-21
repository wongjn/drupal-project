<?php

namespace Drupal\Tests\{{ NAME }}\Kernel;

use Drupal\responsive_image\Entity\ResponsiveImageStyle;
use Drupal\Tests\TestFileCreationTrait;

/**
 * Tests responsive image theme function output.
 *
 * @group {{ NAME }}
 *
 * @see {{ NAME }}_preprocess_responsive_image()
 */
class ResponsiveImageThemeTest extends ThemeKernelTestBase {

  use TestFileCreationTrait;

  /**
   * {@inheritdoc}
   */
  protected static $modules = ['breakpoint', 'image', 'responsive_image'];

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    $this->installConfig(['image']);

    ResponsiveImageStyle::create([
      'id' => 'test',
      'breakpoint_group' => 'responsive_image',
      'fallback_image_style' => 'thumbnail',
    ])
      ->addImageStyleMapping('responsive_image.viewport_sizing', '1x', [
        'image_mapping_type' => 'sizes',
        'image_mapping' => [
          'sizes' => '(min-width: 700px) 700px, 100vw',
          'sizes_image_styles' => ['large', 'medium', 'thumbnail'],
        ],
      ])
      ->save();
  }

  /**
   * Tests dimension attributes for the image element.
   */
  public function testDimensionAttributes() {
    $images = $this->getTestFiles('image');

    $this->isolatedRender([
      '#theme' => 'responsive_image',
      '#uri' => reset($images)->uri,
      '#responsive_image_style_id' => 'test',
    ]);

    $img = $this->cssSelect('img')[0];
    $this->assertNull($img->attributes()->width);
    $this->assertNull($img->attributes()->height);

    $this->isolatedRender([
      '#theme' => 'responsive_image',
      '#uri' => reset($images)->uri,
      '#responsive_image_style_id' => 'test',
      '#width' => 2000,
      '#height' => 2000,
    ]);

    $img = $this->cssSelect('img')[0];
    $this->assertEquals('100', (string) $img->attributes()->width, 'Uses fallback image style for width.');
    $this->assertEquals('100', (string) $img->attributes()->height, 'Uses fallback image style for height.');
    $this->assertEquals('lazy', (string) $img->attributes()->loading, 'Has native lazy loading.');
  }

}
