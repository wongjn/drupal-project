<?php

namespace Drupal\Tests\{{ NAME }}\Kernel\Node;

use Drupal\Core\Entity\Entity\EntityViewDisplay;
use Drupal\node\Entity\NodeType;
use Drupal\Tests\{{ NAME }}\Kernel\ThemeKernelTestBase;
use Drupal\Tests\{{ NAME }}\Traits\EntityCreationTrait;
use Drupal\Tests\node\Traits\NodeCreationTrait;

/**
 * Base class for node-bundle-based output tests.
 */
abstract class NodeTestBase extends ThemeKernelTestBase {

  use EntityCreationTrait;
  use NodeCreationTrait;

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'node',
    'user',
    'field',
    'text',
    'filter',
  ];

  /**
   * The node bundle to test with.
   *
   * @var string
   */
  protected $bundle;

  /**
   * Fields to add to the test node bundle.
   *
   * Keyed by field name with storage settings as the array value or a string to
   * specify only the field type with the rest of settings as defaults.
   *
   * @var array|string[]
   */
  protected $fields = [];

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    $this->installEntitySchema('user');
    $this->installEntitySchema('node');
    $this->installSchema('node', ['node_access']);
    $this->installConfig(['node', 'filter', 'system']);
    $this->setDefaultTheme();

    // Create the node bundle.
    $node_type = NodeType::create(['type' => $this->bundle]);
    $node_type->setDisplaySubmitted(FALSE);
    $node_type->save();
    node_add_body_field($node_type);

    // Remove 'links' from entity view displays.
    EntityViewDisplay::load("node.$this->bundle.default")
      ->setComponent('body', ['weight' => 1])
      ->removeComponent('links')
      ->save();
    EntityViewDisplay::load("node.$this->bundle.teaser")
      ->removeComponent('links')
      ->save();

    $this->createEntityFields('node', $this->bundle, $this->fields);
    $this->maybeCreateFile();
  }

  /**
   * Renders a node with the given parameters in a view mode.
   *
   * @param array $parameters
   *   (optional) Parameters to create a node.
   * @param string $view_mode
   *   (optional) The view mode to render a node in.
   *
   * @return \Drupal\node\NodeInterface
   *   The rendered node entity.
   */
  protected function renderNode(array $parameters = [], $view_mode = 'full') {
    $node = $this->createNode(['type' => $this->bundle] + $parameters);

    $build = $this->container
      ->get('entity_type.manager')
      ->getViewBuilder('node')
      ->view($node, $view_mode);
    $this->isolatedRender($build);

    return $node;
  }

}
