<?php

namespace Drupal\{{ NAME }}_helper;

/**
 * Contains methods for parsing data for RDF schema.
 */
class RDF {

  /**
   * Extracts numerical value from a text field.
   *
   * @param array $data
   *   The array containing the 'value' element.
   *
   * @return string
   *   Returns numerical value.
   */
  public static function parseNumber(array $data) {
    if (preg_match('/(?:\d+[ ,.])+/', $data['value'], $number)) {
      return str_replace([',', ' '], '', $number[0]);
    }
  }

  /**
   * Extracts URL value from a link field.
   *
   * @param array $data
   *   The array containing the 'uri' element.
   *
   * @return string
   *   Returns the 'uri' value.
   */
  public static function url(array $data) {
    return $data['uri'];
  }

  /**
   * Extracts URL value from an file/image field.
   *
   * @param array $data
   *   The array containing the 'target_id' value.
   *
   * @return string
   *   Returns the url to the file.
   */
  public static function fileUrl(array $data) {
    if ($data['target_id']) {
      return \Drupal::entityTypeManager()
        ->getStorage('file')
        ->load($data['target_id'])
        ->url();
    }
  }

  /**
   * Returns the 'value' property verbatim.
   *
   * Useful when the stored value is the one wanted to be mapped to RDF, not
   * the rendered value.
   *
   * @param array $data
   *   The array containing the 'value' value.
   *
   * @return string
   *   The 'value' value.
   */
  public static function value(array $data) {
    return $data['value'];
  }

}
