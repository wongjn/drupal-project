<?php

namespace Drupal\{{ NAME }}_helper\Commands;

use Drupal\Component\Utility\Html;
use Drupal\Core\Asset\LibraryDiscoveryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drush\Commands\DrushCommands;

/**
 * A Drush commandfile.
 */
class {{ UCAMEL }}Commands extends DrushCommands {

  /**
   * The library discovery service.
   *
   * @var \Drupal\Core\Asset\LibraryDiscoveryInterface
   */
  protected $libraryDiscovery;

  /**
   * The block storage.
   *
   * @var \Drupal\Core\Entity\EntityStorageInterface
   */
  protected $blockStorage;

  /**
   * The block content storage.
   *
   * @var \Drupal\Core\Entity\EntityStorageInterface
   */
  protected $blockContentStorage;

  /**
   * Constructs a new {{ UCAMEL }}Commands object.
   *
   * @param \Drupal\Core\Asset\LibraryDiscoveryInterface $library_discovery
   *   The library discovery service.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   */
  public function __construct(LibraryDiscoveryInterface $library_discovery, EntityTypeManagerInterface $entity_type_manager) {
    parent::__construct();
    $this->libraryDiscovery = $library_discovery;
    $this->blockStorage = $entity_type_manager->getStorage('block');
    $this->blockContentStorage = $entity_type_manager->getStorage('block_content');
  }

  /**
   * Adds libraries cache to the cache list.
   *
   * @param array $types
   *   The cache types.
   *
   * @hook on-event cache-clear
   */
  public function cacheTypes(array &$types) {
    $types['libraries'] = [$this, 'clearLibrariesCache'];
  }

  /**
   * Clears the discovered library definitions cache.
   */
  public function clearLibrariesCache() {
    $this->libraryDiscovery->clearCachedDefinitions();
  }

  /**
   * Creates missing custom blocks referenced from site config.
   *
   * @command create-custom-blocks
   *
   * @aliases ccb
   */
  public function createCustomBlocks() {
    $blocks = $this->blockStorage
      ->loadByProperties(['settings.provider' => 'block_content']);

    foreach ($blocks as $block) {
      list(, $type, $uuid) = explode(':', $block->getDependencies()['content'][0]);

      if (!empty($this->blockContentStorage->loadByProperties(['uuid' => $uuid]))) {
        continue;
      }

      $custom_block = $this->blockContentStorage->create([
        'uuid' => $uuid,
        'type' => $type,
        'info' => Html::escape($block->label()),
      ]);

      $args = [
        'name' => $custom_block->info->value,
        'block' => $block->id(),
      ];
      if ($custom_block->save()) {
        $this->logger()->success(
          dt('Created the custom block "{name}" for the {block} block.', $args)
        );
      }
      else {
        $this->logger()->warn(
          dt('Failed to create a custom block for the {block} block.', $args)
        );
      }
    }
  }

}
