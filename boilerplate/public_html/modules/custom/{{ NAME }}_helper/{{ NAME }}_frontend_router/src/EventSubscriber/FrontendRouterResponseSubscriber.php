<?php

namespace Drupal\{{ NAME }}_frontend_router\EventSubscriber;

use Drupal\Core\EventSubscriber\AjaxResponseSubscriber;
use Drupal\Core\Theme\ThemeManagerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Frontend router integration subscriber for requests.
 */
class FrontendRouterResponseSubscriber implements EventSubscriberInterface {

  /**
   * The query parameter for a frontend router request.
   *
   * @var string
   */
  const FRONTEND_ROUTER_FLAG = '_frontend_router';

  /**
   * The theme manager.
   *
   * @var \Drupal\Core\Theme\ThemeManagerInterface
   */
  protected $themeManager;

  /**
   * Gets whether the current request is being routed from the frontend router.
   *
   * @return bool
   *   Returns TRUE if for the frontend router.
   */
  public static function isRouted() {
    static $result;

    if (!isset($result)) {
      $request = \Drupal::requestStack()->getMasterRequest();
      $result = $request->get(AjaxResponseSubscriber::AJAX_REQUEST_PARAMETER) &&
        $request->get(self::FRONTEND_ROUTER_FLAG);
    }

    return $result;
  }

  /**
   * Constructs a new FrontendRouterResponseSubscriber.
   *
   * @param \Drupal\Core\Theme\ThemeManagerInterface $theme_manager
   *   The theme manager.
   */
  public function __construct(ThemeManagerInterface $theme_manager) {
    $this->themeManager = $theme_manager;
  }

  /**
   * Returns a string to notify the frontend router of un-routable request.
   *
   * @param \Symfony\Component\HttpKernel\Event\GetResponseEvent $event
   *   The event to process.
   */
  public function onRequest(GetResponseEvent $event) {
    if (!self::isRouted()) {
      return;
    }

    $request = $event->getRequest();
    // Frontend theme and current request theme does not match:
    if ($request->get('ajax_page_state')['theme'] != $this->themeManager->getActiveTheme()->getName()) {
      $response = new Response('__INVALID_THEME__', 200, ['Content-Type' => 'text/plain']);
      $event->setResponse($response);
    }
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents() {
    // Just after DynamicPageCacheSubscriber::onRequest()
    $events[KernelEvents::REQUEST][] = ['onRequest', 26];

    return $events;
  }

}
