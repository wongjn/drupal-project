<?php

namespace Drupal\{{ NAME }};

use Drupal\Core\Render\Element\RenderCallbackInterface;
use Drupal\Core\Render\Element\StatusMessages;

/**
 * Static class to contain the theme's #pre_render callbacks.
 */
class {{ UCAMEL }}LazyBuilders implements RenderCallbackInterface {

  /**
   * Lazy builder for rendering status messages.
   *
   * @param string|null $type
   *   Limit the messages returned by type. See
   *   \Drupal\Core\Render\Element\StatusMessages::renderMessages() for all
   *   possible values.
   * @param string|null $attributes
   *   (optional) JSON-encoded array of HTML attributes to apply to the status
   *   messages wrapper element.
   *
   * @return array
   *   A renderable array containing the messages.
   *
   * @see \Drupal\Core\Messenger\Messenger::deleteByType()
   * @see \Drupal\Core\Render\Element\StatusMessages::renderMessages()
   */
  public static function renderStatusMessages($type = NULL, $attributes = NULL) {
    $build = StatusMessages::renderMessages($type);

    if ($attributes != NULL && $attributes != '[]') {
      $build['#attributes'] = json_decode($attributes);
    }

    return $build;
  }

}
