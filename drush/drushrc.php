<?php

/**
 * @file
 * Drush runtime config (drushrc) file.
 */

/**
 * Useful shell aliases:
 *
 * Drush shell aliases act similar to git aliases.  For best results, define
 * aliases in one of the drushrc file locations between #3 through #6 above.
 * More information on shell aliases can be found via:
 * `drush topic docs-shell-aliases` on the command line.
 *
 * @see https://git.wiki.kernel.org/index.php/Aliases#Advanced
 */
$options['shell-aliases']['don'] = 'pm-enable devel devel_generate kint views_ui config_split';
$options['shell-aliases']['doff'] = 'pm-uninstall devel devel_generate kint views_ui config_split';

/**
 * Remove colour output due to Windows incompatibility.
 */
$options['nocolor'] = TRUE;
