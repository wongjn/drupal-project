<?php

namespace Drupal\Tests\{{ NAME }}\Traits;

/**
 * Provides a method to set the default theme.
 *
 * This trait is meant to be used only by test classes.
 */
trait ThemeSetTrait {

  /**
   * Sets a theme as the default theme.
   *
   * @param string $theme
   *   The name of the theme to make default.
   */
  protected function setDefaultTheme($theme = '{{ NAME }}') {
    $this->container->get('theme_installer')->install([$theme], FALSE);
    $this->container->get('theme_handler')->setDefault($theme);
  }

}
