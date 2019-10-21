<?php

namespace Drupal\{{ NAME }}_helper\StackMiddleware;

use Drupal\page_cache\StackMiddleware\PageCache;
use Symfony\Component\HttpFoundation\Request;

/**
 * Page cache middleware interceptor with awareness of some cookie values.
 */
class CookiesPageCache extends PageCache {

  /**
   * Cookie key names to vary caching on.
   *
   * @var string[]
   */
  const VARY_COOKIES = [
    'mb',
    'md',
  ];

  /**
   * {@inheritdoc}
   */
  protected function getCacheId(Request $request) {
    if (!isset($this->cid)) {
      $cid_parts = [
        $request->getSchemeAndHttpHost() . $request->getRequestUri(),
        $request->getRequestFormat(NULL),
      ];

      $cookies = $request->cookies;
      foreach (self::VARY_COOKIES as $cookie) {
        $cid_parts[] = $cookie . ($cookies->has($cookie) ? $cookies->get($cookie) : '__NONE__');
      }

      $this->cid = implode(':', $cid_parts);
    }
    return $this->cid;
  }

}
