<?php

namespace Drupal\Tests\{{ NAME }}\Kernel\Paragraph;

use Drupal\Core\Entity\Entity\EntityViewDisplay;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\Tests\{{ NAME }}\Kernel\ThemeKernelTestBase;
use Drupal\Tests\{{ NAME }}\Traits\EntityCreationTrait;
use Drupal\Tests\paragraphs\FunctionalJavascript\ParagraphsTestBaseTrait;

/**
 * Base class for testing paragraph bundle output.
 */
abstract class ParagraphTestBase extends ThemeKernelTestBase {

  use EntityCreationTrait;
  use ParagraphsTestBaseTrait;

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'paragraphs',
    'user',
    'field',
    'file',
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

    $this->installEntitySchema('paragraph');

    $this->addParagraphsType($this->bundle);

    EntityViewDisplay::create([
      'targetEntityType' => 'paragraph',
      'bundle' => $this->bundle,
      'mode' => 'default',
      'status' => TRUE,
    ])->save();

    $this->createEntityFields('paragraph', $this->bundle, $this->fields);
    $this->maybeCreateFile();
  }

  /**
   * Renders a paragraph with the given parameters.
   *
   * @param array $parameters
   *   (optional) Parameters/field values to create a paragraph.
   *
   * @return \Drupal\paragraphs\ParagraphInterface
   *   The rendered paragraph entity.
   */
  protected function renderParagraph(array $parameters = []) {
    $paragraph = Paragraph::create(['type' => $this->bundle] + $parameters);
    $paragraph->save();

    $build = $this->container
      ->get('entity_type.manager')
      ->getViewBuilder('paragraph')
      ->view($paragraph);
    $this->isolatedRender($build);

    return $paragraph;
  }

}
