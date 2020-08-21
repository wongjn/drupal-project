<?php

namespace Drupal\Tests\{{ NAME }}\Traits;

use Drupal\Core\Render\HtmlResponse;

/**
 * Helper trait to render a test page in kernel tests.
 */
trait KernelPageRenderTrait {

  /**
   * Renders a plain page with attachments rendered.
   *
   * @param string[] $libraries
   *   (optional) Additional libraries to attach to the page render.
   */
  protected function renderPageWithAttachments(array $libraries = []) {
    $build = [
      '#type' => 'html',
      'page' => ['#type' => 'page'],
      '#attached' => ['library' => $libraries],
    ];
    $this->container->get('main_content_renderer.html')->invokePageAttachmentHooks($build['page']);
    $this->container->get('renderer')->renderRoot($build);

    $response = (new HtmlResponse())->setContent($build);
    $response = $this->container
      ->get('html_response.attachments_processor')
      ->processAttachments($response);

    $this->setRawContent($response->getContent());
  }

}
