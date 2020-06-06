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
   * Asserts an element's attribute has expected value.
   *
   * This is a looser assertion, whereby values separated by spaces match but
   * not necessarily in the same order.
   *
   * @param string $expected_value
   *   Expected attribute value.
   * @param \SimpleXMLElement $attribute
   *   The attribute value.
   * @param string $message
   *   (optional) Message for the test.
   */
  protected function assertXmlAttribute($expected_value, SimpleXMLElement $attribute, $message = NULL) {
    $actual = explode(' ', (string) $attribute);
    $expected = explode(' ', $expected_value);

    $this->assertEqualsCanonicalizing($expected, $actual, $message ?: "`{$attribute->getName()}` attribute value matches '$expected_value'.");
  }

  /**
   * Asserts an element's attribute contains the expected value(s).
   *
   * @param string $expected_value
   *   Expected attribute value.
   * @param \SimpleXMLElement $attribute
   *   The attribute value.
   * @param string $message
   *   (optional) Message for the test.
   */
  protected function assertXmlAttributeContains($expected_value, SimpleXMLElement $attribute, $message = NULL) {
    $actual = explode(' ', (string) $attribute);
    $expected = explode(' ', $expected_value);

    $this->assertEmpty(
      array_diff($expected, $actual),
      $message ?: "{$attribute->getName()} value contains '$expected_value'."
    );
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
