<?php

namespace Drupal\Tests\{{ NAME }}\Unit;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\Render\ElementInfoManagerInterface;
use Drupal\{{ NAME }}\Element;
use Drupal\Tests\UnitTestCase;

/**
 * @coversDefaultClass \Drupal\{{ NAME }}\Element
 * @group {{ NAME }}
 */
class ElementTest extends UnitTestCase {

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
    $this->assertEquals($expected, Element::getWrapperAttributesKey($element));
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

  /**
   * @covers ::getThemeWrappers
   */
  public function testGetThemeWrappers() {
    $wrappers = [mb_strtolower($this->randomMachineName()) => mb_strtolower($this->randomMachineName())];
    $element = ['#theme_wrappers' => $wrappers];
    $this->assertEquals($wrappers, Element::getThemeWrappers($element), 'Returns explicit theme wrappers.');

    $this->elementInfo->method('getInfoProperty')->willReturn($wrappers);
    $element = ['#type' => 'test'];
    $this->assertEquals($wrappers, Element::getThemeWrappers($element), 'Returns wrappers via element info.');
  }

  /**
   * @covers ::replaceThemeWrapper
   * @dataProvider replaceThemeWrapperProvider
   */
  public function testReplaceThemeWrapper($element, $expected) {
    $this->assertEquals(
      $expected,
      Element::replaceThemeWrapper($element, 'form_element', 'form_element__component')
    );
  }

  /**
   * Provides test cases for ::testReplaceThemeWrapper().
   */
  public function replaceThemeWrapperProvider() {
    return [
      'Value' => [
        ['#theme_wrappers' => ['form_element']],
        ['form_element__component'],
      ],
      'Value multiple (1)' => [
        ['#theme_wrappers' => ['foo', 'form_element']],
        ['foo', 'form_element__component'],
      ],
      'Value multiple (2)' => [
        ['#theme_wrappers' => ['form_element', 'foo']],
        ['form_element__component', 'foo'],
      ],
      'With parameters' => [
        ['#theme_wrappers' => ['form_element' => ['#foo' => 'bar']]],
        ['form_element__component' => ['#foo' => 'bar']],
      ],
      'With parameters multiple (1)' => [
        [
          '#theme_wrappers' => [
            'foo' => ['#baz' => 1],
            'form_element' => ['#foo' => 'bar'],
          ],
        ],
        [
          'foo' => ['#baz' => 1],
          'form_element__component' => ['#foo' => 'bar'],
        ],
      ],
      'With parameters multiple (1)' => [
        [
          '#theme_wrappers' => [
            'form_element' => ['#foo' => 'bar'],
            'foo' => ['#baz' => 1],
          ],
        ],
        [
          'form_element__component' => ['#foo' => 'bar'],
          'foo' => ['#baz' => 1],
        ],
      ],
      'Mixed (1)' => [
        [
          '#theme_wrappers' => [
            0 => 'foo',
            'form_element' => ['#foo' => 'bar'],
            'foo' => ['#baz' => 1],
          ],
        ],
        [
          0 => 'foo',
          'form_element__component' => ['#foo' => 'bar'],
          'foo' => ['#baz' => 1],
        ],
      ],
      'Mixed (2)' => [
        [
          '#theme_wrappers' => [
            0 => 'form_element',
            1 => 'foo',
            'foo' => ['#baz' => 1],
          ],
        ],
        [
          0 => 'form_element__component',
          1 => 'foo',
          'foo' => ['#baz' => 1],
        ],
      ],
    ];

  }

}
