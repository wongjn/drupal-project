<?php

namespace Drupal\Tests\{{ NAME }}_file_browser\Kernel;

use Drupal\Core\Entity\Entity\EntityFormDisplay;
use Drupal\Core\Form\FormState;
use Drupal\entity_test\Entity\EntityTest;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\field\Entity\FieldConfig;
use Drupal\KernelTests\Core\Entity\EntityKernelTestBase;

/**
 * Tests modifications to the file browser field widget.
 *
 * @group {{ NAME }}_file_browser
 */
class {{ UCAMEL }}FileBrowserWidgetTest extends EntityKernelTestBase {

  /**
   * {@inheritdoc}
   */
  public static $modules = [
    '{{ NAME }}_file_browser',
    'entity_browser',
    'image',
    'file',
  ];

  /**
   * Tests field restrictions are printed in the field.
   */
  public function testHelpTest() {
    $field_name = 'testfield';
    $cardinality = 4;
    $file_extensions = 'png gif';
    $max_filesize = 15;
    $max_resolution = '123x456';
    $min_resolution = '987x654';

    FieldStorageConfig::create([
      'field_name' => $field_name,
      'entity_type' => 'entity_test',
      'type' => 'image',
      'cardinality' => $cardinality,
    ])->save();

    FieldConfig::create([
      'entity_type' => 'entity_test',
      'bundle' => 'entity_test',
      'field_name' => $field_name,
      'settings' => [
        'file_extensions' => $file_extensions,
        'max_filesize' => "${max_filesize}K",
        'max_resolution' => $max_resolution,
        'min_resolution' => $min_resolution,
      ],
    ])->save();

    // Create form display.
    $display = EntityFormDisplay::create([
      'targetEntityType' => 'entity_test',
      'bundle' => 'entity_test',
      'mode' => 'default',
      'status' => TRUE,
    ])
      ->setComponent($field_name, [
        'type' => 'entity_browser_file',
        'settings' => [
          'entity_browser' => 'browse_files',
        ],
      ]);

    $form = [];
    $form_state = (new FormState())->setUserInput([]);
    $display->buildForm(EntityTest::create(), $form, $form_state);
    $this->render($form[$field_name]);

    // Check help text is printed out.
    $this->assertText("$cardinality files");
    $this->assertText($file_extensions);
    $this->assertText("$max_filesize KB");
    $this->assertRaw("<strong>$max_resolution</strong>");
    $this->assertRaw("<strong>$min_resolution</strong>");
  }

}
