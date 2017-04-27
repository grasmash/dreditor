# Dreditor

> An event and Promise based JavaScript parser and render (to HTML) for unified diff files.

```js
// Get a patch from somewhere on the file system.
let string = require('fs').readFileSync('./some-unified-diff.patch', 'utf8');

// Create a new Dreditor instance.
let dreditor = require('dreditor')();

dreditor
  // Parse the data.
  .parse(string)
  .then(function (/** @type {Parser} */ parser) {
    // Do stParserer.render();
  })
  .then(function (/** @type {Element} */ output) {
    output.addClass('my-custom-class');
    console.log(output.toString());
  });
```
