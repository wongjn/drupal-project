<?php

namespace Drupal\{{ NAME }}_helper_test\Menu;

use Drupal\{{ NAME }}_helper\Menu\{{ UCAMEL }}MenuLinkTree;

/**
 * Test class mock for link tree service decorator.
 */
class Test{{ UCAMEL }}MenuLinkTree extends {{ UCAMEL }}MenuLinkTree {

  /**
   * {@inheritdoc}
   */
  protected function shouldExpandAll() {
    return TRUE;
  }

}
