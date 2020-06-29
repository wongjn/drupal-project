<?php

namespace Drupal\Tests\{{ NAME }}\Traits;

use Symfony\Component\CssSelector\CssSelectorConverter;

/**
 * Trait to add extra output assertion methods.
 */
trait AssertOutputTrait {

  /**
   * Asserts an element has text.
   *
   * @param string $css_selector
   *   The element to search for.
   * @param string $text
   *   Text the element should contain.
   * @param string $message
   *   (optional) Message for the test.
   */
  protected function assertElementText($css_selector, $text, $message = NULL) {
    $selector = (new CssSelectorConverter())->toXPath($css_selector);
    $this->assertCount(
      1,
      $this->xpath("${selector}[normalize-space(text())=:text]", [':text' => $text]),
      $message ?: sprintf('%s has text "%s".', $css_selector, $text)
    );
  }
  
  /**
   * Asserts a string is a space-separated list of values.
   *
   * Asserts values separated by spaces match but not necessarily in the same
   * order as expected.
   *
   * @param string $expected
   *   Expected value.
   * @param string $actual
   *   Actual value.
   * @param string $message
   *   (optional) Message for the test.
   */
  protected function assertStringList($expected, $actual, $message = NULL) {
    $actual_list = explode(' ', $actual);
    $expected_list = explode(' ', $expected);

    $this->assertEqualsCanonicalizing($expected_list, $actual_list, $message);
  }

  /**
   * Asserts a string contains a space-separated list of values.
   *
   * Asserts values separated by spaces match but not necessarily in the same
   * order as expected.
   *
   * @param string $expected
   *   Expected value.
   * @param string $actual
   *   Actual value.
   * @param string $message
   *   (optional) Message for the test.
   */
  protected function assertStringListContains($expected, $actual, $message = NULL) {
    $actual_list = explode(' ', $actual);
    $expected_list = explode(' ', $expected);

    $this->assertEmpty(array_diff($expected_list, $actual_list), $message);
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
