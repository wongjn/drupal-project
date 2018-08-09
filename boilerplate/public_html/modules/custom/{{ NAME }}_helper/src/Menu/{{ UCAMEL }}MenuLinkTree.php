<?php

namespace Drupal\{{ NAME }}_helper\Menu;

use Drupal\Core\Menu\MenuLinkTreeInterface;
use Drupal\Core\Menu\MenuTreeParameters;
use Drupal\Core\Theme\ThemeManagerInterface;

/**
 * Wraps menu link tree service to force all menu links as expanded.
 */
class {{ UCAMEL }}MenuLinkTree implements MenuLinkTreeInterface {

  /**
   * The menu link tree service.
   *
   * @var \Drupal\Core\Menu\MenuLinkTreeInterface
   */
  protected $menuLinkTree;

  /**
   * The theme manager.
   *
   * @var \Drupal\Core\Theme\ThemeManagerInterface
   */
  protected $themeManager;

  /**
   * Constructs a {{ UCAMEL }}MenuLinkTree object.
   *
   * @param \Drupal\Core\Menu\MenuLinkTreeInterface $menu_link_tree
   *   The menu link tree service.
   * @param \Drupal\Core\Theme\ThemeManagerInterface $theme_manager
   *   The theme manager.
   */
  public function __construct(MenuLinkTreeInterface $menu_link_tree, ThemeManagerInterface $theme_manager) {
    $this->menuLinkTree = $menu_link_tree;
    $this->themeManager = $theme_manager;
  }

  /**
   * {@inheritdoc}
   */
  public function getCurrentRouteMenuTreeParameters($menu_name) {
    $parameters = $this->menuLinkTree->getCurrentRouteMenuTreeParameters($menu_name);

    // If viewing the {{ LABEL }} theme, make all menu items expanded.
    $active_theme = $this->themeManager
      ->getActiveTheme()
      ->getName();
    if ($active_theme == '{{ NAME }}') {
      $parameters->expandedParents = [];
    }

    return $parameters;
  }

  /**
   * {@inheritdoc}
   */
  public function load($menu_name, MenuTreeParameters $parameters) {
    return $this->menuLinkTree->load($menu_name, $parameters);
  }

  /**
   * {@inheritdoc}
   */
  public function transform(array $tree, array $manipulators) {
    return $this->menuLinkTree->transform($tree, $manipulators);
  }

  /**
   * {@inheritdoc}
   */
  public function build(array $tree) {
    return $this->menuLinkTree->build($tree);
  }

  /**
   * {@inheritdoc}
   */
  public function maxDepth() {
    return $this->menuLinkTree->maxDepth();
  }

  /**
   * {@inheritdoc}
   */
  public function getSubtreeHeight($id) {
    return $this->menuLinkTree->getSubtreeHeight($id);
  }

  /**
   * {@inheritdoc}
   */
  public function getExpanded($menu_name, array $parents) {
    return $this->menuLinkTree->getExpanded($menu_name, $parents);
  }

}
