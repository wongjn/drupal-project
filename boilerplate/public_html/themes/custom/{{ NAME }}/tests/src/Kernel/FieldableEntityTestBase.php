<?php

namespace Drupal\Tests\{{ NAME }}\Kernel;

use Drupal\Tests\{{ NAME }}\Traits\EntityTestTrait;

/**
 * Base class for fieldable entity tests.
 */
abstract class FieldableEntityTestBase extends ThemeKernelTestBase {

  use EntityTestTrait;

  /**
   * {@inheritdoc}
   */
  protected static $modules = ['field', 'user'];

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

}
