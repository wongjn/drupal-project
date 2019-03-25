<?php

namespace Drupal\Tests\{{ NAME }}_file_browser\Functional;

use Drupal\Tests\BrowserTestBase;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\node\Entity\NodeType;
use Drupal\field\Entity\FieldConfig;
use Drupal\Core\Entity\Entity\EntityFormDisplay;

/**
 * Tests modifications to the file browser field widget.
 *
 * @group {{ NAME }}_file_browser
 */
class {{ UCAMEL }}FileBrowserWidgetTest extends BrowserTestBase {

  /**
   * {@inheritdoc}
   */
  public static $modules = [
    '{{ NAME }}_file_browser',
    'file_browser',
    'node',
  ];

  /**
   * Tests field restrictions are printed in the field.
   */
  public function testHelpTest() {
    $field_name = 'field_file_browser';
    $cardinality = 4;
    $file_extensions = 'png gif';
    $max_filesize = 15;
    $max_resolution = '123x456';
    $min_resolution = '987x654';

    // Create a node type for testing.
    NodeType::create(['type' => 'page', 'name' => 'page'])->save();

    // Create image field.
    $fieldStorage = FieldStorageConfig::create([
      'field_name' => $field_name,
      'entity_type' => 'node',
      'type' => 'image',
      'cardinality' => $cardinality,
    ]);
    $fieldStorage->save();
    $field = FieldConfig::create([
      'field_storage' => $fieldStorage,
      'bundle' => 'page',
      'settings' => [
        'file_extensions' => $file_extensions,
        'max_filesize' => "${max_filesize}K",
        'max_resolution' => $max_resolution,
        'min_resolution' => $min_resolution,
      ],
    ]);
    $field->save();

    // Create form display.
    EntityFormDisplay::create([
      'targetEntityType' => 'node',
      'bundle' => 'page',
      'mode' => 'default',
      'status' => TRUE,
    ])
      ->setComponent($field_name, [
        'type' => 'entity_browser_file',
        'settings' => [
          'entity_browser' => 'browse_files',
        ],
      ])
      ->save();

    $web_user = $this->drupalCreateUser([
      'create page content',
    ]);
    $this->drupalLogin($web_user);
    $this->drupalGet('node/add/page');

    // Check help text is printed out.
    $this->assertSession()->pageTextContains("$cardinality files");
    $this->assertSession()->pageTextContains($file_extensions);
    $this->assertSession()->pageTextContains("$max_filesize KB");
    $this->assertSession()->responseContains("<strong>$max_resolution</strong>");
    $this->assertSession()->responseContains("<strong>$min_resolution</strong>");
  }

}
