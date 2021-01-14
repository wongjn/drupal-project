<?php

namespace Drupal\{{ NAME }}_helper\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Block\BlockPluginInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Render\Element;
use Drupal\Core\Session\AccountInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Pseudo-decorator for form block plugins.
 *
 * This is to fix the issue with form attributes being applied to the block
 * element as well as the form itself.
 *
 * @see https://www.drupal.org/project/drupal/issues/2486267.
 */
class FormWrapperFixBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * Block plugin being decorated.
   *
   * @var \Drupal\Core\Block\BlockPluginInterface
   */
  protected $inner;

  /**
   * Constructs a FormWrapperFixBlock object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Block\BlockPluginInterface $inner
   *   Block plugin being decorated.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, BlockPluginInterface $inner) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->inner = $inner;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    $inner_definition = array_diff_key($plugin_definition, ['original_class' => '']);
    $original_class = $plugin_definition['original_class'];

    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      is_subclass_of($original_class, ContainerFactoryPluginInterface::class)
        ? $original_class::create($container, $configuration, $plugin_id, $inner_definition)
        : new $original_class($configuration, $plugin_id, $inner_definition)
    );
  }

  /**
   * {@inheritdoc}
   */
  public function label() {
    return $this->inner->label();
  }

  /**
   * {@inheritdoc}
   */
  public function access(AccountInterface $account, $return_as_object = FALSE) {
    return $this->inner->access($account, $return_as_object);
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [];

    $inner_build = $this->inner->build();
    // Same empty check as in \Drupal\block\BlockViewBuilder::preRender().
    if ($inner_build !== NULL && !Element::isEmpty($inner_build)) {
      // Propagate any block title override.
      if (isset($inner_build['#title'])) {
        $build['#title'] = $inner_build['#title'];
        unset($inner_build['#title']);
      }

      $build['form'] = $inner_build;
    }

    return $build;
  }

  /**
   * {@inheritdoc}
   */
  public function setConfigurationValue($key, $value) {
    return $this->inner->setConfigurationValue($key, $value);
  }

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state) {
    return $this->inner->blockForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function blockValidate($form, FormStateInterface $form_state) {
    return $this->inner->blockValidate($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    return $this->inner->blockSubmit($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function getMachineNameSuggestion() {
    return $this->inner->getMachineNameSuggestion();
  }

}
