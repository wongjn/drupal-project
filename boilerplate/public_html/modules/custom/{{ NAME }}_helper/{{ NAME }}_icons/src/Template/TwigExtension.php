<?php

namespace Drupal\{{ NAME }}_icons\Template;

/**
 * A class providing Drupal Twig extensions.
 */
class TwigExtension extends \Twig_Extension {

  /**
   * {@inheritdoc}
   */
  public function getFunctions() {
    return [
      new \Twig_SimpleFunction('icon', [$this, 'getIcon']),
    ];
  }

  /**
   * Gets an icon.
   *
   * @param string $icon
   *   The id of the icon.
   * @param array|\Drupal\Core\Template\Attribute $attributes
   *   An optional array or Attribute object of SVG attributes.
   *
   * @return array
   *   A render array representing an icon.
   */
  public function getIcon($icon, $attributes = []) {
    return [
      '#theme' => 'icon',
      '#id' => $icon,
      '#attributes' => $attributes,
    ];
  }

}
