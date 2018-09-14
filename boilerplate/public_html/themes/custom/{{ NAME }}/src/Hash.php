<?php

namespace Drupal\{{ NAME }};

/**
 * Hashing utility static class.
 */
class Hash {

  /**
   * The cache backend.
   *
   * @var \Drupal\Core\Cache\CacheBackendInterface
   */
  protected static $cache;

  /**
   * Gets the cache backend service.
   *
   * @return \Drupal\Core\Cache\CacheBackendInterface
   *   The cache backend service.
   */
  protected static function getCache() {
    if (!self::$cache) {
      self::$cache = \Drupal::cache('discovery');
    }

    return self::$cache;
  }

  /**
   * Gets the hash for a file.
   *
   * @param string $file_path
   *   The path to the file, relative to the Drupal root.
   *
   * @return string
   *   The MD5 hash of the content of the file.
   */
  public static function getHash($file_path) {
    $cid = "{{ NAME }}:hash:$file_path";

    if ($cache = self::getCache()->get($cid)) {
      return $cache->data;
    }

    $hash = md5_file(DRUPAL_ROOT . "/$file_path");
    self::getCache()->set($cid, $hash);

    return $hash;
  }

}
