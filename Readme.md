Batch Stream
============

Transform stream which batches a bunch of input data into groups of specified size.
Will emit arrays, so that you can deal with pieces of input asynchronously.

## Usage

```javascript

var batch = new BatchStream({
  size : 100,     // the size for each chunk
  timeout: 5000   // emit data after this amount of milliseconds
                 // even if the size of buffered writes not reaching `size`
});

stream
  .pipe(batch)
  .pipe(new ArrayStream()); // deals with array input from pipe.

```

This is also usefull when you want transform continuous writes into batches:

Instead of:

```javascript
docs.on('data', function(doc) {
  db.insert(doc)
})
```

You can:

```javascript
var batch = new BatchStream({
  transform: function(items, callback) {
    db.bulkInsert(items, callback)
  })
})

docs.on('data', function(doc) {
  batch.write(doc)
})
```

## License

the MIT license.
