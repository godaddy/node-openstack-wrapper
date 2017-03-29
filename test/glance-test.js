var Glance = require('../lib/glance.js');
var glance = new Glance('http://mock_glance_url', 'mock_token');


//returns a mock request object for dependency injection with get/post/patch/del methods calling back with the given 3 values
function getMockRequest(return_error, return_status_code, return_response)
{
  function mockVerb(options_array, callback)
  {
    callback(return_error, {statusCode: return_status_code}, return_response);
  }

  var return_object = {
    get: mockVerb,
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
    var result = glance.getRequestOptions('/mock_path', {meh: 'meh'}, {extra_header: 'extra_header_value'});
    var expected_result = {
      uri: 'http://mock_glance_url/mock_path',
      headers:{'X-Auth-Token': 'mock_token', extra_header: 'extra_header_value'},
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



exports.listImages = {
  setUp: function(cb){
    this.valid_response_body = {images: [{id: 'mock_id'}, {id: 'mock_id2'}]};
    this.valid_result = [{id: 'mock_id'}, {id: 'mock_id2'}];

    cb();
  },

  confirmImagesOnSuccess: function(test)
  {
    //stub out request with a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    glance.setRequest(mock_request);


    glance.listImages(function(error, result){
      test.ifError(error, 'There should be no error')
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out request for an invalid status but an otherwise valid body (to ensure error on invalid status)
    var mock_request = getMockRequest(new Error('meh'), 500, this.valid_response_body);
    glance.setRequest(mock_request);

    glance.listImages(function(error, access_token){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.getImage = {
  setUp: function(cb){
    this.valid_response_body = {id: 'mock_id'};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmImageOnSuccess: function(test)
  {
    //stub out the request for a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    glance.setRequest(mock_request);

    glance.getImage('mock_id', function(error, result){
      test.ifError(error, 'There should be no error')
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out request for an invalid status with valid json body (to test the status triggers an error)
    var mock_request = getMockRequest(new Error('meh'), 500, this.valid_response_body);
    glance.setRequest(mock_request);

    glance.getImage('mock_id', function(error, result){
      test.ok(error, 'We should receive an error');
      test.done();
    });
  }
};



exports.queueImage = {
  setUp: function(cb){
    this.valid_response_body = {id: 'mock_id'};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmImageOnSuccess: function(test)
  {
    //stub out the request for a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    glance.setRequest(mock_request);

    glance.queueImage({}, function(error, result){
      test.ifError(error, 'There should be no error')
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },


  confirmErrorOnError: function(test)
  {
    //stub out request for an invalid status with valid json body (to test the status triggers an error)
    var mock_request = getMockRequest(new Error('meh'), 500, this.valid_response_body);
    glance.setRequest(mock_request);

    glance.queueImage({}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



//skipping uploadImage - not sure this is unit-testable in the normal fashion



exports.updateImage = {
    setUp: function(cb){
    this.valid_response_body = {id: 'mock_id'};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmImageOnSuccess: function(test)
  {
    //stub out request with a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    glance.setRequest(mock_request);

    glance.updateImage('mock_id', {}, function(error, result){
      test.ifError(error, 'There should be no error')
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },


  confirmErrorOnError: function(test)
  {
    //stub out request for a 500 with valid json in the body (to ensure the status triggers an error)
    var mock_request = getMockRequest(new Error('meh'), 500, 'Our server just borked');
    glance.setRequest(mock_request);

    glance.updateImage('mock_id', {}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.removeImage = {
  confirmNoErrorOnSuccess: function(test)
  {
    //stub out request with a completely valid response
    var mock_request = getMockRequest(null, 200, {});
    glance.setRequest(mock_request);

    glance.removeImage('mock_id', function(error, result){
      test.ifError(error, 'There should be no error');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out request for a 500 with valid json in the body (to ensure the status triggers an error)
    var mock_request = getMockRequest(new Error('meh'), 500, 'Our server just borked');
    glance.setRequest(mock_request);

    glance.removeImage('mock_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};
