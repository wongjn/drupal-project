<?php

namespace Drupal\Tests\{{ NAME }}\Functional\Block;

use Drupal\menu_link_content\Entity\MenuLinkContent;
use Drupal\system\Entity\Menu;
use Drupal\Tests\block\Traits\BlockCreationTrait;
use Drupal\Tests\{{ NAME }}\Kernel\ThemeKernelTestBase;
use Symfony\Component\HttpFoundation\Request;

/**
 * Tests output for the main menu block.
 *
 * @group {{ NAME }}
 */
class MainSystemMenuBlockTest extends ThemeKernelTestBase {

  use BlockCreationTrait;

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'block',
    'link',
    'menu_link_content',
    'system',
    'user',
  ];

  /**
   * The main menu block under test.
   *
   * @var \Drupal\block\Entity\Block
   */
  protected $block;

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    $this->installSchema('system', ['sequences']);
    $this->installSchema('user', ['users_data']);
    $this->installEntitySchema('menu_link_content');
    $this->installEntitySchema('user');

    Menu::create(['id' => 'main'])->save();

    $parent = MenuLinkContent::create([
      'title' => 'Parent 1',
      'menu_name' => 'main',
      'link' => 'https://example.com',
    ]);
    $parent->save();

    $child = MenuLinkContent::create([
      'title' => 'Child Level 1',
      'menu_name' => 'main',
      'parent' => $parent->getPluginId(),
      'link' => 'https://example.com/child',
    ]);
    $child->save();

    MenuLinkContent::create([
      'title' => 'Child Level Deep',
      'menu_name' => 'main',
      'parent' => $child->getPluginId(),
      'link' => 'https://example.com/child/grandchild',
    ])->save();

    $this->block = $this->placeBlock('system_menu_block:main', ['expand_all_items' => TRUE]);
  }

  /**
   * Tests base output.
   */
  public function testBaseOutput() {
    $this->isolatedRender($this->block->getPlugin()->build());

    $elements = $this->cssSelect('[class="js-main-menu c-main-menu is-menu-loading"]');
    $this->assertCount(1, $elements, 'Main menu wrapper.');

    $elements = $this->cssSelect('.c-main-menu > ul[class="c-main-menu__top-menu"]');
    $this->assertCount(1, $elements, 'Top level main menu.');

    $elements = $this->cssSelect('.c-main-menu__top-menu > li > a[class="c-main-menu__link c-main-menu__link--top"]');
    $this->assertCount(1, $elements, 'Top level link.');

    $elements = $this->cssSelect('.c-main-menu__link--top + ul[class="c-main-menu__sub-menu"]');
    $this->assertCount(1, $elements, 'Sub-level menu list.');

    $elements = $this->cssSelect('[class="c-main-menu__sub-menu"] > li > a[class="c-main-menu__link c-main-menu__link--sub"]');
    $this->assertCount(1, $elements, 'Sub-level menu link.');

    $elements = $this->cssSelect('.c-main-menu__link--sub + ul[class="c-main-menu__sub-menu c-main-menu__sub-menu--deep"]');
    $this->assertCount(1, $elements, 'Deep level menu list.');

    $elements = $this->cssSelect('.c-main-menu__sub-menu--deep > li > a[class="c-main-menu__link c-main-menu__link--sub"]');
    $this->assertCount(1, $elements, 'Deep level menu link.');

    $elements = $this->cssSelect('.c-main-menu > [class="c-main-menu__drawer"]');
    $this->assertCount(1, $elements, 'Drawer button wrapper.');

    $elements = $this->cssSelect('.c-main-menu__drawer button[class="c-main-menu__open-btn"]');
    $this->assertCount(1, $elements, 'Drawer open button.');
  }

  /**
   * Tests output with line break state-saving cookie.
   */
  public function testLineBreakCookieOutput() {
    /** @var \Symfony\Component\HttpFoundation\RequestStack $request_stack */
    $request_stack = $this->container->get('request_stack');

    for ($i = 0; $i < 3; $i++) {
      MenuLinkContent::create([
        'title' => $this->randomMachineName(),
        'menu_name' => 'main',
        'link' => 'https://example.com/',
      ])->save();
    }

    $request_stack->push(Request::create('/', 'GET', [], ['{{ NAME }}_menu_break' => 1]));
    $this->isolatedRender($this->block->getPlugin()->build());

    $elements = $this->cssSelect('.c-main-menu__top-menu.is-compact');
    $this->assertCount(1, $elements, 'Main menu wrapper has "is-compact" class with line break of 1.');

    $request_stack->push(Request::create('/', 'GET', [], ['{{ NAME }}_menu_break' => 2]));
    $this->isolatedRender($this->block->getPlugin()->build());

    $elements = $this->cssSelect('.c-main-menu__top-menu > li[style*="visibility:hidden"]');
    $this->assertCount(2, $elements, 'Top-level menu items hidden per line break value.');
  }

  /**
   * Tests out with drawer open button.
   */
  public function testDrawerWrapperCookieOutput() {
    $this->isolatedRender($this->block->getPlugin()->build());

    $elements = $this->cssSelect('.c-main-menu__drawer[style*="display:none"]');
    $this->assertCount(1, $elements, 'Drawer button wrapper has "display: none" with no cookie set.');

    $this->container
      ->get('request_stack')
      ->push(Request::create('/', 'GET', [], ['{{ NAME }}_menu_drawer' => '1']));
    $this->isolatedRender($this->block->getPlugin()->build());

    $elements = $this->cssSelect('.c-main-menu__drawer:not([style*="display:none"])');
    $this->assertCount(1, $elements, 'Drawer button has no display style set with cookie set.');
  }

}
