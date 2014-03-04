var stream = require('readable-stream')
  , util   = require('util')


module.exports = BatchStream


function BatchStream(options) {
  options || (options = {})
  options.objectMode = true
  stream.Transform.call(this, options)
  this.size  = options.size || 100
  this.timeout = 'timeout' in options ? options.timeout : 5000
  this._prepare = options.transform || transform
  this._timer = 0
  this.batch = []
}
util.inherits(BatchStream, stream.Transform)


function transform(batch, callback) {
  callback(null, batch)
}

BatchStream.prototype._transform = function (chunk, encoding, callback) {
  var _this = this

  this.batch.push(chunk)

  if (this.batch.length >= this.size) {
    this._flush(callback)
    return
  }
  if (this.timeout) {
    if (this._timer) {
      clearTimeout(this._timer)
    }
    this._timer = setTimeout(function() {
      _this._flush(function() {
        _this.emit('timeout-flush')
      })
    }, this.timeout)
  }
  callback()
}


BatchStream.prototype._flush = function (callback) {
  var _this = this
  var batch = this.batch
  if (this._timer) {
    clearTimeout(this._timer)
  }
  // skip empty batches
  if (!batch.length) {
    return callback()
  }
  this._prepare(batch, function(err, items) {
    if (err) {
      // may emit an 'error' event here
      return callback(err)
    }
    if (items) {
      batch = items
    }
    _this.push(batch)
    _this.batch = []
    callback()
  })
}

