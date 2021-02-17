<?php

namespace Drupal\{{ NAME }}\Plugin\{{ NAME }}\FormElementTheme;

use Drupal\Core\Plugin\PluginBase;
use Drupal\{{ NAME }}\Element;
use Drupal\{{ NAME }}\FormElementThemeInterface;

/**
 * Form element theming plugin for 'form_element' render elements.
 *
 * @{{ UCAMEL }}FormElementTheme(id = "form_element")
 */
class FormElement extends PluginBase implements FormElementThemeInterface {

  /**
   * {@inheritdoc}
   */
  public function preRenderElement(array $element) {
    $element['#theme_wrappers'] = Element::replaceThemeWrapper($element, 'form_element', 'form_element__theme');
    $element['#wrapper_attributes']['class'][] = static::CUMULATIVE_SPACING_CLASS;
    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public static function isApplicable(array $element) {
    $wrappers = Element::getThemeWrappers($element);
    return in_array('form_element', $wrappers) || isset($wrappers['form_element']);
  }

}
