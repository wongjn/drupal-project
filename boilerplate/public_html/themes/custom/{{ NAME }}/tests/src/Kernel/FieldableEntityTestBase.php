<?php

namespace Drupal\Tests\{{ NAME }}\Kernel;

use Drupal\Core\Entity\Entity\EntityViewMode;
use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\file\Entity\File;

/**
 * Base class for fieldable entity tests.
 */
abstract class FieldableEntityTestBase extends ThemeKernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'field',
    'user',
  ];

  /**
   * Name of the entity type being tested.
   *
   * @var string
   */
  protected $entityType;

  /**
   * The entity bundle being tested.
   *
   * @var string
   */
  protected $bundle;

  /**
   * Fields to add to the test entity bundle.
   *
   * Keyed by field name with storage settings as the array value or a string to
   * specify only the field type with the rest of settings as defaults.
   *
   * @var array|string[]
   */
  protected $fields = [];

  /**
   * Test file entity to use as a field value in tests.
   *
   * @var \Drupal\file\Entity\File
   */
  protected $file;

  /**
   * Entity view display repository.
   *
   * @var \Drupal\Core\Entity\EntityDisplayRepositoryInterface
   */
  protected $displayRepository;

  /**
   * Entity storage.
   *
   * @var \Drupal\Core\Entity\EntityStorageInterface
   */
  protected $storage;

  /**
   * View builder.
   *
   * @var \Drupal\Core\Entity\EntityViewBuilderInterface
   */
  protected $viewBuilder;

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();
    $this->setUpEntityBundle();
    $this->file = $this->maybeCreateFile();
  }

  /**
   * Sets up entity bundle for tests.
   */
  protected function setUpEntityBundle() {
    $this->installEntitySchema('user');
    $this->installEntitySchema($this->entityType);

    /** @var \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager */
    $entity_type_manager = $this->container->get('entity_type.manager');

    $this->storage = $entity_type_manager->getStorage($this->entityType);
    $this->viewBuilder = $entity_type_manager->getViewBuilder($this->entityType);
    $this->displayRepository = $this->container->get('entity_display.repository');

    $entity_type = $this->storage->getEntityType();

    // Create the bundle.
    $bundle_storage = $entity_type_manager->getStorage($entity_type->getBundleEntityType());
    $bundle_entity = $bundle_storage->getEntityType();
    $bundle_storage
      ->create([$bundle_entity->getKey('id') => $this->bundle])
      ->save();

    $this->createEntityFields($this->fields);
  }

  /**
   * Renders an entity with the given parameters in a view mode.
   *
   * @param array $parameters
   *   (optional) Parameters to create the entity.
   *
   * @return \Drupal\Core\Entity\FieldableEntityInterface
   *   The entity.
   */
  protected function renderEntity(array $parameters = []) {
    $parameters += ['view_mode' => 'default'];

    $view_mode = $parameters['view_mode'];
    unset($parameters['view_mode']);

    $bundle_key = $this->storage->getEntityType()->getKey('bundle');
    $entity = $this->storage->create([$bundle_key => $this->bundle] + $parameters);
    $entity->save();

    $this->isolatedRender($this->viewBuilder->view($entity, $view_mode));

    return $entity;
  }

  /**
   * Creates fields on a particular entity bundle.
   *
   * @param array[] $fields
   *   The list of fields to create. Keys are the field names, values can be
   *   a string to only state the field type (with the other storage settings as
   *   default) or an array of field storage settings.
   * @param string $view_mode
   *   (optional) The view mode display to display the fields in or NULL to not
   *   add to any display. Default 'default'.
   */
  protected function createEntityFields(array $fields, $view_mode = 'default') {
    // Create fields from the class property.
    foreach ($fields as $field_name => $field_parameters) {
      $storage_settings = is_array($field_parameters)
        ? $field_parameters
        : ['type' => $field_parameters];
      $storage = FieldStorageConfig::create([
        'entity_type' => $this->entityType,
        'field_name' => $field_name,
      ] + $storage_settings);
      $storage->save();

      FieldConfig::create([
        'field_storage' => $storage,
        'bundle' => $this->bundle,
      ])->save();
    }

    if ($view_mode) {
      $display = $this->getViewDisplay($this->entityType, $this->bundle, $view_mode);

      foreach (array_keys($fields) as $field_name) {
        $display->setComponent($field_name);
      }

      $display->save();
    }
  }

  /**
   * Creates a file entity if the file module is enabled on the test.
   */
  protected function maybeCreateFile() {
    $class = get_class($this);
    while ($class) {
      if (property_exists($class, 'modules')) {
        // Only check the modules, if the $modules property was not inherited.
        $rp = new \ReflectionProperty($class, 'modules');
        if ($rp->class == $class && in_array('file', $class::$modules, TRUE)) {
          $this->installEntitySchema('file');
          $this->installSchema('file', ['file_usage']);

          $file = File::create(['uri' => 'public://file.jpg']);
          $file->setPermanent();
          $file->save();
          return $file;
        }
      }
      $class = get_parent_class($class);
    }
  }

  /**
   * Gets an entity view display for a view mode.
   *
   * @param string $view_mode
   *   The ID of the view mode display to get.
   *
   * @return \Drupal\Core\Entity\Display\EntityViewDisplayInterface
   *   The display.
   */
  protected function getViewDisplay($view_mode) {
    if ($view_mode != 'default' && !EntityViewMode::load("$this->entityType.$view_mode")) {
      $mode = EntityViewMode::create([
        'id' => "$this->entityType.$view_mode",
        'targetEntityType' => $this->entityType,
      ]);
      $mode->save();
    }

    return $this->displayRepository->getViewDisplay($this->entityType, $this->bundle, $view_mode);
  }

}
