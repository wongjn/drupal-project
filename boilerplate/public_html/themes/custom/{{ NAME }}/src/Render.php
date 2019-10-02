<?php

namespace Drupal\{{ NAME }};

use Drupal\Core\Template\Attribute;

/**
 * Static class helper for rendering.
 */
class Render {

  /**
   * View element pre render callback.
   */
  public static function preRenderViewElement(array $element) {
    // Remove default unnecessary theme wrapper for view elements.
    if (isset($element['#theme_wrappers'])) {
      $key = array_search('container', $element['#theme_wrappers']);

      if (is_int($key)) {
        unset($element['#theme_wrappers'][$key]);
      }
    }

    // Remove unused 'views-element-container' HTML class.
    $element['#attributes'] = (new Attribute($element['#attributes']))
      ->removeClass('views-element-container')
      ->toArray();

    return $element;
  }

  /**
   * Processed text element pre render callback.
   */
  public static function preRenderProcessedText(array $element) {
    // Add wrapper to apply class to style WYSIWYG-entered markup.
    $element['#theme_wrappers'][] = 'container';
    $element['#attributes']['class'][] = 'c-text-body';

    return $element;
  }

}
