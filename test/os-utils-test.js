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

//various tests for getArgsWithCallback
exports.getArgsWithCallback = {
  confirmResponseWithMaxArgs: function(test)
  {
    var param1 = 'param1'
    var param2 = function(){};
    var args = utils.getArgsWithCallback(2, [param1, param2]);
    test.deepEqual(args, [param1, param2], 'Should return same arguments as passed in');
    test.done();
  },
  confirmResponseWithLessArgs: function(test)
  {
    var param1 = function(){};
    var args = utils.getArgsWithCallback(2, [param1]);
    test.deepEqual(args, [undefined, param1], 'Should return array of same length with undefined elements for missing arguments');
    test.done();
  },
  confirmResponseWithMoreArgs: function(test)
  {
    var param1 = 'param1';
    var param2 = 'param2';
    var param3 = function(){};
    var args = utils.getArgsWithCallback(2, [param1, param2, param3]);
    test.deepEqual(args, [param1, param3], 'Should return array with additional arguments removed');
    test.done();
  }
  
};