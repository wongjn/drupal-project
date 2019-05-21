<?php

namespace Drupal\Tests\{{ NAME }}\Kernel;

use Drupal\KernelTests\KernelTestBase;

/**
 * A test base class for this theme.
 */
abstract class ThemeKernelTestBase extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  public static $modules = [
    'system',
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    $this->container->get('theme_installer')->install(['{{ NAME }}'], FALSE);
    $this->container->get('theme_handler')->setDefault('{{ NAME }}');
  }

}
