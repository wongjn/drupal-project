<?php

namespace Drupal\Tests\{{ NAME }}\Kernel\Block;

use Drupal\filter\Entity\FilterFormat;

/**
 * Tests text block content theming.
 *
 * @group {{ NAME }}
 */
class TextBlockContentTest extends BlockContentTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = ['filter', 'text'];

  /**
   * {@inheritdoc}
   */
  protected $bundle = 'text';

  /**
   * {@inheritdoc}
   */
  protected $fields = ['body' => 'text_with_summary'];

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    FilterFormat::create(['format' => 'full_html'])->save();
    $this->config('filter.settings')
      ->set('fallback_format', 'full_html')
      ->save();
  }

  /**
   * Tests content region output.
   */
  public function testContentRegion() {
    $text = $this->randomMachineName();
    $this->renderEntity(['body' => "<p>$text</p>"]);

    $elements = $this->cssSelect('#block-block [class="c-text-body"] > p');
    $this->assertCount(1, $elements);
  }

}
