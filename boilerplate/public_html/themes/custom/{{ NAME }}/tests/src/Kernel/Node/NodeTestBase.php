<?php

namespace Drupal\Tests\{{ NAME }}\Kernel\Node;

use Drupal\node\Entity\NodeType;
use Drupal\Tests\{{ NAME }}\Kernel\FieldableEntityTestBase;

/**
 * Base class for node-bundle-based output tests.
 */
abstract class NodeTestBase extends FieldableEntityTestBase {

  /**
   * {@inheritdoc}
   */
  protected $entityType = 'node';

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'node',
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();
    $this->setDefaultTheme();

    // Hide display submitted by default.
    $node_type = NodeType::load($this->bundle);
    $node_type->setDisplaySubmitted(FALSE);
    $node_type->save();
  }

  /**
   * {@inheritdoc}
   */
  protected function setUpEntityBundle() {
    $this->installSchema('node', ['node_access']);
    // Install system config for date formats.
    $this->installConfig(['system']);

    parent::setUpEntityBundle();
  }

  /**
   * {@inheritdoc}
   */
  protected function renderEntity(array $parameters = []) {
    return parent::renderEntity($parameters += [
      'title' => $this->randomMachineName(),
      'view_mode' => 'full',
    ]);
  }

}
