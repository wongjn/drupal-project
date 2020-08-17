<?php

namespace Drupal\{{ NAME }};

use Drupal\Core\Render\Element\RenderCallbackInterface;
use Drupal\Core\Template\Attribute;

/**
 * Static class to contain the theme's #pre_render callbacks.
 */
class {{ UCAMEL }}PreRender implements RenderCallbackInterface {

  /**
   * Pre-render callback for the 'processed_text' render element.
   */
  public static function processedText(array $element) {
    if (\Drupal::routeMatch()->getRouteName() != 'media.filter.preview') {
      // Add wrapper to apply class to style WYSIWYG-entered markup.
      $element['#theme_wrappers'][] = 'container';
      $element['#attributes']['class'][] = 'c-text-body';
    }

    return $element;
  }

  /**
   * Pre-render callback for the 'status_messages' render element.
   */
  public static function statusMessages(array $element) {
    // Add extra class into fallback element.
    if (isset($element['fallback'])) {
      // phpcs:ignore
      // $element['fallback']['#markup'] = str_replace('class="', 'class="l-container__module ', $element['fallback']['#markup']);
      $element['fallback']['#markup'] = str_replace('class="', 'class="container ', $element['fallback']['#markup']);
    }

    return $element;
  }

  /**
   * Pre-render callback for the 'view' render element.
   */
  public static function view(array $element) {
    // Remove default unnecessary theme wrapper for view elements.
    if (isset($element['#theme_wrappers'])) {
      $key = array_search('container', $element['#theme_wrappers']);

      if (is_int($key)) {
        unset($element['#theme_wrappers'][$key]);
      }
    }

    if (isset($element['#attributes'])) {
      // Remove unused 'views-element-container' HTML class.
      $element['#attributes'] = (new Attribute($element['#attributes']))
        ->removeClass('views-element-container')
        ->toArray();
    }

    return $element;
  }

}
