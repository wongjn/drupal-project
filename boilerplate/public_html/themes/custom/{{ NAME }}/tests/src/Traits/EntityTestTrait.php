<?php

namespace Drupal\Tests\{{ NAME }}\Traits;

use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\media\Entity\Media;
use Drupal\media\Entity\MediaType;
use Drupal\media\OEmbed\Resource;
use Drupal\media\OEmbed\ResourceFetcherInterface;
use Drupal\media\OEmbed\UrlResolverInterface;
use Drupal\Tests\media\Traits\MediaTypeCreationTrait;
use Drupal\user\Entity\Role;
use Drupal\user\RoleInterface;

/**
 * Trait for useful methods related to entities.
 */
trait EntityTestTrait {

  use MediaTypeCreationTrait {
    createMediaType as drupalCreateMediaType;
  }

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
   * @param string $source_plugin_id
   *   The media source plugin ID.
   * @param mixed[] $values
   *   (optional) Additional values for the media type entity:
   *   - id: The ID of the media type. If none is provided, the media source
   *     plugin ID will be used.
   *
   * @return \Drupal\media\MediaTypeInterface
   *   The created media type.
   */
  protected function createMediaType($source_plugin_id = NULL, array $values = []) {
    $values += ['id' => $source_plugin_id];
    $media_type = $this->drupalCreateMediaType($source_plugin_id, $values);

    $display = $this->container
      ->get('entity_display.repository')
      ->getViewDisplay('media', $media_type->id());

    // Remove all default components.
    foreach (array_keys($display->getComponents()) as $name) {
      $display->removeComponent($name);
    }

    $media_type->getSource()->prepareViewDisplay($media_type, $display);
    $display->save();

    return $media_type;
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
   * Mocks the media oembed URL services.
   */
  protected function mockMediaOembed() {
    $this->container->set('media.oembed.url_resolver', $this->createMock(UrlResolverInterface::class));

    $resource = $this->createMock(Resource::class);
    $resource_fetcher = $this->createMock(ResourceFetcherInterface::class);
    $resource_fetcher->method('fetchResource')->willReturn($resource);
    $this->container->set('media.oembed.resource_fetcher', $resource_fetcher);
  }

  /**
   * Creates a field storage and a corresponding instance.
   *
   * @param array $field
   *   The arguments to create the field base with including:
   *   - type: The field type.
   *   - field_name: Machine name of the field.
   *   - entity_type: The entity type ID to create the field on.
   *   - cardinality: (optional) The cardinality of the field.
   *   - settings: (optional) Settings for the field storage.
   *   - bundle: (optional) The bundle of the entity type to add the field
   *     instance to. If omitted, will use entity_type.
   */
  protected function createEntityField(array $field) {
    $instance_options = ['bundle' => isset($field['bundle']) ? $field['bundle'] : $field['entity_type']];
    unset($field['bundle']);

    $storage = FieldStorageConfig::create($field);
    $storage->save();
    FieldConfig::create(['field_storage' => $storage] + $instance_options)->save();
  }

}
