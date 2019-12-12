# Drupal 8 project managed with composer

[![Build Status](https://travis-ci.org/drupal-composer/drupal-project.svg?branch=8.x)](https://travis-ci.org/drupal-composer/drupal-project)

This project template provides a starter kit for managing your site
dependencies with [Composer](https://getcomposer.org/).

If you want to know how to use it as replacement for
[Drush Make](https://github.com/drush-ops/drush/blob/8.x/docs/make.md) visit
the [Documentation on drupal.org](https://www.drupal.org/node/2471553).

## Usage

First you need to [install composer](https://getcomposer.org/doc/00-intro.md#installation-linux-unix-osx).

> Note: The instructions below refer to the [global composer installation](https://getcomposer.org/doc/00-intro.md#globally).
You might need to replace `composer` with `php composer.phar` (or similar)
for your setup.

After that you can create the project (the directory name will be used as module
and theme names, so should only contain the same valid characters):

```
composer create-project wongjn/drupal-project:8.x-dev --no-interaction --repository-url="https://wongjn.github.io/composer-repo/repo/" some_dir
cd some_dir
composer run-script boilerplate 'Project human-readable name' 'Composer vendor name'
```

Install Drupal with drush:

```
cd some-dir/public_html
../vendor/bin/drush site-install minimal --db-url=mysql://DBUSER:DBPASS@localhost/DBNAME --config-dir=../config/dir
```

With `composer require ...` you can download new dependencies to your
installation.

```
cd some-dir
composer require drupal/devel:~1.0
```

The `composer create-project` command passes ownership of all files to the
project that is created. You should create a new git repository, and commit
all files not excluded by the .gitignore file.

## What does the template do?

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

## Generate composer.json from existing project

With using [the "Composer Generate" drush extension](https://www.drupal.org/project/composer_generate)
you can now generate a basic `composer.json` file from an existing project. Note
that the generated `composer.json` might differ from this project's file.


## FAQ

### Should I commit the contrib modules I download?

Composer recommends **no**. They provide [argumentation against but also
workrounds if a project decides to do it anyway](https://getcomposer.org/doc/faqs/should-i-commit-the-dependencies-in-my-vendor-directory.md).

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
            "Patch description": "URL or local path to patch"
        }
    }
}
```
### How do I switch from packagist.drupal-composer.org to packages.drupal.org?

Follow the instructions in the [documentation on drupal.org](https://www.drupal.org/docs/develop/using-composer/using-packagesdrupalorg).

### How do I specify a PHP version ?

This project supports PHP 5.6 as minimum version (see [Drupal 8 PHP requirements](https://www.drupal.org/docs/8/system-requirements/drupal-8-php-requirements)), however it's possible that a `composer update` will upgrade some package that will then require PHP 7+.

To prevent this you can add this code to specify the PHP version you want to use in the `config` section of `composer.json`:
```json
"config": {
    "sort-packages": true,
    "platform": {
        "php": "5.6.40"
    }
},
```
