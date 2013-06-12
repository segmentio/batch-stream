var stream = require('readable-stream')
  , util   = require('util');


module.exports = BatchStream;


function BatchStream (options) {
  options || (options = {});
  stream.Transform.call(this, { objectMode : true });
  this.size  = options.size || 100;
  this.batch = [];
}
util.inherits(BatchStream, stream.Transform);


BatchStream.prototype._transform = function (chunk, encoding, callback) {
  this.batch.push(chunk);
  if (this.batch.length >= this.size) {
    this.push(this.batch);
    this.batch = [];
  }
  callback();
};


BatchStream.prototype._flush = function (callback) {
  this.push(this.batch);
  this.batch = [];
  callback();
};

