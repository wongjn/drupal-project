<?php

namespace Drupal\Tests\{{ NAME }}\Kernel\Media;

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
   * Sets up entity bundle for tests.
   */
  protected function setUpEntityBundle() {
    $this->setUpMedia();
    $this->createMediaType($this->source, ['id' => $this->bundle]);

    /** @var \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager */
    $entity_type_manager = $this->container->get('entity_type.manager');

    $this->storage = $entity_type_manager->getStorage($this->entityType);
    $this->viewBuilder = $entity_type_manager->getViewBuilder($this->entityType);
    $this->displayRepository = $this->container->get('entity_display.repository');

    foreach ($this->fields as $field_name => $parameters) {
      $field = (is_array($parameters) ? $parameters : ['type' => $parameters]);
      $field['field_name'] = $field_name;
      $field['entity_type'] = $this->entityType;
      $field['bundle'] = $this->bundle;
      $this->createEntityField($field);
    }

    $display = $this->displayRepository->getViewDisplay($this->entityType, $this->bundle);
    foreach (array_keys($this->fields) as $field_name) {
      $display->setComponent($field_name);
    }
    $display->save();
  }

}
