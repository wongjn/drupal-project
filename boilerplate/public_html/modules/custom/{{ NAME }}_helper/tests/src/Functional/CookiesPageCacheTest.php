<?php

namespace Drupal\Tests\{{ NAME }}_helper\Functional;

use Drupal\Tests\BrowserTestBase;

/**
 * Tests some cookies affect page cache.
 *
 * @group {{ NAME }}_helper
 */
class CookiesPageCacheTest extends BrowserTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    '{{ NAME }}_helper',
    '{{ NAME }}_helper_test',
  ];

  /**
   * Test page.
   *
   * @var string
   */
  protected $page = '/{{ NAME }}-helper-test/cookies-test';

  /**
   * Tests cached cookie variants.
   */
  public function testCookieVariance() {
    $this->drupalGet($this->page);

    foreach (['mb', 'md'] as $key) {
      $this->getSession()->setCookie($key, 1);
      $this->drupalGet($this->page);
      $this->assertEquals('1', $this->cssSelect("#$key")[0]->getText(), "Varies on '$key' cookie.");
    }

    $this->drupalGet($this->page);
    $this->assertHeader('X-Drupal-Cache', 'HIT', 'Page cache still hits.');
  }

}
