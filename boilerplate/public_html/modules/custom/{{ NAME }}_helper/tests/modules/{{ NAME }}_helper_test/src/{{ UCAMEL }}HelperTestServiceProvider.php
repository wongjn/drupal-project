<?php

namespace Drupal\{{ NAME }}_helper_test;

use Drupal\{{ NAME }}_helper_test\Menu\Test{{ UCAMEL }}MenuLinkTree;
use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\DependencyInjection\ServiceProviderBase;

/**
 * Replaces {{ NAME }}_helper services with testing versions.
 */
class {{ UCAMEL }}HelperTestServiceProvider extends ServiceProviderBase {

  /**
   * {@inheritdoc}
   */
  public function alter(ContainerBuilder $container) {
    parent::alter($container);

    $container->getDefinition('{{ NAME }}_helper.link_tree')
      ->setClass(Test{{ UCAMEL }}MenuLinkTree::class);
  }

}
