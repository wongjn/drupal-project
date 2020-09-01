<?php

namespace Drupal\Tests\{{ NAME }}\Kernel\Media;

use Drupal\media\Entity\MediaType;
use Drupal\Tests\{{ NAME }}\Kernel\FieldableEntityTestBase;

/**
 * Base class for media-based output tests.
 */
abstract class MediaTestBase extends FieldableEntityTestBase {

  /**
   * {@inheritdoc}
   */
  protected $entityType = 'media';

  /**
   * {@inheritdoc}
   */
  protected static $modules = ['file', 'image', 'media'];

  /**
   * Media source plugin ID.
   *
   * @var string
   */
  protected $source = 'image';

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();
    $this->installSchema('file', ['file_usage']);
    $this->installConfig('image');
  }

  /**
   * Sets up entity bundle for tests.
   */
  protected function setUpEntityBundle() {
    $this->installEntitySchema('file');
    $this->installEntitySchema('user');
    $this->installEntitySchema($this->entityType);

    /** @var \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager */
    $entity_type_manager = $this->container->get('entity_type.manager');

    $this->storage = $entity_type_manager->getStorage($this->entityType);
    $this->viewBuilder = $entity_type_manager->getViewBuilder($this->entityType);
    $this->displayRepository = $this->container->get('entity_display.repository');

    // Create the bundle.
    $bundle = MediaType::create(['id' => $this->bundle, 'source' => $this->source]);
    $bundle->save();

    $source_field = $bundle->getSource()->createSourceField($bundle);
    $source_field->getFieldStorageDefinition()->save();
    $source_field->save();
    $bundle->getSource()->setConfiguration(['source_field' => $source_field->getName()]);
    $bundle->save();

    foreach ($this->fields as $field_name => $parameters) {
      $field = (is_array($parameters) ? $parameters : ['type' => $parameters]);
      $field['field_name'] = $field_name;
      $field['entity_type'] = $this->entityType;
      $this->createEntityField($this->bundle, $field);
    }

    $display = $this->displayRepository->getViewDisplay($this->entityType, $this->bundle);
    foreach (array_keys($this->fields) as $field_name) {
      $display->setComponent($field_name);
    }
    $display->setComponent($source_field->getName())->save();
  }

}
