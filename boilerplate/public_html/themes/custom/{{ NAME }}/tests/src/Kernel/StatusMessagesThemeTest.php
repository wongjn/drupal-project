<?php

namespace Drupal\Tests\{{ NAME }}\Kernel;

/**
 * Tests status messages render element theming.
 *
 * @group {{ NAME }}
 */
class StatusMessagesThemeTest extends ThemeKernelTestBase {

  /**
   * Tests status messages render element theming.
   */
  public function testStatusMessagesTheme() {
    \Drupal::messenger()->addStatus($this->randomMachineName());

    $attribute = mb_strtolower($this->randomMachineName());
    $build = [
      '#type' => 'status_messages',
      '#attributes' => [$attribute => TRUE],
      '#include_fallback' => TRUE,
    ];
    $this->render($build);

    $elements = $this->cssSelect("[data-drupal-messages-fallback][$attribute]");
    $this->assertCount(1, $elements, 'Custom attributes added to status messages fallback element.');

    $elements = $this->cssSelect("[data-drupal-messages][$attribute]");
    $this->assertCount(1, $elements, 'Custom attributes propagated to rendered status messages.');
  }

}
