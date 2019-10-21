<?php

namespace Drupal\{{ NAME }}_helper;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\DependencyInjection\ServiceProviderBase;
use Drupal\{{ NAME }}_helper\StackMiddleware\CookiesPageCache;

/**
 * Modifies Drupal services.
 */
class {{ UCAMEL }}HelperServiceProvider extends ServiceProviderBase {

  /**
   * {@inheritdoc}
   */
  public function alter(ContainerBuilder $container) {
    if ($container->hasDefinition('http_middleware.page_cache')) {
      $middleware = $container->getDefinition('http_middleware.page_cache');
      $middleware->setClass(CookiesPageCache::class);
    }
  }

}
