<?php

namespace Drupal\Tests\{{ NAME }}\Kernel\Block;

use Drupal\menu_link_content\Entity\MenuLinkContent;
use Drupal\system\Entity\Menu;
use Symfony\Component\HttpFoundation\Request;

/**
 * Tests output for the main menu block.
 *
 * @group {{ NAME }}
 */
class MainSystemMenuBlockTest extends BlockTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = ['link', 'menu_link_content'];

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
  }

  /**
   * Tests base output.
   */
  public function testBaseOutput() {
    $this->placeRenderBlock('system_menu_block:main', [
      'expand_all_items' => TRUE,
    ]);

    $elements = $this->cssSelect('.c-main-menu');
    $this->assertCount(1, $elements, 'Main menu wrapper.');
    $main_menu = reset($elements);
    $this->assertStringList(
      ['js-main-menu', 'c-main-menu', 'is-menu-loading'],
      (string) $main_menu->attributes()->class,
      'Main menu wrapper classes.'
    );

    $elements = $main_menu->xpath('./ul[@class="c-main-menu__top-menu"]');
    $this->assertCount(1, $elements, 'Top level main menu.');

    $elements = reset($elements)->xpath('./li');
    $this->assertCount(1, $elements, 'Top level main menu item.');
    $element = reset($elements);
    $this->assertStringList(
      ['c-main-menu__item', 'c-main-menu__item--top'],
      (string) $element->attributes()->class,
      'Top level main menu item classes.'
    );

    $elements = $element->xpath('./a');
    $this->assertCount(1, $elements, 'Top level link.');
    $element = reset($elements);
    $this->assertStringList(
      [
        'c-main-menu__link',
        'c-main-menu__link--top',
        'u-link-underline-wrapped',
      ],
      (string) $element->attributes()->class,
      'Top level link classes.'
    );
    $elements = $element->xpath('./span[@class="u-link-underline-wrapped__text"]');
    $this->assertCount(1, $elements, 'Top level link text wrapper.');

    $elements = reset($elements)->xpath('../following-sibling::ul[@class="c-main-menu__sub-menu"]');
    $this->assertCount(1, $elements, 'Sub-level menu list.');

    $elements = reset($elements)->xpath('./li');
    $this->assertCount(1, $elements, 'Sub-level main menu item.');
    $element = reset($elements);
    $this->assertStringList(
      ['c-main-menu__item', 'c-main-menu__item--sub'],
      (string) $element->attributes()->class,
      'Sub-level main menu item classes.'
    );

    $elements = $element->xpath('./a');
    $this->assertCount(1, $elements, 'Sub-level link.');
    $element = reset($elements);
    $this->assertStringList(
      [
        'c-main-menu__link',
        'c-main-menu__link--sub',
        'u-link-underline-wrapped',
      ],
      (string) $element->attributes()->class,
      'Sub-level link classes.'
    );
    $elements = $element->xpath('./span[@class="u-link-underline-wrapped__text"]');
    $this->assertCount(1, $elements, 'Sub-level link text wrapper.');

    $elements = reset($elements)->xpath('../following-sibling::ul');
    $this->assertCount(1, $elements, 'Deep level menu list.');
    $element = reset($elements);
    $this->assertStringList(
      ['c-main-menu__sub-menu', 'c-main-menu__sub-menu--deep'],
      (string) $element->attributes()->class,
      'Deep level menu list classes.'
    );

    $elements = $element->xpath('./li');
    $this->assertCount(1, $elements, 'Deep level main menu item.');
    $element = reset($elements);
    $this->assertStringList(
      ['c-main-menu__item', 'c-main-menu__item--sub'],
      (string) $element->attributes()->class,
      'Deep level main menu item classes.'
    );

    $elements = $element->xpath('./a');
    $this->assertCount(1, $elements, 'Deep level link.');
    $element = reset($elements);
    $this->assertStringList(
      [
        'c-main-menu__link',
        'c-main-menu__link--sub',
        'u-link-underline-wrapped',
      ],
      (string) $element->attributes()->class,
      'Deep level link classes.'
    );
    $elements = $element->xpath('./span[@class="u-link-underline-wrapped__text"]');
    $this->assertCount(1, $elements, 'Deep level link text wrapper.');

    $elements = $main_menu->xpath('./*[@class="c-main-menu__drawer"]');
    $this->assertCount(1, $elements, 'Drawer button wrapper.');

    $elements = reset($elements)->xpath('./button[@class="c-main-menu__open-btn"]');
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

    $request = Request::create('/', 'GET', [], ['{{ NAME }}_menu_break' => 1]);
    $request_stack->push($request);
    $this->placeRenderBlock('system_menu_block:main', [
      'expand_all_items' => TRUE,
    ]);

    $elements = $this->cssSelect('.c-main-menu__top-menu.is-compact');
    $this->assertCount(1, $elements, 'Main menu wrapper has "is-compact" class with line break of 1.');

    $request = Request::create('/', 'GET', [], ['{{ NAME }}_menu_break' => 2]);
    $request_stack->push($request);
    $this->placeRenderBlock('system_menu_block:main', [
      'expand_all_items' => TRUE,
    ]);

    $elements = $this->cssSelect('.c-main-menu__top-menu > li[style*="visibility:hidden"]');
    $this->assertCount(2, $elements, 'Top-level menu items hidden per line break value.');
  }

  /**
   * Tests out with drawer open button.
   */
  public function testDrawerWrapperCookieOutput() {
    $this->placeRenderBlock('system_menu_block:main', [
      'expand_all_items' => TRUE,
    ]);

    $elements = $this->cssSelect('.c-main-menu__drawer[style*="display:none"]');
    $this->assertCount(1, $elements, 'Drawer button wrapper has "display: none" with no cookie set.');

    $request = Request::create('/', 'GET', [], [
      '{{ NAME }}_menu_drawer' => '1',
    ]);
    $this->container->get('request_stack')->push($request);
    $this->placeRenderBlock('system_menu_block:main', [
      'expand_all_items' => TRUE,
    ]);

    $elements = $this->cssSelect('.c-main-menu__drawer:not([style*="display:none"])');
    $this->assertCount(1, $elements, 'Drawer button has no display style set with cookie set.');
  }

}
