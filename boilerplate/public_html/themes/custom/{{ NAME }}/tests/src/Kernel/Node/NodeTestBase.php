<?php

namespace Drupal\Tests\{{ NAME }}\Kernel\Node;

use Drupal\Core\Entity\Entity\EntityViewDisplay;
use Drupal\Core\Entity\Entity\EntityViewMode;
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
    $this->installEntitySchema('user');
    $this->installEntitySchema('node');
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

  /**
   * Asserts rendered node is in the sidebar grid style.
   */
  protected function assertSidebarGrid() {
    $field_name = mb_strtolower($this->randomMachineName());

    $wide_field_types = [
      'address',
      'geolocation',
      'text_long',
      'video_embed_field',
    ];
    $wide_fields = array_combine($wide_field_types, $wide_field_types);
    $this->createEntityFields($wide_fields + [$field_name => 'string']);

    if (!EntityViewMode::load('node.sidebar')) {
      EntityViewMode::create([
        'id' => 'node.sidebar',
        'targetEntityType' => 'node',
      ])->save();
    }

    $display = EntityViewDisplay::load("node.$this->bundle.sidebar");
    if (!$display) {
      $display = EntityViewDisplay::create([
        'targetEntityType' => 'node',
        'bundle' => $this->bundle,
        'mode' => 'sidebar',
        'status' => TRUE,
      ]);
    }
    foreach (array_keys($display->getComponents()) as $name) {
      $display->removeComponent($name);
    }
    foreach ($wide_field_types as $type) {
      $display->setComponent($type, $type === 'address' ? ['type' => 'google_map_embed_address'] : []);
    }
    $display->setComponent($field_name)->save();

    $this->renderEntity([
      'address' => [
        'given_name'    => 'Joe',
        'family_name'   => 'Blogs',
        'organization'  => 'Devon Communities',
        'address_line1' => '123 Fake Street',
        'address_line2' => 'Business Park',
        'locality'      => 'Town',
        'postal_code'   => 'EX2 8LB',
        'country_code'  => 'GB',
      ],
      'geolocation' => [
        'lat' => rand(-90, 90) - rand(0, 999999) / 1000000,
        'lng' => rand(-90, 90) - rand(0, 999999) / 1000000,
      ],
      'text_long' => $this->randomMachineName(),
      'video_embed_field' => "https://www.youtube.com/watch?v={$this->randomMachineName()}",
      $field_name => $this->randomMachineName(),
      'view_mode' => 'sidebar',
    ]);

    $this->assertStringStartsWith(
      '<aside class="l-grid l-grid--quarters l-grid--flexy l-grid--dense"',
      trim($this->getRawContent()),
      'Is sidebar grid style.'
    );

    $elements = $this->cssSelect('.l-grid > [class="l-grid__item"]');
    $this->assertCount(1, $elements, 'Generic field.');
    $this->assertContains($field_name, reset($elements)->asXML(), 'Generic field.');

    $elements = $this->cssSelect('.l-grid > [class="l-grid__item l-grid__item--span-2"]');
    while (count($elements) > 0) {
      $element = array_shift($elements);

      foreach ($wide_field_types as $type) {
        if (strpos($element->asXML(), $type) !== FALSE) {
          continue 2;
        }
      }

      $this->fail('Wide fields.');
    }
  }

}
