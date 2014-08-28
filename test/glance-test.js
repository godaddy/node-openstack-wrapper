var Glance = require('../lib/glance.js');
var glance = new Glance('http://meh', 'faketoken');


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



//various tests for glance.list()
exports.list = {
  setUp: function(callback){
    callback();
  },
  
  confirmErrorOnInvalidJSONBody: function(test)
  {
    //stub out the request for an 200 response with junk json in the body
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    glance.setRequest(mock_request);
    
    glance.list(function(error, access_token){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  },
  
  
  confirmErrorOnInvalidStringBody: function(test)
  {
    //stub out the request for an 200 response with junk text in the body
    var mock_request = getMockRequest(null, 200, 'meh');
    glance.setRequest(mock_request);
    
    glance.list(function(error, access_token){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  },
  
  
  confirmErrorOnNon200: function(test)
  {
    //stub out request for an automagic 500 with junk text in the body
    var mock_request = getMockRequest(null, 500, 'Our server just borked');
    glance.setRequest(mock_request);
    
    glance.list(function(error, access_token){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  }
};



//various tests for glance.get
exports.get = {
  confirmErrorOnInvalidJSONBody: function(test)
  {
    //stub out the request for an 200 response with junk json in the body
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    glance.setRequest(mock_request);
    
    glance.get('mock-id', function(error, access_token){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  },
  
  
  confirmErrorOnInvalidStringBody: function(test)
  {
    //stub out the request for an 200 response with junk text in the body
    var mock_request = getMockRequest(null, 200, 'meh');
    glance.setRequest(mock_request);
    
    glance.get('mock-id', function(error, access_token){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  },
  
  
  confirmErrorOnNon200: function(test)
  {
    //stub out request for an automagic 500 with junk text in the body
    var mock_request = getMockRequest(null, 500, 'Our server just borked');
    glance.setRequest(mock_request);
    
    glance.get('mock-id', function(error, access_token){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  }
};


//various tests for glance.queue
exports.queue = {
  confirmErrorOnInvalidJSONBody: function(test)
  {
    //stub out the request for an 200 response with junk json in the body
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    glance.setRequest(mock_request);
    
    glance.queue({}, function(error, access_token){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  },
  
  
  confirmErrorOnInvalidStringBody: function(test)
  {
    //stub out the request for an 200 response with junk text in the body
    var mock_request = getMockRequest(null, 200, 'meh');
    glance.setRequest(mock_request);
    
    glance.queue({}, function(error, access_token){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  },
  
  
  confirmErrorOnNon200: function(test)
  {
    //stub out request for an automagic 500 with junk text in the body
    var mock_request = getMockRequest(null, 500, 'Our server just borked');
    glance.setRequest(mock_request);
    
    glance.queue({}, function(error, access_token){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  }
};



//various tests for glance.update
exports.update = {
  confirmErrorOnInvalidJSONBody: function(test)
  {
    //stub out the request for an 200 response with junk json in the body
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    glance.setRequest(mock_request);
    
    glance.update('mock-id', {}, function(error, access_token){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  },
  
  
  confirmErrorOnInvalidStringBody: function(test)
  {
    //stub out the request for an 200 response with junk text in the body
    var mock_request = getMockRequest(null, 200, 'meh');
    glance.setRequest(mock_request);
    
    glance.update('mock-id', {}, function(error, access_token){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  },
  
  
  confirmErrorOnNon200: function(test)
  {
    //stub out request for an automagic 500 with junk text in the body
    var mock_request = getMockRequest(null, 500, 'Our server just borked');
    glance.setRequest(mock_request);
    
    glance.update('mock-id', {}, function(error, access_token){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  }
};



//various tests for glance.remove
exports.remove = {
  confirmErrorOnInvalidJSONBody: function(test)
  {
    //stub out the request for an 200 response with junk json in the body
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    glance.setRequest(mock_request);
    
    glance.remove('mock-id', function(error, access_token){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  },
  
  
  confirmErrorOnInvalidStringBody: function(test)
  {
    //stub out the request for an 200 response with junk text in the body
    var mock_request = getMockRequest(null, 200, 'meh');
    glance.setRequest(mock_request);
    
    glance.remove('mock-id', function(error, access_token){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  },
  
  
  confirmErrorOnNon200: function(test)
  {
    //stub out request for an automagic 500 with junk text in the body
    var mock_request = getMockRequest(null, 500, 'Our server just borked');
    glance.setRequest(mock_request);
    
    glance.remove('moc-id', function(error, access_token){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  }
};
