require('should')

var after = require('after')
var BatchStream = require('../')

describe('BatchStream', function() {
  it('should transform data into Array', function(done) {
    var batch = new BatchStream()
    for (var i = 0; i < 100; i++) {
      batch.write(i)
    }
    batch.on('data', function(data) {
      data.should.be.instanceof(Array).and.have.lengthOf(100)
      done()
    })
  })
  it('should accept option `size`', function(done) {
    var batch = new BatchStream({ size: 50 })
    for (var i = 0; i < 100; i++) {
      batch.write(i)
    }
    done = after(2, done)
    batch.on('data', function(data) {
      data.should.have.lengthOf(50)
      done()
    })
  })
  it('should accept option `timeout`', function(done) {
    var batch = new BatchStream({ timeout: 100 })
    var start = new Date()
    for (var i = 0; i < 2; i++) {
      batch.write('not enough')
    }
    for (var i = 0; i < 100; i++) {
      setTimeout(function() {
        batch.write('enough')
      }, 100 + i)
    }
    batch.once('data', function(data) {
      var time = new Date() - start
      data.should.have.lengthOf(2)
      time.should.be.within(100, 110)
      batch.once('data', function(data) {
        data.should.not.include('not enough')
        data.should.have.lengthOf(100)
        done()
      })
    })
  })
  it('should emit transformed data', function(done) {
    var transformed = []
    var batch = new BatchStream({
      transform: function(items, callback) {
        callback(null, transformed)
      },
      timeout: 10
    })
    batch.write(1)
    batch.on('data', function(data) {
      data.should.equal(transformed)
      done()
    })
  })
  it('should flush remaining data', function(done) {
    var transformed = []
    var batch = new BatchStream({
      size: 3,
      transform: function(items, callback) {
        transformed.push(items)
        callback()
      }
    })
    var expected = [ [0,1,2], [3,4,5], [6,7] ]
    var got = []
    batch.on('data', function(data) {
      got.push(data)
    })
    batch.on('finish', function() {
      got.should.eql(expected)
      got.should.eql(transformed)
      done()
    })
    for (var i = 0; i < 8; i++) {
      batch.write(i)
    }
    batch.end()
  })
})
