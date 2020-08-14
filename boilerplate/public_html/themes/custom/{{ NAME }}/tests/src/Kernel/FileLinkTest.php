<?php

namespace Drupal\Tests\{{ NAME }}\Kernel;

use Drupal\file\Entity\File;
use Drupal\Tests\TestFileCreationTrait;

/**
 * Tests the file_link theme function.
 *
 * @group {{ NAME }}
 */
class FileLinkTest extends ThemeKernelTestBase {

  use TestFileCreationTrait;

  /**
   * {@inheritdoc}
   */
  protected static $modules = ['file', 'user'];

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();
    $this->installEntitySchema('file');
    $this->installSchema('file', ['file_usage']);
  }

  /**
   * Tests output for file_link theme function.
   *
   * @see {{ NAME }}_theme_registry_alter()
   * @see {{ NAME }}_preprocess_file_link()
   * @see file-link.html.twig
   */
  public function testFileLinkTheme() {
    $test_file = $this->getTestFiles('text')[0];
    $file_size = filesize($test_file->uri);
    $file = File::create((array) $test_file + ['filesize' => $file_size]);

    $this->isolatedRender([
      '#theme' => 'file_link',
      '#file' => $file,
    ]);

    $elements = $this->cssSelect('body *');
    $this->assertCount(1, $elements, 'Single element rendered.');

    $element = reset($elements);
    $this->assertEquals('a', $element->getName(), 'Anchor tag output.');

    $attributes = $element->attributes();
    $this->assertNotNull($attributes->href, 'Href attribute is present.');
    $this->assertEquals("text/plain; length=$file_size", (string) $attributes->type, 'Expected type attribute.');
    $this->assertEquals('', (string) $attributes->download, 'Expected download attribute.');
  }

}
