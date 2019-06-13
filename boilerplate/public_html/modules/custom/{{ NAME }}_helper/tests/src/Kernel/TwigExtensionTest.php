<?php

namespace Drupal\Tests\{{ NAME }}_helper\Kernel;

use Drupal\KernelTests\KernelTestBase;

/**
 * @coversDefaultClass \Drupal\{{ NAME }}_helper\TwigExtension
 * @group {{ NAME }}_helper
 */
class TwigExtensionTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  public static $modules = [
    '{{ NAME }}_helper',
    '{{ NAME }}_helper_test',
  ];

  /**
   * @covers ::setArrayValue
   */
  public function testSetValue() {
    $build = [
      '#theme' => '{{ NAME }}_helper_test_twig_array',
      '#list' => [
        'foo' => 'foo',
        'bar' => [
          'foo' => [
            'barfoo',
          ],
        ],
        'baz' => [
          'something' => ['more'],
        ],
      ],
    ];

    $output = $this->container
      ->get('renderer')
      ->renderRoot($build);
    $this->setRawContent($output);

    $this->assertCount(3, $this->cssSelect('#set1 > li'));
    $this->assertContains('New Value', (string) $this->cssSelect('#set1 > .foo')[0]);

    $this->assertCount(1, $this->cssSelect('#set2 > .bar > ul > li'));
    $this->assertContains('Lorem Ipsum', (string) $this->cssSelect('#set2 > .bar .foo')[0]);

    $this->assertCount(2, $this->cssSelect('#append1 > .baz > ul > li'));
    $this->assertContains('Append Value', (string) $this->cssSelect('#append1 > .baz > ul > li')[1]);

    $this->assertCount(2, $this->cssSelect('#append2 .something > ul > li'));
    $this->assertContains('Lorem Ipsum', (string) $this->cssSelect('#append2 .something > ul > li')[1]);
  }

}
