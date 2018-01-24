<?php

namespace Drupal\{{ NAME }}_helper;

use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Cache\CacheTagsInvalidatorInterface;
use Drupal\Core\Cache\CacheableDependencyInterface;
use Drupal\Core\Extension\ThemeHandlerInterface;

/**
 * Service helping with querying icon data from the theme's sprite sheet.
 */
class Icons implements CacheableDependencyInterface {

  /**
   * Cache ID for the icon data (width, height, titles).
   *
   * @var string
   */
  const ICON_DATA_CID = '{{ NAME }}_icons_data';

  /**
   * Cache ID for the path to the icon sheet.
   *
   * @var string
   */
  const SHEET_PATH_CID = '{{ NAME }}_icons_path';

  /**
   * Cache backend service.
   *
   * @var \Drupal\Core\Cache\CacheBackendInterface
   */
  protected $cache;

  /**
   * The cache tags invalidator.
   *
   * @var \Drupal\Core\Cache\CacheTagsInvalidatorInterface
   */
  protected $cacheTagsInvalidator;

  /**
   * The theme handler.
   *
   * @var \Drupal\Core\Extension\ThemeHandlerInterface
   */
  protected $themeHandler;

  /**
   * The set of icon data.
   *
   * @var array
   */
  protected $iconData;

  /**
   * The path to the icon sheet relative to Drupal root.
   *
   * @var string
   */
  protected $sheetPath;

  /**
   * Constructs a new IconsHandler.
   *
   * @param \Drupal\Core\Cache\CacheBackendInterface $cache
   *   Cache backend.
   * @param \Drupal\Core\Cache\CacheTagsInvalidatorInterface $cache_tags_invalidator
   *   The cache tags invalidator.
   * @param \Drupal\Core\Extension\ThemeHandlerInterface $theme_handler
   *   The theme handler.
   */
  public function __construct(CacheBackendInterface $cache, CacheTagsInvalidatorInterface $cache_tags_invalidator, ThemeHandlerInterface $theme_handler) {
    $this->cache = $cache;
    $this->cacheTagsInvalidator = $cache_tags_invalidator;
    $this->themeHandler = $theme_handler;
  }

  /**
   * Returns the path to the icon sheet.
   *
   * @param string $style
   *   (optional) The style of path to return:
   *     - <blank>: Path relative to the Drupal root (default).
   *     - 'frontend': Client-side path to be used in HTML.
   *
   * @return string
   *   The path to the icon sheet.
   */
  public function getSheetPath($style = '') {
    if (!isset($this->sheetPath)) {
      $this->sheetPath = $this->discoverSheetPath();
    }

    if ($style == 'frontend') {
      return file_url_transform_relative(file_create_url($this->sheetPath));
    }

    return $this->sheetPath;
  }

  /**
   * Return the aspect ratio of an icon.
   *
   * @return float
   *   The aspect ratio of the icon, taken from its viewBox, or 1 if the icon
   *   does not exist.
   */
  public function getAspectRatio($id) {
    $data = $this->getIconData();

    if (!isset($data[$id])) {
      return 1;
    }

    return $data[$id]['height'] / $data[$id]['width'];
  }

  /**
   * Gets list of icon options suitable for usage in forms.
   *
   * @return string[]
   *   Human readable title for each icon, keyed by its ID.
   */
  public function getSelectOptions() {
    $options = [];

    foreach ($this->getIconData() as $id => $data) {
      $options[$id] = $data['title']
        ? $data['title']
        : str_replace('-', ' ', ucfirst($id));
    }

    asort($options);
    return $options;
  }

  /**
   * Returns the set of icon data.
   *
   * @return array
   *   The set of icon data.
   */
  protected function getIconData() {
    if (!isset($this->iconData)) {
      $this->iconData = $this->discoverIconData();
    }

    return $this->iconData;
  }

  /**
   * Discovers the icon data from the sprite sheet file.
   *
   * @return array
   *   The set of icon data.
   */
  protected function discoverIconData() {
    $data = [];

    if ($cache = $this->cache->get(self::ICON_DATA_CID)) {
      $data = $cache->data;
    }
    elseif ($path = $this->getSheetPath()) {
      $xml = new \DOMDocument();
      $xml->load(drupal_realpath($path));

      foreach ($xml->getElementsByTagName('symbol') as $symbol) {
        // Skip symbols without ID attribute.
        if (!$symbol->hasAttribute('id')) {
          continue;
        }

        $viewbox = explode(' ', $symbol->getAttribute('viewBox'));
        $title = '';

        // Attempt to extract icon title from a title element.
        $title_elements = $symbol->getElementsByTagName('title');
        if ($title_elements->length > 0) {
          $title = $title_elements->item(0)->nodeValue;
        }

        $data[$symbol->getAttribute('id')] = [
          'width'  => $viewbox[2],
          'height' => $viewbox[3],
          'title'  => $title,
        ];
      }

      $this->cache->set(self::ICON_DATA_CID, $data, $this->getCacheMaxAge(), $this->getCacheTags());
    }

    return $data;
  }

  /**
   * Discovers the icon sheet file.
   *
   * @return string
   *   The path to the icon sheet relative to Drupal root.
   */
  protected function discoverSheetPath() {
    $path = '';

    if ($cache = $this->cache->get(self::SHEET_PATH_CID)) {
      $path = $cache->data;
    }

    // If no cached path or cached path points to a non-existent file:
    if (!$path || !file_exists($path)) {
      $this->cacheTagsInvalidator->invalidateTags($this->getCacheTags());

      $dir = $this->themeHandler->getTheme('{{ NAME }}')->getPath() . '/dist';
      $files = file_scan_directory($dir, '/icons-.+\.svg$/', ['recurse' => FALSE]);

      if (!empty($files)) {
        $path = reset($files)->uri;
        $this->cache->set(self::SHEET_PATH_CID, $path, $this->getCacheMaxAge(), $this->getCacheTags());
      }
    }

    return $path;
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheContexts() {
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheMaxAge() {
    return CacheBackendInterface::CACHE_PERMANENT;
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheTags() {
    return ['{{ NAME }}_icons'];
  }

}
