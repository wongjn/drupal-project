# JavaScript

JavaScript is handled by Webpack instead of Drupal. `index.js` is the entry
point for all JS functionality when a page loads.

# Async Behaviors

Drupal Behaviors that may eventually be loaded by webpack code-splitting should
be placed in the `behaviors` folder. Modules there should export a class.
When attached from `Drupal.attachBehaviors`, the constructor method will be
passed the element and `drupalSettings`.These classes are behaviors that are
managed by a custom implementation to manage garbage collection for attach and
detach states. See `AsyncBehavior.js` for implementation details.
