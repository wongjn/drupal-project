<?php

namespace Drupal\{{ NAME }}_icons\Commands;

use Drush\Commands\DrushCommands;
use Drupal\{{ NAME }}_icons\Manager;

/**
 * A Drush commandfile.
 */
class {{ UCAMEL }}IconsCommands extends DrushCommands {

  /**
   * The icons manager service.
   *
   * @var \Drupal\{{ NAME }}_icons\Manager
   */
  protected $iconsManager;

  /**
   * Constructs a new {{ UCAMEL }}IconsCommands.
   *
   * @param \Drupal\{{ NAME }}_icons\Manager $icons_manager
   *   The icons manager service.
   */
  public function __construct(Manager $icons_manager) {
    parent::__construct();
    $this->iconsManager = $icons_manager;
  }

  /**
   * Modifies drush cache list.
   *
   * @param array $types
   *   The cache types.
   *
   * @hook on-event cache-clear
   */
  public function cacheTypes(array &$types) {
    $types['icons'] = [$this, 'clearIconsCache'];
  }

  /**
   * Clears the icons cache.
   */
  public function clearIconsCache() {
    $this->iconsManager->rebuildCache();
  }

}
