<?php

namespace Drupal\{{ NAME }}_frontend_router\Render\Placeholder;

use Drupal\Core\Render\Placeholder\SingleFlushStrategy;
use Drupal\{{ NAME }}_frontend_router\EventSubscriber\FrontendRouterResponseSubscriber;

/**
 * Defines the 'frontend_router' placeholder strategy.
 *
 * Renders all placeholders for the frontend router response.
 */
class FrontendRouterStrategy extends SingleFlushStrategy {

  /**
   * {@inheritdoc}
   */
  public function processPlaceholders(array $placeholders) {
    if (FrontendRouterResponseSubscriber::isRouted()) {
      return parent::processPlaceholders($placeholders);
    }

    return [];
  }

}
