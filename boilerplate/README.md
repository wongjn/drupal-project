# {{ LABEL }} Drupal project managed with [Composer](https://getcomposer.org/)

[![Build status](https://github.com/projectcosmic/{{ NAME }}/workflows/Build/badge.svg)](https://github.com/projectcosmic/{{ NAME }}/actions?query=workflow%3ABuild)

## Usage

First you need to [install composer](https://getcomposer.org/doc/00-intro.md#installation-linux-unix-osx).

> Note: The instructions below refer to the [global composer installation](https://getcomposer.org/doc/00-intro.md#globally).
You might need to replace `composer` with `php composer.phar` (or similar)
for your setup.

After that you can install the project dependencies:

```
composer install
```

Install the Drupal site with drush:

```
./vendor/bin/drush site-install minimal \
    --db-url=mysql://DBUSER:DBPASS@localhost/DBNAME \
    --existing-config
```

With `composer require ...` you can download new dependencies to your
installation.

```
composer require drupal/devel:~1.0
```

## What does this project do?

When installing the given `composer.json` some tasks are taken care of:

* Drupal will be installed in the `public_html`-directory.
* Autoloader is implemented to use the generated composer autoloader in `vendor/autoload.php`,
  instead of the one provided by Drupal (`public_html/vendor/autoload.php`).
* Modules (packages of type `drupal-module`) will be placed in `public_html/modules/contrib/`
* Theme (packages of type `drupal-theme`) will be placed in `public_html/themes/contrib/`
* Profiles (packages of type `drupal-profile`) will be placed in `public_html/profiles/contrib/`
* Creates default writable versions of `settings.php` and `services.yml`.
* Creates `public_html/sites/default/files`-directory.
* Latest version of drush is installed locally for use at `vendor/bin/drush`.
* Latest version of DrupalConsole is installed locally for use at `vendor/bin/drupal`.

## Updating Drupal Core

This project will attempt to keep all of your Drupal Core files up-to-date; the
project [drupal/core-composer-scaffold](https://www.drupal.org/docs/develop/using-composer/using-drupals-composer-scaffold)
is used to ensure that your scaffold files are updated every time drupal/core is
updated.

## FAQ

### Should I commit the contrib modules I download?

Composer recommends **no**. They provide [argumentation against but also
workarounds if a project decides to do it anyway](https://getcomposer.org/doc/faqs/should-i-commit-the-dependencies-in-my-vendor-directory.md).

### How can I apply patches to downloaded modules?

If you need to apply patches (depending on the project being modified, a pull
request is often a better solution), you can do so with the
[composer-patches](https://github.com/cweagans/composer-patches) plugin.

To add a patch to drupal module foobar insert the patches section in the extra
section of composer.json:
```json
"extra": {
    "patches": {
        "drupal/foobar": {
            "Patch description": "URL to patch"
        }
    }
}
```
