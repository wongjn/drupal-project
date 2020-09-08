<?php

namespace Drupal\Tests\{{ NAME }}\Traits;

use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\file\Entity\File;
use Drupal\media\Entity\Media;
use Drupal\media\Entity\MediaType;
use Drupal\Tests\TestFileCreationTrait;
use Drupal\Tests\user\Traits\UserCreationTrait;

/**
 * Trait for useful methods related to entities.
 */
trait EntityTestTrait {

  use TestFileCreationTrait;
  use UserCreationTrait;

  /**
   * Sets up media entities.
   */
  protected function setUpMediaEntity() {
    $this->installEntitySchema('media');
    $this->installEntitySchema('file');
    $this->installSchema('file', ['file_usage']);
    $this->setUpCurrentUser([], ['view media']);

    MediaType::create([
      'id' => 'image',
      'source' => 'image',
      'source_configuration' => ['source_field' => 'field_media_image'],
    ])->save();

    $this->createEntityField('image', [
      'type' => 'image',
      'field_name' => 'field_media_image',
      'entity_type' => 'media',
    ]);

    $display = $this->container
      ->get('entity_display.repository')
      ->getViewDisplay('media', 'image');
    foreach (array_keys($display->getComponents()) as $name) {
      $display->removeComponent($name);
    }

    $display
      ->setComponent('field_media_image', ['type' => 'image', 'settings' => []])
      ->save();
  }

  /**
   * Creates an image media entity.
   *
   * @return \Drupal\media\Entity\Media
   *   The image media entity.
   */
  protected function createMediaEntity() {
    $media = Media::create([
      'bundle' => 'image',
      'field_media_image' => $this->getFileEntity('image')->id(),
    ]);
    $media->save();

    return $media;
  }

  /**
   * Creates a file entity if the file module is enabled on the test.
   *
   * @param string $type
   *   File type, possible values: 'binary', 'html', 'image', 'javascript',
   *   'php', 'sql', 'text'.
   *
   * @return \Drupal\file\Entity\File
   *   A file entity.
   */
  protected function getFileEntity($type) {
    $file = $this->getTestFiles($type)[0];

    $entity = File::create(['uri' => $file->uri]);
    $entity->setPermanent();
    $entity->save();

    return $entity;
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
