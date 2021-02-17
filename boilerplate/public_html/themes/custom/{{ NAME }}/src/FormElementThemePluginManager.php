<?php

namespace Drupal\{{ NAME }};

use Drupal\Component\Plugin\Factory\DefaultFactory;
use Drupal\Component\Utility\SortArray;
use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Extension\ThemeHandlerInterface;
use Drupal\Core\Plugin\DefaultPluginManager;
use Drupal\Core\Plugin\Discovery\AnnotatedClassDiscovery;
use Drupal\Core\Plugin\Discovery\ContainerDerivativeDiscoveryDecorator;
use Drupal\Core\Render\Element;
use Drupal\Core\Security\TrustedCallbackInterface;
use Drupal\Core\Theme\ThemeManagerInterface;

/**
 * Plugin manager for form element theming.
 */
class FormElementThemePluginManager extends DefaultPluginManager implements TrustedCallbackInterface {

  /**
   * Static singleton self instance.
   *
   * @var self
   */
  protected static $self;

  /**
   * Gets the singleton instance of this manager.
   *
   * @return self
   *   Self singleton instance.
   */
  public static function singleton() {
    if (!static::$self) {
      static::$self = new static(
        \Drupal::service('container.namespaces'),
        \Drupal::service('cache.discovery'),
        \Drupal::moduleHandler(),
        \Drupal::service('theme_handler'),
        \Drupal::theme(),
      );
    }

    return static::$self;
  }

  /**
   * {@inheritdoc}
   */
  public static function trustedCallbacks() {
    return [
      'preRenderFormElement',
    ];
  }

  /**
   * Pre-render callback to theme a form element.
   */
  public static function preRenderFormElement(array $element) {
    if ($instance = static::singleton()->getInstance(['element' => $element])) {
      $element = $instance->preRenderElement($element);
      if (isset($element['#{{ NAME }}_no_recurse'])) {
        return $element;
      }
    }

    // Recurse into any child components.
    foreach (Element::getVisibleChildren($element) as $key) {
      $element[$key] = static::preRenderFormElement($element[$key]);
    }

    return $element;
  }

  /**
   * The theme handler.
   *
   * @var \Drupal\Core\Extension\ThemeHandlerInterface
   */
  protected $themeHandler;

  /**
   * The theme manager.
   *
   * @var \Drupal\Core\Theme\ThemeManagerInterface
   */
  protected $themeManager;

  /**
   * Constructs a new form element theme plugin manager.
   *
   * @param \Traversable $namespaces
   *   An object that implements \Traversable which contains the root paths
   *   keyed by the corresponding namespace to look for plugin implementations.
   * @param \Drupal\Core\Cache\CacheBackendInterface $cache
   *   The cache backend to use.
   * @param \Drupal\Core\Extension\ModuleHandlerInterface $module_handler
   *   The module handler.
   * @param \Drupal\Core\Extension\ThemeHandlerInterface $theme_handler
   *   The theme handler.
   * @param \Drupal\Core\Theme\ThemeManagerInterface $theme_manager
   *   The theme manager.
   */
  public function __construct(\Traversable $namespaces, CacheBackendInterface $cache, ModuleHandlerInterface $module_handler, ThemeHandlerInterface $theme_handler, ThemeManagerInterface $theme_manager) {
    parent::__construct(
      'Plugin/{{ NAME }}/FormElementTheme',
      $namespaces,
      $module_handler,
      'Drupal\{{ NAME }}\FormElementThemeInterface',
      'Drupal\{{ NAME }}\Annotation\{{ UCAMEL }}FormElementTheme'
    );
    $this->setCacheBackend($cache, '{{ NAME }}_form_element_theme');
    $this->alterInfo('{{ NAME }}_form_element_theme');

    $this->themeManager = $theme_manager;
    $this->themeHandler = $theme_handler;
  }

  /**
   * Overrides PluginManagerBase::getInstance().
   *
   * @param array $options
   *   An array with the following key/value pairs:
   *   - element: (array) The render element to enhance.
   *
   * @return \Drupal\{{ NAME }}\FormElementThemeInterface|null
   *   A plugin instance or NULL when plugin is not found.
   */
  public function getInstance(array $options) {
    $plugins = $this->getDefinitions();
    uasort($plugins, [SortArray::class, 'sortByWeightElement']);

    foreach (array_reverse($plugins, TRUE) as $plugin_id => $plugin) {
      $plugin_class = DefaultFactory::getPluginClass($plugin_id, $plugin);
      if ($plugin_class::isApplicable($options['element'])) {
        return $this->createInstance($plugin_id);
      }
    }

    return NULL;
  }

  /**
   * {@inheritdoc}
   */
  protected function getDiscovery() {
    if (!$this->discovery) {
      $active_theme = $this->themeManager->getActiveTheme();

      // Add chain of active themes to the namespace search.
      $theme_namespaces = [];
      foreach (array_merge([$active_theme], $active_theme->getBaseThemeExtensions()) as $extension) {
        $theme_namespaces["Drupal\\{$extension->getName()}"] = "{$extension->getPath()}/src";
      }

      $discovery = new AnnotatedClassDiscovery(
        $this->subdir,
        new \ArrayObject(((array) $this->namespaces) + $theme_namespaces),
        $this->pluginDefinitionAnnotationName,
        $this->additionalAnnotationNamespaces
      );
      $this->discovery = new ContainerDerivativeDiscoveryDecorator($discovery);
    }
    return $this->discovery;
  }

  /**
   * {@inheritdoc}
   */
  protected function alterDefinitions(&$definitions) {
    if ($this->alterHook) {
      $this->moduleHandler->alter($this->alterHook, $definitions);
      $this->themeManager->alter($this->alterHook, $definitions);
    }
  }

  /**
   * {@inheritdoc}
   */
  protected function providerExists($provider) {
    return $this->moduleHandler->moduleExists($provider) ||
      $this->themeHandler->themeExists($provider);
  }

}
