<?php

namespace Drupal\Tests\{{ NAME }}\Kernel\Block;

/**
 * Tests output of the page title block.
 *
 * @group {{ NAME }}
 */
class PageTitleBlockTest extends BlockTestBase {

  /**
   * Tests output.
   */
  public function testOutput() {
    $block = $this->placeBlock('page_title_block', [
      'id' => 'block',
      'region' => 'content',
    ]);
    $block->getPlugin()->setTitle($this->randomMachineName());
    $this->isolatedRender($this->viewBuilder->view($block));

    $elements = $this->cssSelect('#block-block h1[class="o-title"]');
    $this->assertCount(1, $elements);
  }

}
