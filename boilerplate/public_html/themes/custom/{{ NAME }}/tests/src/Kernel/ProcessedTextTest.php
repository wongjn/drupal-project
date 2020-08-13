<?php

namespace Drupal\Tests\{{ NAME }}\Kernel;

use Drupal\filter\Entity\FilterFormat;

/**
 * Tests processed_text render element output.
 *
 * @group {{ NAME }}
 */
class ProcessedTextTest extends ThemeKernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = ['filter'];

  /**
   * Tests processed_text render output.
   *
   * @see \Drupal\{{ NAME }}\{{ UCAMEL }}PreRender::processedText()
   */
  public function testProcessedText() {
    $format = $this->randomMachineName();
    FilterFormat::create(['format' => $format])->save();

    $this->isolatedRender([
      '#type' => 'processed_text',
      '#format' => $format,
      '#text' => '<p></p>',
    ]);

    $elements = $this->cssSelect('div[class="c-text-body"] > p');
    $this->assertCount(1, $elements);
  }

}
