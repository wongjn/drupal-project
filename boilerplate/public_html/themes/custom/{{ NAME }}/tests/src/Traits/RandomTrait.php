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
    return array_rand($icons);
  }

}
