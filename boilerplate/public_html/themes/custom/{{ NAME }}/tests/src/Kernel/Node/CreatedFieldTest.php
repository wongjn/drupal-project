<?php

namespace Drupal\Tests\{{ NAME }}\Kernel\Node;

use Drupal\node\Entity\NodeType;

/**
 * Tests the created node base field output.
 * 
 * @see {{ NAME }}_preprocess_field__node__created()
 *
 * @group {{ NAME }}
 */
class CreatedFieldTest extends NodeTestBase {

  /**
   * {@inheritdoc}
   */
  protected function setUpEntityBundle() {
    $this->bundle = mb_strtolower($this->randomMachineName());
    parent::setUpEntityBundle();

    // Display submitted.
    $node_type = NodeType::load($this->bundle);
    $node_type->setDisplaySubmitted(TRUE);
    $node_type->save();
  }

  /**
   * Tests the created node base field output.
   */
  public function testCreatedField() {
    $this->markTestIncomplete('Decide on created field date format.');
    $this->renderEntity(['created' => 1444176001]);
    $this->assertRaw('<time datetime="2015-10-07T00:00:01+0000">07/10/15</time>');
  }

}
