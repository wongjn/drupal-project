# SASS

The directory contains the SASS files, organized into folders by their roles:

- **lib:** this folder should contain utility code (such as variables, mixin
 and functions) that does not output any CSS by itself.
- **base:** base styles and resets, should only contain element selectors.
- **layout:** styles for layout purposes, such as grids or containers.
Selectors should be namespaced by prefixing with `l-`.
- **objects:** low-level UI components such as buttons or any other
element-like component. These are different from *components* by the fact that
they should not contain any other *components* or *objects*. Namespaced by `o-`.
- **components:** higher-level UI components that are more specialized and
particular in their usage, such as a modal. Namespaced by `c-`.
- **speciality:** even more specialized components than *components*, these are
components used **once** at a very particular spot on any given page. Namespaced
by `s-`.
- **theme.css:** theme styles that are not attached to a particular component
or object.
- **utilities.css:** single purpose utility classes for one-off adjustments to
an element. Discouraged in favor of a style in the *component* or *object* if
possible. Namespaced by `u-`.

There are also theme styles namespaced with `t-` that are added to the above
files that affect the appearance of the components.

## Browsersync

To make use of Browsersync auto-updating, add the following to the settings.php:

```php
$settings['browsersync'] = TRUE;
```
