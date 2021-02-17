<?php

namespace Drupal\{{ NAME }}\Plugin\{{ NAME }}\FormElementTheme;

use Drupal\Core\Plugin\PluginBase;
use Drupal\{{ NAME }}\FormElementThemeInterface;

/**
 * Form element theming plugin to stop recursion and avoid any modifications.
 *
 * @{{ UCAMEL }}FormElementTheme(id = "stop_recurse")
 */
class StopRecurse extends PluginBase implements FormElementThemeInterface {

  /**
   * {@inheritdoc}
   */
  public function preRenderElement(array $element) {
    $element['#{{ NAME }}_no_recurse'] = TRUE;

    $attributes_key = $element['#type'] == 'checkboxes'
      ? '#attributes'
      : '#wrapper_attributes';
    $element[$attributes_key]['class'][] = static::CUMULATIVE_SPACING_CLASS;
    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public static function isApplicable(array $element) {
    return isset($element['#type']) && in_array($element['#type'], [
      'checkbox',
      'checkboxes',
    ]);
  }

}
