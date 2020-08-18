<?php

namespace Drupal\{{ NAME }};

/**
 * Menu processor.
 */
class Menu {

  /**
   * Recursively applies a function to menu items in a menu tree.
   *
   * @param callable $callable
   *   The function to run on each item.
   * @param array $items
   *   List of menu items from template_preprocess_menu() or similar.
   * @param int $depth
   *   The depth of the menu being iterated over. For internal use.
   */
  public static function recurse(callable $callable, array &$items, $depth = 0) {
    foreach ($items as &$item) {
      if ($item['below']) {
        self::recurse($callable, $item['below'], $depth + 1);
      }

      $callable($item, $depth);
    }
  }

  /**
   * Adds external link related attributes to a menu item.
   *
   * @param array $item
   *   A single menu item from template_preprocess_menu() or similar.
   */
  public static function addExternalOptions(array $item) {
    if ($item['url']->isExternal()) {
      $item['url']->mergeOptions([
        'attributes' => [
          'target' => '_blank',
          'rel' => ['nofollow', 'noreferrer'],
        ],
      ]);
    }
  }

  /**
   * Adds class to a menu links if it is in the active trail.
   *
   * @param array $item
   *   A single menu item from template_preprocess_menu() or similar.
   */
  public static function addActiveTrailClass(array $item) {
    if ($item['in_active_trail']) {
      $item['url']->mergeOptions(['attributes' => ['class' => ['is-active-trail']]]);
      $item['attributes']->addClass('is-active-trail');
    }
  }

  /**
   * Adds link classes to a main menu link.
   *
   * @param array $item
   *   A single menu item from template_preprocess_menu() or similar.
   * @param int $depth
   *   Depth of the menu being processed.
   */
  public static function mainMenuAddClasses(array $item, $depth = 0) {
    $suffix = $depth === 0 ? 'top' : 'sub';

    $item['url']->mergeOptions([
      'attributes' => [
        'class' => [
          'c-main-menu__link',
          "c-main-menu__link--$suffix",
        ],
      ],
    ]);

    $item['attributes']->addClass(['c-main-menu__item', "c-main-menu__item--$suffix"]);
  }

}
