<?php

namespace Drupal\Tests\{{ NAME }}\Traits;

/**
 * Trait to add extra output assertion methods.
 */
trait AssertOutputTrait {

  /**
   * Asserts a string is a space-separated list of values.
   *
   * Asserts values separated by spaces match but not necessarily in the same
   * order as expected.
   *
   * @param string[] $expected
   *   Expected values.
   * @param string $actual
   *   Actual value.
   * @param string $message
   *   (optional) Message for the test.
   */
  protected function assertStringList(array $expected, $actual, $message = '') {
    $actual_list = explode(' ', $actual);
    $this->assertEqualsCanonicalizing($expected, $actual_list, $message);
  }

  /**
   * Asserts a string contains a space-separated list of values.
   *
   * Asserts values separated by spaces match but not necessarily in the same
   * order as expected.
   *
   * @param string[] $expected
   *   Expected values.
   * @param string $actual
   *   Actual value.
   * @param string $message
   *   (optional) Message for the test.
   */
  protected function assertStringListContains(array $expected, $actual, $message = '') {
    $actual_list = explode(' ', $actual);
    $this->assertEmpty(array_diff($expected, $actual_list), $message);
  }

  /**
   * Renders an render array in isolation (i.e. without a bare page).
   *
   * @param array $build
   *   The structured array describing the data to be rendered.
   *
   * @return \Drupal\Component\Render\MarkupInterface
   *   The rendered HTML.
   */
  protected function isolatedRender(array $build) {
    $content = $this->container
      ->get('renderer')
      ->renderPlain($build);

    $this->setRawContent($content);
    return $content;
  }

}
