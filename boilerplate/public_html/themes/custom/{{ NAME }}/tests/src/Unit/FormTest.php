<?php

namespace Drupal\Tests\{{ NAME }}\Unit;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\Render\ElementInfoManagerInterface;
use Drupal\Tests\UnitTestCase;
use Drupal\{{ NAME }}\Form;

/**
 * @coversDefaultClass \Drupal\{{ NAME }}\Form
 * @group {{ NAME }}
 */
class FormTest extends UnitTestCase {

  /**
   * Mock element info manager service.
   *
   * @var Drupal\Core\Render\ElementInfoManagerInterface|\PHPUnit\Framework\MockObject\MockObject
   */
  protected $elementInfo;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->elementInfo = $this->createMock(ElementInfoManagerInterface::class);

    $container = new ContainerBuilder();
    $container->set('element_info', $this->elementInfo);
    \Drupal::setContainer($container);
  }

  /**
   * @covers ::getWrapperAttributesKey
   * @dataProvider wrapperAttributesKeyProvider
   */
  public function testGetWrapperAttributesKey($element, $info_property_result, $expected) {
    $this->elementInfo->method('getInfoProperty')->willReturn($info_property_result);
    $this->assertEquals($expected, Form::getWrapperAttributesKey($element));
  }

  /**
   * Provides test cases for ::testGetWrapperAttributesKey().
   */
  public function wrapperAttributesKeyProvider() {
    return [
      'Theme function' => [['#theme' => 'test'], [], '#attributes'],
      'Element' => [['#type' => 'test'], [], '#attributes'],
      'Element with form_element theme wrapper' => [
        ['#type' => 'test'],
        ['form_element'],
        '#wrapper_attributes',
      ],
      'Element with form_element theme wrapper (key)' => [
        ['#type' => 'test'],
        ['form_element' => ['#attributes' => []]],
        '#wrapper_attributes',
      ],
    ];
  }

}
