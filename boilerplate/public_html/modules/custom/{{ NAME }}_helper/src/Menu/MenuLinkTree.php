<?php

namespace Drupal\{{ NAME }}_helper\Menu;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Controller\ControllerResolverInterface;
use Drupal\Core\Menu\MenuActiveTrailInterface;
use Drupal\Core\Menu\MenuLinkManagerInterface;
use Drupal\Core\Menu\MenuLinkTree as CoreMenuLinkTree;
use Drupal\Core\Menu\MenuTreeStorageInterface;
use Drupal\Core\Routing\RouteProviderInterface;
use Drupal\Core\Theme\ThemeManagerInterface;

/**
 * Implements the loading, transforming and rendering of menu link trees.
 */
class MenuLinkTree extends CoreMenuLinkTree {

  /**
   * The theme manager.
   *
   * @var \Drupal\Core\Theme\ThemeManagerInterface
   */
  protected $themeManager;

  /**
   * The name of the default theme.
   *
   * @var string
   */
  protected $defaultTheme;

  /**
   * {@inheritdoc}
   */
  public function getCurrentRouteMenuTreeParameters($menu_name) {
    $parameters = parent::getCurrentRouteMenuTreeParameters($menu_name);

    // If viewing front-end theme, make all menu items expanded.
    if ($this->onDefaultTheme()) {
      $parameters->expandedParents = [];
    }

    return $parameters;
  }

  /**
   * Constructs a \Drupal\{{ NAME }}_helper\Menu\MenuLinkTree object.
   *
   * @param \Drupal\Core\Menu\MenuTreeStorageInterface $tree_storage
   *   The menu link tree storage.
   * @param \Drupal\Core\Menu\MenuLinkManagerInterface $menu_link_manager
   *   The menu link plugin manager.
   * @param \Drupal\Core\Routing\RouteProviderInterface $route_provider
   *   The route provider to load routes by name.
   * @param \Drupal\Core\Menu\MenuActiveTrailInterface $menu_active_trail
   *   The active menu trail service.
   * @param \Drupal\Core\Controller\ControllerResolverInterface $controller_resolver
   *   The controller resolver.
   * @param \Drupal\Core\Theme\ThemeManagerInterface $theme_manager
   *   The theme manager.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The factory for configuration objects.
   */
  public function __construct(MenuTreeStorageInterface $tree_storage, MenuLinkManagerInterface $menu_link_manager, RouteProviderInterface $route_provider, MenuActiveTrailInterface $menu_active_trail, ControllerResolverInterface $controller_resolver, ThemeManagerInterface $theme_manager, ConfigFactoryInterface $config_factory) {
    parent::__construct($tree_storage, $menu_link_manager, $route_provider, $menu_active_trail, $controller_resolver);
    $this->themeManager = $theme_manager;
    $this->defaultTheme = $config_factory->get('system.theme')->get('default');
  }

  /**
   * Queries whether the current theme is the default one.
   *
   * @return bool
   *   TRUE if the currently used theme is the default theme.
   */
  protected function onDefaultTheme() {
    return $this->themeManager->getActiveTheme()->getName() == $this->defaultTheme;
  }

}
