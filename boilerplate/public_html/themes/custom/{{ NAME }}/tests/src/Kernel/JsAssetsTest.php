<?php

namespace Drupal\Tests\{{ NAME }}\Kernel;

use Drupal\Tests\{{ NAME }}\Traits\KernelPageRenderTrait;

/**
 * Tests JavaScript asset handling.
 *
 * @group {{ NAME }}
 * @requires module differential_serve
 */
class JsAssetsTest extends ThemeKernelTestBase {

  use KernelPageRenderTrait;

  /**
   * {@inheritdoc}
   */
  protected static $modules = ['differential_serve'];

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    foreach (['modern', 'legacy'] as $script_type) {
      // Use stub Webpack stats.json files.
      $stats = __DIR__ . "/../../../dist/js/stats.$script_type.json";
      if (file_exists($stats)) {
        rename($stats, "$stats.real");
      }
      if (!file_exists(dirname($stats))) {
        mkdir(dirname($stats), 0777, TRUE);
      }
      file_put_contents($stats, json_encode([
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
  public function tearDown() {
    foreach (['modern', 'legacy'] as $script_type) {
      // Restore real Webpack stats.json files if they existed before.
      $stats = __DIR__ . "/../../../dist/js/stats.$script_type.json";
      if (file_exists("$stats.real")) {
        rename("$stats.real", $stats);
      }
      else {
        unlink($stats);
      }
    }

    parent::tearDown();
  }

  /**
   * Tests dynamic library definitions generated from Webpack.
   *
   * @see {{ NAME }}_library_info_build()
   */
  public function testJavaScriptLibraryBuild() {
    $this->renderPageWithAttachments();

    $elements = $this->cssSelect('script[src*="{{ NAME }}/dist/js/"]');
    $this->assertCount(2, $elements, 'JavaScript assets for the global library are present.');

    $src = (string) reset($elements)->attributes()->src;
    $this->assertStringContainsString('dist/js/52.modern.js', $src, 'Scripts included on page follow order from stats json.');
    $src = (string) next($elements)->attributes()->src;
    $this->assertStringContainsString('dist/js/main.modern.js', $src, 'Scripts included on page follow order from stats json.');

    $elements = $this->cssSelect('script[src^="https://cdn.polyfill.io/v3/polyfill.min.js"] ~ script[src*="{{ NAME }}/dist/js/"]');
    $this->assertCount(2, $elements, 'Polyfill service JavaScript is included before any theme JavaScript.');

    $this->renderPageWithAttachments(['{{ NAME }}/js.test']);

    $elements = $this->cssSelect('script[src*="{{ NAME }}/dist/js/foo-bar.modern.js"]');
    $this->assertCount(1, $elements, 'JavaScript asset added using {{ NAME }}/js.<entryname> library naming pattern.');
  }

}
