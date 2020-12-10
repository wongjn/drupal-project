<?php

namespace Drupal\Tests\{{ NAME }}\Kernel;

use Drupal\Tests\{{ NAME }}\Traits\KernelPageRenderTrait;

/**
 * Tests CSS output.
 *
 * @group {{ NAME }}
 */
class CssAssetsTest extends ThemeKernelTestBase {

  use KernelPageRenderTrait;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->markTestIncomplete('Specify theme CSS to use in test.');

    // Create stub built stylesheet for testing environments that do no have
    // node-built assets, such as CI.
    $stylesheet = __DIR__ . '/../../../dist/css/base/variables.css';
    if (!file_exists($stylesheet)) {
      if (!file_exists(dirname($stylesheet))) {
        mkdir(dirname($stylesheet), 0777, TRUE);
      }

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
    $this->renderPageWithAttachments(['system/diff']);

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

}
