<?php

namespace Drupal\{{ NAME }};

/**
 * Menu processor.
 */
class Menu {

  /**
   * Recursively applies a function to menus in a menu tree.
   *
   * @param callable $callable
   *   The function to run on each item.
   * @param array $items
   *   List of menu items from template_preprocess_menu() or similar.
   * @param int $depth
   *   The depth of the menu being iterated over. For internal use.
   */
  public static function recursiveMenuApply(callable $callable, array &$items, $depth = 0) {
    foreach ($items as &$item) {
      if ($item['below']) {
        self::recursiveMenuApply($callable, $item['below'], $depth + 1);
      }

      $callable($item, $depth);
    }
  }

  /**
   * Recursively adds external link related attributes to a menu tree.
   *
   * @param array $item
   *   A single menu item from template_preprocess_menu() or similar.
   */
  public static function addExternalOptions(array $item) {
    if ($item['url']->isExternal()) {
      $item['url']->mergeOptions([
        'attributes' => [
          'target' => '_blank',
          'rel' => ['nofollow', 'noopener'],
        ],
      ]);
    }
  }

  /**
   * Recursively adds link classes to the main menu tree.
   *
   * @param array $item
   *   A single menu item from template_preprocess_menu() or similar.
   * @param int $depth
   *   Depth of the menu being processed.
   */
  public static function addMainMenuLinkClasses(array $item, $depth = 0) {
    $item['url']->mergeOptions([
      'attributes' => [
        'class' => [
          's-main-menu__link',
          $depth === 0 ? 's-main-menu__link--top' : 's-main-menu__link--sub',
          $item['in_active_trail'] ? 'is-active-trail' : '',
        ],
      ],
    ]);
  }

}
