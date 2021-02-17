<?php

namespace Drupal\{{ NAME }};

/**
 * Static class of helper functions for render elements.
 */
class Element {

  /**
   * Gets the render key for applying attributes to an render element's wrapper.
   *
   * @param array $element
   *   The render element.
   *
   * @return string
   *   The attribute key for the wrapper HTML element for the render element.
   */
  public static function getWrapperAttributesKey(array $element) {
    $attributes_key = '#attributes';

    if (isset($element['#type'])) {
      foreach (static::getThemeWrappers($element) as $key => $value) {
        if (strpos(is_array($value) ? $key : $value, 'form_element') === 0) {
          $attributes_key = '#wrapper_attributes';
          break;
        }
      }
    }

    return $attributes_key;
  }

  /**
   * Gets the resolved theme wrappers for a render element.
   *
   * @param array $element
   *   The render element.
   *
   * @return array
   *   The resolved theme wrappers for the element.
   */
  public static function getThemeWrappers(array $element) {
    if (isset($element['#theme_wrappers'])) {
      return $element['#theme_wrappers'];
    }

    if (isset($element['#type'])) {
      return \Drupal::service('element_info')->getInfoProperty($element['#type'], '#theme_wrappers', []);
    }

    return [];
  }

  /**
   * Replaces a theme wrapper in for a render element.
   *
   * @param array $element
   *   The render element.
   * @param string $subject
   *   The theme function to replace.
   * @param string $replace
   *   The theme function to replace with.
   *
   * @return array
   *   The resolved theme wrappers list.
   */
  public static function replaceThemeWrapper(array $element, $subject, $replace) {
    $wrappers = static::getThemeWrappers($element);

    if (in_array($subject, $wrappers)) {
      $key = array_search($subject, $wrappers);
      $wrappers[$key] = $replace;
      return $wrappers;
    }

    if (isset($wrappers[$subject])) {
      $index = array_search($subject, array_keys($wrappers), TRUE);
      return array_merge(
        array_slice($wrappers, 0, $index, TRUE),
        [$replace => $wrappers[$subject]],
        array_slice($wrappers, $index + 1, NULL, TRUE)
      );
    }

    return $wrappers;
  }

}
