<?php

namespace Drupal\{{ NAME }};

use Drupal\Core\Render\Element\RenderCallbackInterface;
use Drupal\Core\Render\Element\StatusMessages;

/**
 * Static class to contain the theme's #pre_render callbacks.
 */
class {{ UCAMEL }}LazyBuilders implements RenderCallbackInterface {

  /**
   * Renders status messages for the status messages block.
   *
   * @param string|null $type
   *   Limit the messages returned by type. See
   *   \Drupal\Core\Render\Element\StatusMessages::renderMessages() for all
   *   possible values.
   *
   * @return array
   *   A renderable array containing the messages.
   *
   * @see \Drupal\Core\Messenger\Messenger::deleteByType()
   * @see \Drupal\Core\Render\Element\StatusMessages::renderMessages()
   */
  public static function renderStatusMessagesBlock($type = NULL) {
    $build = StatusMessages::renderMessages($type);
    $build['#attributes']['class'][] = 'l-container__module';
    return $build;
  }

}