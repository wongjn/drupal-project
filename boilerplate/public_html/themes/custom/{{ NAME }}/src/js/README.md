# JavaScript

JavaScript is loaded through [differential serving](https://css-tricks.com/differential-serving/).

WebPack and Babel have been configured to do this splitting, with more modern
syntax suffixed with `.modern.js` while older ES5 syntax uses `.legacy.js` when
compiled.
