# JavaScript

JavaScript is handled by Webpack instead of Drupal. `index.js` is the entry
point for all JS functionality when a page loads.

## Lazy Behaviors

Drupal Behaviors that may eventually be loaded by webpack code-splitting should
be placed in the `behaviors` folder. See `./lib/behaviors` for details.
