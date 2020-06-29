<?php

namespace Drupal\Tests\{{ NAME }}\Kernel;

use Drupal\Tests\block\Traits\BlockCreationTrait;
use Symfony\Component\HttpFoundation\Request;

/**
 * Tests page theming.
 *
 * @group {{ NAME }}
 */
class PageThemeTest extends ThemeKernelTestBase {

  use BlockCreationTrait;

  /**
   * Route match mock for tests.
   *
   * @var \Drupal\Core\Routing\RouteMatchInterface|\PHPUnit\Framework\MockObject\MockObject
   */
  protected $routeMatch;

  /**
   * {@inheritdoc}
   */
  protected static $modules = ['block'];

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();
    $this->routeMatch = $this->createMock('Drupal\Core\Routing\RouteMatchInterface');
  }

  /**
   * Renders a page.
   */
  protected function renderPage() {
    $content = [
      '#title' => 'Test page',
      '#markup' => 'Test content',
    ];

    $request = Request::create('/');

    /** @var \Symfony\Component\HttpFoundation\Response $response */
    $response = $this->container
      ->get('main_content_renderer.html')
      ->renderResponse($content, $request, $this->routeMatch);

    $this->setRawContent($response->getContent());
  }

}

namespace Drupal\Core\Session;

if (!function_exists('user_role_permissions')) {

  /**
   * Mock user_role_permissions().
   */
  function user_role_permissions(array $roles) {
    $role_permissions = [];
    foreach ($roles as $rid) {
      $role_permissions[$rid] = [];
    }
    return $role_permissions;
  }

}
