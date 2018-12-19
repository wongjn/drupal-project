<?php

namespace Drupal\{{ NAME }};

/**
 * Menu data processor.
 */
class MenuData {

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
