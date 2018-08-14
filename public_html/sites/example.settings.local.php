<?php

// @codingStandardsIgnoreFile

/**
 * @file
 * Local development override configuration feature.
 *
 * To activate this feature, copy and rename it such that its path plus
 * filename is 'sites/default/settings.local.php'. Then, go to the bottom of
 * 'sites/default/settings.php' and uncomment the commented lines that mention
 * 'settings.local.php'.
 *
 * If you are using a site name in the path, such as 'sites/example.com', copy
 * this file to 'sites/example.com/settings.local.php', and uncomment the lines
 * at the bottom of 'sites/example.com/settings.php'.
 */

/**
 * Assertions.
 *
 * The Drupal project primarily uses runtime assertions to enforce the
 * expectations of the API by failing when incorrect calls are made by code
 * under development.
 *
 * @see http://php.net/assert
 * @see https://www.drupal.org/node/2492225
 *
 * If you are using PHP 7.0 it is strongly recommended that you set
 * zend.assertions=1 in the PHP.ini file (It cannot be changed from .htaccess
 * or runtime) on development machines and to 0 in production.
 *
 * @see https://wiki.php.net/rfc/expectations
 */
assert_options(ASSERT_ACTIVE, TRUE);
\Drupal\Component\Assertion\Handle::register();

/**
 * Enable local development services.
 */
$settings['container_yamls'][] = DRUPAL_ROOT . '/sites/development.services.yml';

$config['config_split.config_split.dev']['status'] = TRUE;
$config['system.file']['path']['temporary'] = 'c:/wamp64/tmp';
$config['system.logging']['error_level'] = ERROR_REPORTING_DISPLAY_VERBOSE;
$config['system.mail']['interface']['default'] = 'devel_mail_log';
$config['system.performance']['css']['preprocess'] = FALSE;
$config['system.performance']['js']['preprocess'] = FALSE;
$config['system.site']['page']['front'] = '/user/login';
$config['views.settings']['skip_cache'] = TRUE;
$config['views.settings']['ui']['show']['advanced_column'] = TRUE;
$config['views.settings']['ui']['show']['sql_query']['enabled'] = TRUE;

$settings['browsersync'] = TRUE;
$settings['cache']['bins']['dynamic_page_cache'] = 'cache.backend.null';
$settings['cache']['bins']['page'] = 'cache.backend.null';
$settings['cache']['bins']['render'] = 'cache.backend.null';
$settings['rebuild_access'] = TRUE;
$settings['skip_permissions_hardening'] = TRUE;
