<?php

namespace Drupal\Tests\{{ NAME }}_helper\Kernel;

use Drupal\Core\Menu\MenuTreeParameters;
use Drupal\KernelTests\KernelTestBase;

/**
 * Tests static menu links modifications.
 *
 * @group {{ NAME }}_helper
 */
class StaticMenuLinksAlterTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'system',
    '{{ NAME }}_helper',
    '{{ NAME }}_helper_test',
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->installConfig('system');

    $this->container
      ->get('plugin.manager.menu.link')
      ->rebuild();
  }

  /**
   * Tests static menu link removal on certain menus.
   *
   * @dataProvider linkRemovalMenuProvider
   */
  public function testLinkRemoval($menu_name, $removed = TRUE) {
    $menu_tree = $this->container
      ->get('menu.link_tree')
      ->load($menu_name, new MenuTreeParameters());
    $this->{$removed ? 'assertEmpty' : 'assertNotEmpty'}($menu_tree);
  }

  /**
   * Provides menus to test static link removal.
   *
   * @return array
   *   Menu IDs to test static link removal.
   */
  public function linkRemovalMenuProvider() {
    return [
      ['footer'],
      ['main'],
      ['admin', FALSE],
    ];
  }

}
