<?php

namespace Drupal\Tests\{{ NAME }}\Functional;

use Drupal\Tests\BrowserTestBase;

/**
 * A test base class for this theme.
 */
abstract class ThemeFunctionalTestBase extends BrowserTestBase {

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    $this->container->get('theme_installer')->install(['{{ NAME }}'], FALSE);
    $this->container->get('theme_handler')->setDefault('{{ NAME }}');
  }

}
