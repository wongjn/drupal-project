<?php

namespace Drupal\Tests\{{ NAME }}\Kernel;

use Drupal\Tests\{{ NAME }}\Traits\KernelPageRenderTrait;
use Drupal\Tests\{{ NAME }}\Traits\ThemeFixturesTrait;

/**
 * Tests CSS output.
 *
 * @group {{ NAME }}
 */
class CssAssetsTest extends ThemeKernelTestBase {

  use KernelPageRenderTrait;
  use ThemeFixturesTrait;

  /**
   * {@inheritdoc}
   */
  public static function setUpBeforeClass(): void {
    parent::setUpBeforeClass();
    self::setUpFixtureFile('dist/css/base/typography.css', 'test{}');
  }

  /**
   * {@inheritdoc}
   */
  public static function tearDownAfterClass(): void {
    self::tearDownFixtureFiles();
    parent::tearDownAfterClass();
  }

  /**
   * Tests global CSS grouping.
   *
   * @see {{ NAME }}_css_alter()
   */
  public function testAlteredGrouping() {
    $this->config('system.performance')->set('css.preprocess', TRUE)->save();
    $this->renderPageWithAttachments(['system/diff']);

    $elements = $this->cssSelect('link[rel="stylesheet"][href^="/vfs://"]');
    $this->assertCount(2, $elements, 'Links per group.');

    $href = (string) end($elements)->attributes()->href;
    $css  = file_get_contents(preg_replace('`.*(?=vfs://)`', '', $href));

    $this->assertEquals('test{}', $css, 'Theme global CSS in altered, custom CSS aggregate group.');
    $this->assertStringContainsString('}.text-align-right{', $css, 'System base CSS in altered, custom CSS aggregate group.');
    $this->assertStringNotContainsString('}table.diff .diff-context{', $css, 'Non-global CSS not in altered, custom CSS aggregate group.');

    $href = (string) prev($elements)->attributes()->href;
    $css  = file_get_contents(preg_replace('`.*(?=vfs://)`', '', $href));
    $this->assertStringContainsString('}table.diff .diff-context{', $css, 'Non-global CSS in different aggregate group.');
  }

}
