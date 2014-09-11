var errors = require('../lib/os-errors.js');

exports.nativeError = {
  setUp: function(callback) {
    var mock_error = new Error('msg','no detail');
    this.err = mock_error;
    callback();
  },

  instanceOf: function(test) {
    test.ok(this.err instanceof Error, 'Should be an instanceof Error');
    test.done();
  },

  properties: function(test) {
    test.equal(this.err.message, 'msg', 'Should have a message');
    test.strictEqual(this.err.detail, undefined, 'Should not have a detail');
    test.done();
  },

  stack: function(test) {
    test.ok(this.err.stack, 'Should have a stack');
    test.done();
  }
};

exports.genericError = {
  cannotCreate: function(test) {
    test.throws(function() {
      var mock_error = new errors.OpenStackError();
    },'Should not allow direct creation')
    test.done();
  }
};

exports.specificError = {
  setUp: function(callback) {
    var mock_error = new errors.BadRequestError('det2');
    this.err = mock_error;
    callback();
  },

  instanceOf: function(test) {
    test.ok(this.err instanceof Error, 'Should be an instanceof Error');
    test.ok(this.err instanceof errors.OpenStackError, 'Should be an instanceof OpenStackError');
    test.ok(this.err instanceof errors.BadRequestError, 'Should be an instanceof BadRequestError');
    test.done();
  },

  properties: function(test) {
    test.equal(this.err.code, 'BadRequestError', 'Should inherit code');
    test.equal(this.err.message, 'Bad Request', 'Should inherit message');
    test.equal(this.err.status, 400, 'Should inherit status');
    test.equal(this.err.detail, 'det2', 'Should remember detail');
    test.done();
  },

  stack: function(test) {
    test.ok(this.err.stack, 'Should have a stack');
    test.ok(this.err.stack.indexOf('test/os-errors-test.js') > 0, 'Should have this file in the stack');
    test.equal(this.err.stack.indexOf('os-errors.js'), -1, 'Should NOT have the error library in the stack');
    test.done();
  }
};
