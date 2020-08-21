<?php

namespace Drupal\Tests\{{ NAME }}\Kernel;

/**
 * Tests image theme function output.
 *
 * @group {{ NAME }}
 *
 * @see {{ NAME }}_preprocess_image()
 */
class ImageThemeTest extends ThemeKernelTestBase {

  /**
   * Tests the loading attribute.
   *
   * @dataProvider providerLoadingAttribute
   */
  public function testImageLoadingAttribute(array $attributes, $expected) {
    $this->isolatedRender([
      '#theme' => 'image',
      '#uri' => 'public://image.jpg',
      '#attributes' => $attributes,
    ]);

    $img = $this->cssSelect('img')[0];

    if ($expected) {
      $this->assertNotNull($img->attributes()->loading);
      $this->assertEquals('lazy', (string) $img->attributes()->loading);
    }
    else {
      $this->assertNull($img->attributes()->loading);
    }
  }

  /**
   * Provides test cases for ::testImageLoadingAttribute().
   */
  public function providerLoadingAttribute() {
    return [
      'Width and height 1' => [['width' => 100, 'height' => 100], TRUE],
      'Width and height 2' => [['width' => '50%', 'height' => 100], TRUE],
      'Null width' => [['width' => NULL, 'height' => 100], FALSE],
      'No width' => [['height' => 100], FALSE],
      'No dimensions' => [[], FALSE],
    ];
  }

}
