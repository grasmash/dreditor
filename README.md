# Dreditor

> An event and Promise based JavaScript parser and render (to HTML) for unified diff files.

```js
// Get a patch from somewhere on the file system.
var string = require('fs').readFileSync('./some-unified-diff.patch', 'utf8');

// Create a new Dreditor instance.
var dreditor = require('dreditor')();

dreditor
  // Parse the data.
  .parse(string)
  .then(function (/** @type {DreditorParser} */ parser) {
    // Do stuff with the DreditorParser instance before rendering it.
    return parser.render();
  })
  .then(function (/** @type {DreditorElement} */ output) {
    output.addClass('my-custom-class');
    console.log(output.toString());
  });
```
