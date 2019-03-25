<?php

namespace Drupal\Tests\{{ NAME }}_helper\Kernel;

use Drupal\KernelTests\KernelTestBase;
use Drupal\system\Entity\Menu;
use Drupal\menu_link_content\Entity\MenuLinkContent;

/**
 * Tests the menu link tree service decorator.
 */
class {{ UCAMEL }}MenuLinkTreeTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  public static $modules = [
    '{{ NAME }}_helper',
    '{{ NAME }}_helper_test',
    'menu_link_content',
    'link',
    'system',
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    // Create test menu.
    Menu::create([
      'id' => 'menu_test',
      'label' => 'Test menu',
    ])->save();

    $this->installEntitySchema('menu_link_content');

    $base_options = [
      'provider' => '{{ NAME }}_helper',
      'menu_name' => 'menu_test',
    ];

    // Create menu structure.
    $parent = MenuLinkContent::create($base_options + [
      'title' => 'Parent Link',
      'expanded' => FALSE,
      'link' => ['uri' => 'https://example.com'],
    ]);
    $parent->save();

    $child = MenuLinkContent::create($base_options + [
      'title' => 'Child Link',
      'link' => ['uri' => 'https://example.com'],
      'parent' => $parent->getPluginId(),
    ]);
    $child->save();
  }

  /**
   * Tests all parents are expanded.
   */
  public function testExpandedParent() {
    $menu_tree = \Drupal::service('menu.link_tree');
    $parameters = $menu_tree->getCurrentRouteMenuTreeParameters('menu_test');
    $tree = $menu_tree->load('menu_test', $parameters);

    $render_array = $menu_tree->build($tree);
    $this->setRawContent($this->render($render_array));
    $this->assertText('Child Link');
  }

}
