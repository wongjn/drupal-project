<?php

namespace Drupal\Tests\{{ NAME }}\Kernel\Paragraph;

use Drupal\Tests\{{ NAME }}\Kernel\FieldableEntityTestBase;

/**
 * Base class for testing paragraph bundle output.
 */
abstract class ParagraphTestBase extends FieldableEntityTestBase {

  /**
   * {@inheritdoc}
   */
  protected $entityType = 'paragraph';

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'file',
    'paragraphs',
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUpEntityBundle() {
    $this->installEntitySchema('paragraph');
    parent::setUpEntityBundle();
  }

}
