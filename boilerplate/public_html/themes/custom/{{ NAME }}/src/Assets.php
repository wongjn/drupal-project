<?php

namespace Drupal\{{ NAME }};

/**
 * Assets utility static class.
 */
class Assets {

  /**
   * Adds favicons to a list of page attachments.
   *
   * @param array $attachments
   *   Array of all attachments.
   *
   * @see hook_page_attachments()
   * @see hook_page_attachments_alter()
   * @see {{ NAME }}_page_attachments_alter()
   */
  public static function attachFavicons(array &$attachments) {
    $attachments['#attached']['html_head'][] = [
      [
        // Set '#type' to FALSE to prevent 'html_tag' being used.
        '#type'  => FALSE,
        '#theme' => 'favicons',
      ],
      '{{ NAME }}:favicons',
    ];
  }

  /**
   * Adds font preload directives to a list of page attachments.
   *
   * @param array $attachments
   *   Array of all attachments.
   *
   * @see hook_page_attachments()
   * @see hook_page_attachments_alter()
   * @see {{ NAME }}_page_attachments_alter()
   */
  public static function attachFontPreloads(array &$attachments) {
    $theme_path = drupal_get_path('theme', '{{ NAME }}');

    $critical_fonts = [
      "$theme_path/fonts/font1.woff2",
      "$theme_path/fonts/font2.woff2",
    ];
    foreach ($critical_fonts as $font_path) {
      $attachments['#attached']['html_head_link'][][] = [
        'as' => 'font',
        'rel' => 'preload',
        'type' => 'font/woff2',
        'href' => file_url_transform_relative(file_create_url($font_path)),
        'crossorigin' => TRUE,
      ];
    }
  }

}
