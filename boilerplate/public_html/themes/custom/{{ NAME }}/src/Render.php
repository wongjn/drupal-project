<?php

namespace Drupal\{{ NAME }};

use Drupal\Core\Security\TrustedCallbackInterface;
use Drupal\Core\Template\Attribute;

/**
 * Static class helper for rendering.
 */
class Render implements TrustedCallbackInterface {

  /**
   * {@inheritdoc}
   */
  public static function trustedCallbacks() {
    return [
      'preRenderProcessedText',
      'preRenderViewElement',
    ];
  }

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

    if (isset($element['#attributes'])) {
      // Remove unused 'views-element-container' HTML class.
      $element['#attributes'] = (new Attribute($element['#attributes']))
        ->removeClass('views-element-container')
        ->toArray();
    }

    return $element;
  }

  /**
   * Processed text element pre render callback.
   */
  public static function preRenderProcessedText(array $element) {
    if (\Drupal::routeMatch()->getRouteName() != 'media.filter.preview') {
      // Add wrapper to apply class to style WYSIWYG-entered markup.
      $element['#theme_wrappers'][] = 'container';
      $element['#attributes']['class'][] = 'c-text-body';
    }

    return $element;
  }

}
