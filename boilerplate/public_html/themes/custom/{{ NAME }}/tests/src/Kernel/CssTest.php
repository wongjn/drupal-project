<?php

namespace Drupal\Tests\{{ NAME }}\Kernel;

use Drupal\Core\Render\HtmlResponse;

/**
 * Tests CSS output.
 *
 * @group {{ NAME }}
 */
class CssTest extends ThemeKernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'system',
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();
    $this->markTestIncomplete('Specify theme CSS to use in test.');

    // Create stub built stylesheet for testing environments that do no have
    // node-built assets, such as CI.
    $stylesheet = __DIR__ . '/../../../dist/css/base/variables.css';
    if (!file_exists($stylesheet)) {
      mkdir(dirname($stylesheet), 0777, TRUE);
      file_put_contents($stylesheet, 'test{SPECIFY CSS HERE}');
    }
  }

  /**
   * Tests global CSS grouping.
   *
   * @see {{ NAME }}_css_alter()
   */
  public function testAlteredGrouping() {
    $this->markTestIncomplete('Specify theme CSS to use in test.');

    $this->config('system.performance')
      ->set('css.preprocess', TRUE)
      ->save();
    $this->buildPlainPage(['system/diff']);

    $elements = $this->cssSelect('link[rel="stylesheet"]');
    $this->assertCount(2, $elements, 'Links per group.');

    $href = (string) end($elements)->attributes()->href;
    $css  = file_get_contents(preg_replace('`.*(?=vfs://)`', '', $href));

    $this->assertStringContainsString('SPECIFY CSS HERE', $css, 'Theme global CSS in altered, custom CSS aggregate group.');
    $this->assertStringContainsString('}.text-align-right{', $css, 'System base CSS in altered, custom CSS aggregate group.');
    $this->assertStringNotContainsString('}table.diff .diff-context{', $css, 'Non-global CSS not in altered, custom CSS aggregate group.');

    $href = (string) prev($elements)->attributes()->href;
    $css  = file_get_contents(preg_replace('`.*(?=vfs://)`', '', $href));
    $this->assertStringContainsString('}table.diff .diff-context{', $css, 'Non-global CSS in different aggregate group.');
  }

  /**
   * Builds a plain page with attachments rendered.
   *
   * @param string[] $libraries
   *   (optional) Additional libraries to attach to the page render.
   */
  protected function buildPlainPage(array $libraries = []) {
    $build = [
      '#type' => 'html',
      'page' => ['#type' => 'page'],
      '#attached' => ['library' => $libraries],
    ];
    $this->container->get('main_content_renderer.html')->invokePageAttachmentHooks($build['page']);
    $this->container->get('renderer')->renderRoot($build);

    $response = (new HtmlResponse())->setContent($build);
    $response = $this->container
      ->get('html_response.attachments_processor')
      ->processAttachments($response);

    $this->setRawContent($response->getContent());
  }

}
