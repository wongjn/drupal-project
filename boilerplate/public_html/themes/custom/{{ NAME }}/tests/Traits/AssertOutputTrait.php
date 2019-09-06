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
      $this->xpath("${selector}[normalize-space(text())=:text]", [':text' => $text],
      $message ?: sprintf('%s has text "%s".', $css_selector, $text)
    ));

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
