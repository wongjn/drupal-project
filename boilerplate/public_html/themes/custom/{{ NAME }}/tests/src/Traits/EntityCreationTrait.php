<?php

namespace Drupal\Tests\{{ NAME }}\Traits;

use Drupal\Core\Entity\Entity\EntityViewDisplay;
use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\file\Entity\File;

/**
 * Generic entity creation functions.
 */
trait EntityCreationTrait {

  /**
   * Test file entity to use as a field value in tests.
   *
   * @var \Drupal\file\Entity\File
   */
  protected $file;

  /**
   * Creates fields on a particular entity bundle.
   *
   * @param string $entity_type
   *   The entity type ID.
   * @param string $bundle
   *   The bundle machine name.
   * @param array[] $fields
   *   The list of fields to create. Keys are the field names, values can be
   *   a string to only state the field type (with the other storage settings as
   *   default) or an array of field storage settings.
   */
  protected function createEntityFields($entity_type, $bundle, array $fields) {
    if (!EntityViewDisplay::load("$entity_type.$bundle.default")) {
      EntityViewDisplay::create([
        'targetEntityType' => $entity_type,
        'bundle' => $bundle,
        'mode' => 'default',
        'status' => TRUE,
      ])->save();
    }

    // Create fields from the class property.
    foreach ($fields as $field_name => $field_parameters) {
      $storage_settings = is_array($field_parameters)
        ? $field_parameters
        : ['type' => $field_parameters];
      $storage = FieldStorageConfig::create([
        'entity_type' => $entity_type,
        'field_name' => $field_name,
      ] + $storage_settings);
      $storage->save();

      FieldConfig::create([
        'field_storage' => $storage,
        'bundle' => $bundle,
      ])->save();

      EntityViewDisplay::load("$entity_type.$bundle.default")
        ->setComponent($field_name)
        ->save();
    }
  }

  /**
   * Creates a file entity if the file module is enabled on the test.
   */
  protected function maybeCreateFile() {
    // If the file module is enabled, create a dummy file entity.
    $class = get_class($this);
    while ($class) {
      if (property_exists($class, 'modules')) {
        // Only check the modules, if the $modules property was not inherited.
        $rp = new \ReflectionProperty($class, 'modules');
        if ($rp->class == $class && in_array('file', $class::$modules, TRUE)) {
          $this->installEntitySchema('file');
          $this->installSchema('file', ['file_usage']);

          $this->file = File::create(['uri' => 'public://file.jpg']);
          $this->file->setPermanent();
          $this->file->save();
        }
      }
      $class = get_parent_class($class);
    }
  }

}
