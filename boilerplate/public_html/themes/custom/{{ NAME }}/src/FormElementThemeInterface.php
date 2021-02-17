<?php

namespace Drupal\{{ NAME }};

use Drupal\Component\Plugin\DerivativeInspectionInterface;
use Drupal\Component\Plugin\PluginInspectionInterface;

/**
 * Interface definition for form element theming plugins.
 */
interface FormElementThemeInterface extends PluginInspectionInterface, DerivativeInspectionInterface {

  /**
   * Cumulative spacing CSS class name.
   */
  const CUMULATIVE_SPACING_CLASS = 'u-mv-40';

  /**
   * Enhances the render element, in the pre-render stage.
   *
   * @param array $element
   *   The render element to enhance.
   *
   * @return array
   *   The modified element.
   */
  public function preRenderElement(array $element);

  /**
   * Whether this plugin is applicable to the given render element.
   *
   * @param array $element
   *   The render element.
   *
   * @return bool
   *   Returns TRUE if applicable, false otherwise.
   */
  public static function isApplicable(array $element);

}
