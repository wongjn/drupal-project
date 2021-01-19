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
   *
   * @see \Drupal\Core\Render\Element\StatusMessages::generatePlaceholder()
   */
  public static function statusMessages(array $element) {
    $attributes = isset($element['#attributes']) ? $element['#attributes'] : [];

    $build = [
      '#lazy_builder' => [
        '\Drupal\{{ NAME }}\{{ UCAMEL }}LazyBuilders::renderStatusMessages',
        [$element['#display'], json_encode($attributes)],
      ],
      '#create_placeholder' => TRUE,
    ];

    // Directly create a placeholder as we need this to be placeholdered
    // regardless if this is a POST or GET request.
    // @todo remove this when https://www.drupal.org/node/2367555 lands.
    $build = \Drupal::service('render_placeholder_generator')->createPlaceholder($build);

    if ($element['#include_fallback']) {
      // Apply attributes for the fallback element.
      $attributes['data-drupal-messages-fallback'] = TRUE;
      $attributes['class'][] = 'hidden';

      return [
        'fallback' => [
          '#theme' => 'container',
          '#attributes' => $attributes,
        ],
        'messages' => $build,
      ];
    }
    return $build;
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
