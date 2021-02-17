<?php

namespace Drupal\{{ NAME }}\Plugin\{{ NAME }}\FormElementTheme;

use Drupal\Core\Plugin\PluginBase;
use Drupal\{{ NAME }}\FormElementThemeInterface;

/**
 * Form element theming plugin for wrapper render elements.
 *
 * @{{ UCAMEL }}FormElementTheme(id = "wrappers")
 */
class Wrappers extends PluginBase implements FormElementThemeInterface {

  /**
   * {@inheritdoc}
   */
  public function preRenderElement(array $element) {
    $element['#attributes']['class'][] = static::CUMULATIVE_SPACING_CLASS;
    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public static function isApplicable(array $element) {
    return isset($element['#type']) && in_array($element['#type'], [
      'actions',
      'container',
      'fieldset',
    ]);
  }

}
