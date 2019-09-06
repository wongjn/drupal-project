<?php

namespace Drupal\Tests\{{ NAME }}\Kernel\Node;

use Drupal\KernelTests\Core\Entity\EntityKernelTestBase;
use Drupal\node\Entity\Node;
use Drupal\node\Entity\NodeType;
use Drupal\Tests\{{ NAME }}\Traits\ThemeSetTrait;

/**
 * Tests the 'created' node base field output.
 *
 * @group {{ NAME }}
 */
class CreatedFieldTest extends EntityKernelTestBase {

  use ThemeSetTrait;

  /**
   * {@inheritdoc}
   */
  public static $modules = [
    'node',
  ];

  /**
   * The node test subject.
   *
   * @var \Drupal\node\Entity\Node
   */
  protected $node;

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    $this->installConfig(['node', 'system']);

    $this->config('system.date')
      ->set('timezone.user.configurable', FALSE)
      ->set('timezone.default', 'UTC')
      ->save(TRUE);
    date_default_timezone_set('UTC');

    $this->setDefaultTheme();

    $node_type = NodeType::create(['type' => $this->randomMachineName()]);
    $node_type->setDisplaySubmitted(FALSE);
    $node_type->save();

    $this->node = Node::create([
      'type' => $node_type->id(),
      'title' => $this->randomMachineName(),
      'created' => 1444176001,
    ]);
    $this->node->save();
  }

  /**
   * Tests 'full' view mode output.
   */
  public function testFullOutput() {
    $this->markTestIncomplete('Decide on created field date format.');

    $build = $this->node->created->view('full');
    $this->setRawContent(
      $this->container->get('renderer')->renderPlain($build)
    );

    $this->assertRaw('<time datetime="2015-10-07T00:00:01+0000">Wednesday, 7 October, 2015</time>');
  }

}
