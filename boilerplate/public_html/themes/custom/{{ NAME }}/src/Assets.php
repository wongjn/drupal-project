<?php

namespace Drupal\{{ NAME }};

/**
 * Assets utility static class.
 */
class Assets {

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
   * Gets the hash for an asset file.
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

  /**
   * Alters module/nomodule script tags.
   *
   * Differential serving is used to deliver smaller, more modern JS to browsers
   * that support it while also having a more verbose version for older ones.
   * However, some browsers have quirks whereby they do not stick to the
   * specifications for type="module" or nomodule attributes, so some pre-
   * rendering is done here to work-around these bugs.
   *
   * @param array $element
   *   An associative array containing the properties of the html tag.
   *   Properties used: #tag, #value, #attributes.
   *
   * @return array
   *   The HTML tag render element.
   */
  public static function preRenderHtmlTag(array $element) {
    if ($element['#tag'] == 'script' && !$element['#value']) {
      // If type is module:
      if (isset($element['#attributes']['type']) && $element['#attributes']['type'] == 'module') {
        // Assign property on global if ESM is used and import script.
        $element['#value'] = sprintf('window._ESM=!0;import"%s"', $element['#attributes']['src']);
        unset($element['#attributes']['src']);
      }
      // If nomodule fallback script:
      elseif (isset($element['#attributes']['nomodule']) && $element['#attributes']['nomodule']) {
        // Check whether ESM has been used before injecting script tag to load
        // the fallback script. This is needed since Edge 18, Safari 10.1 will
        // still parse this script even though they support ES modules.
        $element['#value'] = sprintf('!function(g,d,s){g._ESM||((s=(s=(s=d.getElementsByTagName("script"))[s.length-1]).parentNode.insertBefore(d.createElement("script"),s)).defer=!0,s.src="%s")}(window,document);', $element['#attributes']['src']);
        unset($element['#attributes']['src']);
      }
    }

    return $element;
  }

}