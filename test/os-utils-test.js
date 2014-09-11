var utils = require('../lib/os-utils.js');


//various tests for isError()
exports.isError = {
  confirmTrueOnError: function(test)
  {
    var mock_error = new Error("meh");
    test.ok(utils.isError(mock_error, undefined), 'Should return boolean true');
    test.done();
  },

  confirmTrueOnInvalidResponse: function(test)
  {
    test.ok(utils.isError(null, {}), 'Should return boolean true');
    test.done();
  },

  confirmTrueOnErrorStatusCode: function(test)
  {
    test.ok(utils.isError(null, {statusCode: 444}), 'Should return boolean true');
    test.done();
  },

  confirmFalseOn200: function(test)
  {
    test.equal(utils.isError(null, {statusCode: 200}), false, 'Should return boolean false');
    test.done();
  }
};



//various tests for getError
exports.getError = {
  confirmErrorOnError: function(test)
  {
    test.ok(utils.getError('mock-function-name', null, undefined, ''), 'Should return an error object');
    test.done();
  },
};
