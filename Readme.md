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

Suppose you have a `docs` stream, instead of:

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

docs.pipe(batch)
.on('finish', function() {
  console.log('All doc inserted.')
})
```

Note that by passing a `options.transform` to the constructor, instead of
listening on `data` events, the insertions are ensured to be sequential.

If insertions are allowed to happen parrallelly:

```javascript
var batch = new BatchStream()

docs.pipe(batch)
.on('data', function(items) {
  db.bulkInsert(items, ...)
})
.on('finish', function() {
  console.log('All docs queued for insertion.')
})
```

In this case, you can use [options.highWaterMark](http://nodejs.org/api/stream.html#stream_new_stream_writable_options)
to control maximum concurrencies.

Consider the code:

```javascript
var batch = new BatchStream({
  highWaterMark: 2
})
var docs = new DbReadStream()

docs.on('data', function(doc) {
  var completed = batch.write(doc)
  if (!completed) {
    // water too high, pause read stream
    docs.pause()
    batch.once('drain', function() {
      docs.resume()
    })
  }
})

batch.on('data', function(items) {
  db.bulkInsert(items, ...)
})
```


## License

the MIT license.
