<?php

namespace Drupal\Tests\{{ NAME }}\Kernel;

use Drupal\Tests\{{ NAME }}\Traits\KernelPageRenderTrait;
use Drupal\Tests\{{ NAME }}\Traits\ThemeFixturesTrait;

/**
 * Tests JavaScript asset handling.
 *
 * @group {{ NAME }}
 */
class JsAssetsTest extends ThemeKernelTestBase {

  use KernelPageRenderTrait;
  use ThemeFixturesTrait;

  /**
   * {@inheritdoc}
   */
  public static function setUpBeforeClass(): void {
    parent::setUpBeforeClass();

    foreach (['modern', 'legacy'] as $script_type) {
      // Use stub Webpack stats.json files.
      self::setUpFixtureFile("dist/js/stats.$script_type.json", json_encode([
        'entrypoints' => [
          'main' => [
            'assets' => [
              ['name' => "52.$script_type.js"],
              ['name' => "main.$script_type.js"],
            ],
          ],
          'test' => ['assets' => [['name' => "foo-bar.$script_type.js"]]],
        ],
      ]));
    }
  }

  /**
   * {@inheritdoc}
   */
  public static function tearDownAfterClass(): void {
    self::tearDownFixtureFiles();
    parent::tearDownAfterClass();
  }

  /**
   * Tests dynamic library definitions generation.
   *
   * @see {{ NAME }}_library_info_build()
   * @requires module differential_serve
   */
  public function testJavaScriptLibraryBuild() {
    $this->assertJs('legacy');

    $this->enableModules(['differential_serve']);
    $this->assertJs('modern');
  }

  /**
   * Asserts JavaScript of a certain type are present.
   *
   * @param string $type
   *   The type of JavaScript as built from Webpack.
   */
  protected function assertJs($type) {
    $this->renderPageWithAttachments();

    $elements = $this->cssSelect('script[src*="{{ NAME }}/dist/js/"]');
    $this->assertCount(2, $elements, "JavaScript $type assets for the global library are present.");

    $src = parse_url((string) reset($elements)->attributes()->src, PHP_URL_PATH);
    $this->assertStringEndsWith("dist/js/52.$type.js", $src, "Scripts included on page follow order from $type stats json.");
    $src = parse_url((string) next($elements)->attributes()->src, PHP_URL_PATH);
    $this->assertStringEndsWith("dist/js/main.$type.js", $src, "Scripts included on page follow order from $type stats json.");

    $elements = $this->cssSelect('script[src^="https://cdn.polyfill.io/v3/polyfill.min.js"] ~ script[src*="{{ NAME }}/dist/js/"]');
    $this->assertCount(2, $elements, "Polyfill service JavaScript is included before any $type theme JavaScript.");

    $this->renderPageWithAttachments(['{{ NAME }}/js.test']);

    $elements = $this->cssSelect("script[src*='{{ NAME }}/dist/js/foo-bar.$type.js']");
    $this->assertCount(1, $elements, "JavaScript $type asset added using {{ NAME }}/js.<entryname> library naming pattern.");
  }

}
