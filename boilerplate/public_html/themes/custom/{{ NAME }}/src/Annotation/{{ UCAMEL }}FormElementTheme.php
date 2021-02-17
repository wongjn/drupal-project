<?php

namespace Drupal\{{ NAME }}\Annotation;

use Drupal\Component\Annotation\Plugin;

/**
 * Defines a {{ UCAMEL }}FormElementTheme annotation object.
 *
 * @Annotation
 *
 * @see \Drupal\{{ NAME }}\{{ UCAMEL }}FormElementThemePluginManager
 * @see \Drupal\{{ NAME }}\{{ UCAMEL }}FormElementThemeInterface
 */
class {{ UCAMEL }}FormElementTheme extends Plugin {

  /**
   * The plugin ID.
   *
   * @var string
   */
  public $id;

  /**
   * The name of the plugin class.
   *
   * This is not provided manually, it will be added by the discovery mechanism.
   *
   * @var string
   */
  public $class;

  /**
   * An integer to determine the weight of this type relative to other plugins.
   *
   * @var int
   */
  public $weight = 0;

}
