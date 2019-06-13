<?php

namespace Drupal\{{ NAME }}_helper;

use Drupal\Component\Utility\NestedArray;
use Twig\TwigFilter;

/**
 * A class providing Drupal Twig extensions.
 */
class TwigExtension extends \Twig_Extension {

  /**
   * {@inheritdoc}
   */
  public function getFilters() {
    return [
      new TwigFilter('set_array_value', [get_class($this), 'setArrayValue']),
      new TwigFilter('append_array_value', [get_class($this), 'appendArrayValue']),
    ];
  }

  /**
   * Sets a deep level array value.
   *
   * @param array $array
   *   The array subject to set a value on.
   * @param array $parents
   *   Array list of traversal keys.
   * @param mixed $value
   *   The value to set.
   *
   * @return array
   *   The altered array.
   */
  public static function setArrayValue(array $array, array $parents, $value) {
    NestedArray::setValue($array, $parents, $value);
    return $array;
  }

  /**
   * Appends a value to a deep level array value.
   *
   * @param array $array
   *   The array subject to set a value on.
   * @param array $parents
   *   Array list of traversal keys.
   * @param mixed $value
   *   The value to append.
   *
   * @return array
   *   The altered array.
   */
  public static function appendArrayValue(array $array, array $parents, $value) {
    $values = NestedArray::getValue($array, $parents);
    $values[] = $value;

    return self::setArrayValue($array, $parents, $values);
  }

}
