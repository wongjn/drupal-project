<?php

namespace Drupal\Tests\{{ NAME }}\Traits;

use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\media\Entity\Media;
use Drupal\media\Entity\MediaType;
use Drupal\user\Entity\Role;
use Drupal\user\RoleInterface;

/**
 * Trait for useful methods related to entities.
 */
trait EntityTestTrait {

  /**
   * Sets up for media entity usage.
   */
  protected function setUpMedia() {
    $this->installEntitySchema('media');
    $this->installEntitySchema('file');
    $this->installEntitySchema('user');
    $this->installSchema('file', ['file_usage']);

    $this->installConfig(['user']);
    Role::load(RoleInterface::ANONYMOUS_ID)
      ->grantPermission('view media')
      ->save();
  }

  /**
   * Creates a media entity type.
   *
   * @param string $type
   *   The media entity bundle name.
   * @param string $source_plugin
   *   (optional) The media source plugin, use NULL to use the value of $type.
   *   Default NULL.
   */
  protected function createMediaType($type, $source_plugin = NULL) {
    $media_type = MediaType::create(['id' => $type, 'source' => $source_plugin ?: $type]);
    $media_type->save();

    $source = $media_type->getSource();

    $source_field = $source->createSourceField($media_type);
    $source_field->getFieldStorageDefinition()->save();
    $source_field->save();

    $source_config = $media_type->getSource()->getConfiguration();
    $source_config['source_field'] = $source_field->getName();
    $media_type->getSource()->setConfiguration($source_config);
    $media_type->save();

    $display = $this->container
      ->get('entity_display.repository')
      ->getViewDisplay('media', $media_type->id());

    // Remove all default components.
    foreach (array_keys($display->getComponents()) as $name) {
      $display->removeComponent($name);
    }
    $source->prepareViewDisplay($media_type, $display);
    $display->save();
  }

  /**
   * Creates a media entity.
   *
   * @param string $type
   *   The media entity bundle name.
   *
   * @return \Drupal\media\Entity\Media
   *   The media entity.
   */
  protected function createMediaEntity($type) {
    $media_type = MediaType::load($type);
    $field_name = $media_type
      ->getSource()
      ->getSourceFieldDefinition($media_type)
      ->getName();

    $media = Media::create(['bundle' => $type]);
    $media->{$field_name}->generateSampleItems();
    $media->save();

    return $media;
  }

  /**
   * Creates fields on a particular entity bundle.
   *
   * @param string $bundle
   *   The bundle to attach the field instance to.
   * @param array $field
   *   The arguments to create the field base with.
   * @param array $instance_options
   *   (optional) Any extra options to create the field instance with.
   */
  protected function createEntityField($bundle, array $field, array $instance_options = []) {
    $storage = FieldStorageConfig::create($field);
    $storage->save();

    FieldConfig::create([
      'field_storage' => $storage,
      'bundle' => $bundle,
    ] + $instance_options)->save();
  }

}
