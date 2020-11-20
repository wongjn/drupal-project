<?php

namespace Drupal\{{ NAME }}_helper\Plugin\views\display_extender;

use Drupal\Core\Form\FormStateInterface;
use Drupal\views\Plugin\views\display_extender\DisplayExtenderPluginBase;

/**
 * Plugin implementation of the 'inview' views display extender.
 *
 * @ViewsDisplayExtender(
 *   id = "inview",
 *   title = @Translation("In-view"),
 *   help = @Translation("Add in-viewport functionality to this view."),
 *   no_ui = FALSE,
 *   register_theme = FALSE
 * )
 */
class InView extends DisplayExtenderPluginBase {

  /**
   * {@inheritdoc}
   */
  protected function defineOptions() {
    return [
      'selector' => ['default' => NULL],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildOptionsForm(&$form, FormStateInterface $form_state) {
    if ($form_state->get('section') == 'inview') {
      $form['selector'] = [
        '#type' => 'textfield',
        '#title' => $this->t('Items CSS selector'),
        '#description' => $this->t('The CSS selector for items in the list to select for in-view loading. E.g. <code>.views-row</code>.'),
        '#size' => 30,
        '#default_value' => $this->options['selector'],
      ];
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitOptionsForm(&$form, FormStateInterface $form_state) {
    if ($form_state->get('section') == 'inview') {
      $this->options['selector'] = $form_state->getValue('selector') ?: NULL;
    }
  }

  /**
   * {@inheritdoc}
   */
  public function optionsSummary(&$categories, &$options) {
    $value = $this->options['selector']
      ? views_ui_truncate($this->options['selector'], 25)
      : $this->t('None');

    $options['inview'] = [
      'category' => 'format',
      'title' => $this->t('In-view'),
      'desc' => $this->t('Set a CSS selector for in-view.'),
      'value' => $value,
    ];
  }

  /**
   * Pre-process variables for views-views.html.twig.
   *
   * @param array $variables
   *   Themeable variables to pre-process.
   */
  public function preprocessViewsView(array &$variables) {
    if ($selector = $this->options['selector']) {
      $variables['attributes']['class'][] = 'js-inview-list';
      $variables['attributes']['data-selector'] = $selector;
    }
  }

}
