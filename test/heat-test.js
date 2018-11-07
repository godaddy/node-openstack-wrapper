var util = require('util');
var Heat = require('../lib/heat.js');
var heat = new Heat('http://mock_heat_url', 'mock_token');



//returns a mock request object for dependency injection with get/post/patch/del methods calling back with the given 3 values
function getMockRequest(return_error, return_status_code, return_response)
{
  function mockVerb(options_array, callback)
  {
    callback(return_error, {statusCode: return_status_code}, return_response);
  }

  var return_object = {
    get:mockVerb,
    post: mockVerb,
    patch: mockVerb,
    put: mockVerb,
    del: mockVerb
  };

  return return_object;
}



exports.getRequestOptions = {
  setUp: function(cb){
    cb();
  },

  confirmResult: function(test){
    var result = heat.getRequestOptions('/mock_path', {meh: 'meh'});
    var expected_result = {
      uri: 'http://mock_heat_url/mock_path',
      headers:{'X-Auth-Token': 'mock_token'},
      json: {meh: 'meh'},
      timeout: 9000,
      metricRequestID: '',
      metricUserName: '',
      metricLogger: null
    };

    test.deepEqual(result, expected_result, 'result should be ' + JSON.stringify(expected_result));
    test.done();
  }
};



exports.listStacks = {
  setUp: function(cb){
    this.valid_response_body = {stacks: [{id: 1}, {id: 2}]};
    this.valid_result = [{id: 1}, {id: 2}];

    cb();
  },

  confirmValidResultOnSuccess: function(test)
  {
    //stub out a request obj with a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    heat.setRequest(mock_request);

    heat.listStacks({}, function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },


  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    heat.setRequest(mock_request);

    heat.listStacks({}, function(error, result){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  }
};



exports.createStack = {
  setUp: function(cb){
    this.valid_response_body = {stack: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmValidResultOnSuccess: function(test)
  {
    //stub out a request obj with a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    heat.setRequest(mock_request);

    const options = {
      template_url: "http://mock_template_url"
    };
    heat.createStack('mock_stack_name', options, function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    heat.setRequest(mock_request);

    const options = {
      template_url: "http://mock_template_url"
    };
    heat.createStack('mock_stack_name', options, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.updateStack = {
  setUp: function(cb){
    cb();
  },

  confirmValidResultOnSuccess: function(test)
  {
    //stub out a request obj with a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, {});
    heat.setRequest(mock_request);

    const options = {
      template_url: "http://mock_template_url"
    };
    heat.updateStack('mock_stack_name', 'mock_stack_id', options, function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    heat.setRequest(mock_request);

    const options = {
      template_url: "http://mock_template_url"
    };
    heat.updateStack('mock_stack_name', 'mock_stack_id', options, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.deleteStack = {
  setUp: function(cb){
    cb();
  },

  confirmValidResultOnSuccess: function(test)
  {
    //stub out a request obj with a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, {});
    heat.setRequest(mock_request);

    heat.deleteStack('mock_stack_name', 'mock_stack_id', function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    heat.setRequest(mock_request);

    heat.deleteStack('mock_stack_name', 'mock_stack_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};
