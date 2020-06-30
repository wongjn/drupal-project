<?php

namespace Drupal\Tests\{{ NAME }}\Traits;

/**
 * Random generation value helper methods.
 */
trait RandomTrait {

  /**
   * Get a random icon.
   *
   * @return string
   *   A random icon ID.
   */
  protected function randomIcon() {
    $icons = $this->container->get('ex_icons.manager')->getDefinitions();
    unset($icons['ex_icon_null']);
    return array_rand($icons);
  }

}
