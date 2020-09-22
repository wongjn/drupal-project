<?php

namespace Drupal\{{ NAME }};

/**
 * Static class of helper functions for forms.
 */
class Form {

  /**
   * Gets the render key for applying attributes to an render element's wrapper.
   *
   * @param array $element
   *   The (form) element.
   *
   * @return string
   *   The attribute key for the wrapper HTML element for the form element.
   */
  public static function getWrapperAttributeKey(array $element) {
    $attributes_key = '#attributes';

    // If not a container type:
    if (isset($element['#type']) && $element['#type'] !== 'container') {
      // Get any theme_wrappers.
      $theme_wrapper_elements = isset($element['#theme_wrappers'])
        ? $element['#theme_wrappers']
        : \Drupal::service('element_info')->getInfoProperty($element['#type'], '#theme_wrappers', []);
      $theme_wrapper_elements[] = $element['#type'];

      foreach ($theme_wrapper_elements as $key => $value) {
        if (strpos(is_array($value) ? $key : $value, 'form_element') === 0) {
          $attributes_key = '#wrapper_attributes';
          break;
        }
      }
    }

    return $attributes_key;
  }

}
