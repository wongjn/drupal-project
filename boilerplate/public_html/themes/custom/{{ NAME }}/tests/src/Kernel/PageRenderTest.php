<?php

namespace Drupal\Tests\{{ NAME }}\Kernel;

use Drupal\Component\Utility\Html;
use Drupal\Tests\block\Traits\BlockCreationTrait;
use Symfony\Component\HttpFoundation\Request;

/**
 * Tests page theming.
 *
 * @group {{ NAME }}
 */
class PageRenderTest extends ThemeKernelTestBase {

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
  protected function setUp(): void {
    parent::setUp();
    $this->routeMatch = $this->createMock('Drupal\Core\Routing\RouteMatchInterface');
  }

  /**
   * Placeholder test method.
   */
  public function testSomething() {
    $this->markTestIncomplete('Add tests');
  }

  /**
   * Places an example block.
   *
   * @param string $region
   *   The region to place the block in.
   * @param array $settings
   *   (optional) Any additional settings to pass to the created block.
   *
   * @return \Drupal\block\Entity\Block
   *   The block entity.
   */
  protected function placeExampleBlock($region, array $settings = []) {
    return $this->placeBlock('system_powered_by_block', [
      'id' => $region,
      'region' => $region,
    ] + $settings);
  }

  /**
   * Renders a page.
   */
  protected function renderPage() {
    Html::resetSeenIds();

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
