<?php

namespace Drupal\{{ NAME }}_helper_test\Controller;

use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Controller for test pages.
 */
class Pages {

  /**
   * The request stack.
   *
   * @var \Symfony\Component\HttpFoundation\RequestStack
   */
  protected $requestStack;

  /**
   * Constructs a Pages controller.
   *
   * @param \Symfony\Component\HttpFoundation\RequestStack $request_stack
   *   The request stack.
   */
  public function __construct(RequestStack $request_stack) {
    $this->requestStack = $request_stack;
  }

  /**
   * Returns the page that tests certain cookies with the page cache.
   *
   * @return array
   *   The page render array.
   */
  public function buildTestCookies() {
    $build = [];
    $cookies = $this->requestStack->getCurrentRequest()->cookies;

    foreach (['md', 'mb'] as $key) {
      $build[] = [
        '#type' => 'container',
        '#attributes' => ['id' => $key],
        'value' => [
          '#markup' => $cookies->has($key) ? $cookies->get($key) : '<none>',
        ],
        '#cache' => ['contexts' => ["cookies:$key"]],
      ];
    }

    return $build;
  }

}
