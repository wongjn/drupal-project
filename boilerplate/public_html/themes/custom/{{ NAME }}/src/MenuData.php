<?php

namespace Drupal\{{ NAME }};

use Drupal\Component\Render\MarkupInterface;
use Drupal\Core\Url;

/**
 * Menu data processor.
 */
class MenuData {

  /**
   * Translates menu tree into JSON-encodable data.
   *
   * @param array $menu_items
   *   List of menu items from template_preprocess_menu() or similar.
   * @param int $depth
   *   Internal variable for depth index of the menu list being processed.
   *
   * @return array
   *   The processed set of menu items.
   */
  public static function process(array $menu_items, $depth = 0) {
    $items = [];

    foreach ($menu_items as $id => $item) {
      $items[] = [
        'id' => $id,
        'depth' => $depth,
        'title' => $item['title'],
        'url' => self::getUrlInfo($item['url']),
        'below' => self::process($item['below'], $depth + 1),
      ];
    }

    return $items;
  }

  /**
   * Translates a URL object into JSON-encodable data.
   *
   * @param \Drupal\Core\Url $url
   *   The url to translate.
   *
   * @return array
   *   Translated data.
   *
   * @see ::processMenuData()
   */
  protected static function getUrlInfo(Url $url) {
    $info = [
      'url' => $url->toString(),
      'external' => $url->isExternal(),
      'query' => '',
      'systemPath' => '',
    ];

    if (!$info['external']) {
      $query = $url->getOption('query') ? : [];

      // Ensure that query values are strings.
      array_walk($query, function (&$value) {
        if ($value instanceof MarkupInterface) {
          $value = (string)$value;
        }
      });

      // Add easy access query parameter information.
      if (!empty($query)) {
        ksort($query);
        $info['query'] = json_encode($query);
      }

      // Add internal system path information where available.
      if ($url->isRouted()) {
        // @todo System path is deprecated - use route name and parameters.
        $system_path = $url->getInternalPath();
        // Special case for the front page.
        $info['systemPath'] = $system_path == '' ? '<front>' : $system_path;
      }
    }

    return $info;
  }

  /**
   * Recursively adds external link related attributes to a menu tree.
   *
   * @param array $items
   *   List of menu items from template_preprocess_menu() or similar.
   */
  public static function addExternalOptions(array $items) {
    foreach ($items as $item) {
      if ($item['below']) {
        self::addExternalOptions($item['below']);
      }

      if (!$item['url']->isExternal()) {
        continue;
      }

      $item['url']->mergeOptions([
        'attributes' => [
          'target' => '_blank',
          'rel' => ['nofollow', 'noopener'],
        ],
      ]);
    }
  }

}
