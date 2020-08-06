<?php

namespace Drupal\{{ NAME }}_helper\Commands;

use Drupal\Core\Asset\LibraryDiscoveryInterface;
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
   * Constructs a new {{ UCAMEL }}Commands object.
   *
   * @param \Drupal\Core\Asset\LibraryDiscoveryInterface $library_discovery
   *   The library discovery service.
   */
  public function __construct(LibraryDiscoveryInterface $library_discovery) {
    parent::__construct();
    $this->libraryDiscovery = $library_discovery;
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

}
