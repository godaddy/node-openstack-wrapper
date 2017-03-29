var utils = require('../lib/os-utils.js');


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
    test.deepEqual(args, [null, param1], 'Should return array of same length with undefined elements for missing arguments');
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