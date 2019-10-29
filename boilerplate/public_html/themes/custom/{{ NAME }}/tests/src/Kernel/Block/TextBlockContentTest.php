<?php

namespace Drupal\Tests\{{ NAME }}\Kernel\Block;

/**
 * Tests text block content output.
 *
 * @group {{ NAME }}
 */
class TextBlockContentTest extends BlockContentTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'filter',
    'text',
  ];

  /**
   * {@inheritdoc}
   */
  protected $bundle = 'text';

  /**
   * {@inheritdoc}
   */
  protected $fields = [
    'body' => 'text',
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();
    $this->installConfig(['filter']);
  }

  /**
   * Tests base output.
   */
  public function testOutput() {
    $block = $this->renderBlockContent(['body' => $this->randomMachineName()]);

    $this->assertElementText('[class="c-text-body"] > p', $block->body->value, 'Body text.');
  }

}
