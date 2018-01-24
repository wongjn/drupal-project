<?php

namespace Drupal\{{ NAME }}_helper;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\DependencyInjection\ServiceProviderBase;
use Symfony\Component\DependencyInjection\Reference;

/**
 * Adjusts services.
 */
class {{ UCAMEL }}HelperServiceProvider extends ServiceProviderBase {

  /**
   * {@inheritdoc}
   */
  public function alter(ContainerBuilder $container) {
    // Modifies the menu link tree service class.
    $container->getDefinition('menu.link_tree')
      ->setClass('Drupal\{{ NAME }}_helper\Menu\MenuLinkTree')
      ->addArgument(new Reference('theme.manager'))
      ->addArgument(new Reference('config.factory'));
  }
}
