var assert = require('assert')
var Batch = require('../lib')

var stream = require('stream')
var util = require('util')

var FakeStream = function(array, options) {
  stream.Readable.call(this, options)
  this.array = array
}

util.inherits(FakeStream, stream.Readable)

FakeStream.prototype._read = function() {
  var item = this.array.shift()
  if(item instanceof Error) {
    throw item
  }
  setImmediate(function() {
    this.push(item)
  }.bind(this))
}


describe('basic functionality', function() {

  it('batches if source lenght is less than batch size', function(done) {
    var fake = new FakeStream(['one', 'two'])
    var batch = new Batch({size: 20})
    fake.pipe(batch)
    batch.once('readable', function() {
      var out = batch.read()
      assert.equal(out.length, 2)
      assert.equal(out[0], 'one')
      assert.equal(out[1], 'two')
      batch.once('end', done)
    })
  })

  it('batches if source lenght is greater than batch size', function(done) {
    var fake = new FakeStream([1, 2, {name: 'Brian'}], {objectMode: true})
    var batch = new Batch({size: 2})
    fake.pipe(batch)
    batch.once('readable', function() {
      var out = batch.read()
      assert.equal(out.length, 2)
      assert.equal(out[0], 1)
      assert.equal(out[1], 2)
      batch.once('readable', function() {
        var out = batch.read()
        assert.equal(out.length, 1)
        assert.equal(out[0].name, 'Brian')
        done()
      })
    })
  })

  it('applies back pressure correctly', function(done) {
    var fake = new FakeStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, new Error('Should not get here')], {objectMode: true})
    var batch = new Batch({size: 2, highWaterMark: 2})
    fake.pipe(batch)
    batch.once('readable', function() {
      assert.equal(batch.read().length, 2)
      batch.once('readable', function() {
        assert.equal(batch.read().length, 2)
        done()
      })
    })
  })

})
