var util = require('util');
var Nova = require('../lib/nova.js');
var nova = new Nova('mock_url', 'mock_token');

//returns a mock request object for dependency injection with the get method calling back with the given 3 values
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
    var result = nova.getRequestOptions('/mock_path', {meh: 'meh'});
    var expected_result = {
      uri: 'mock_url/mock_path',
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



exports.listServers = {
  setUp: function(callback){
    callback();
  },

  confirmArrayOnSuccess: function(test)
  {
    var mock_request = getMockRequest(null, 200, {servers:[{status: 'ACTIVE'}]});
    nova.setRequest(mock_request);

    nova.listServers(function(error, result){
      test.ifError(error, 'There should be no error');
      test.equal(result[0].status, 'ACTIVE', 'value should be "ACTIVE"');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.listServers(function(error, result){
      test.ok(error, 'There should be an error object');
      test.done();
    });
  }
};



exports.getServer = {
  confirmObjectOnSuccess: function(test)
  {
    var mock_request = getMockRequest(null, 200, {server:{status: 'ACTIVE'}});
    nova.setRequest(mock_request);

    nova.getServer('mock_id', function(error, result){
      test.ifError(error, 'There should be no error');
      test.equal(result.status, 'ACTIVE', 'value should be "ACTIVE"');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.getServer('mock_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.createServer = {
  confirmObjectOnSuccess: function(test)
  {
    var mock_request = getMockRequest(null, 200, {server:{status: 'ACTIVE'}});
    nova.setRequest(mock_request);

    nova.createServer('mock_id', function(error, result){
      test.ifError(error, 'There should be no error');
      test.equal(result.status, 'ACTIVE', 'value should be "ACTIVE"');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.createServer('mock_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.renameServer = {
  confirmNoErrorOnValidStatus: function(test)
  {
    var mock_request = getMockRequest(null, 200, 'mock_response');
    nova.setRequest(mock_request);

    nova.renameServer('mock_id', 'mock_name', function(error){
      test.ifError(error, 'There should be no error');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.renameServer('mock_id', 'mock_name', function(error){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.resizeServer = {
  confirmNoErrorOnValidStatus: function(test)
  {
    var mock_request = getMockRequest(null, 200, 'mock_response');
    nova.setRequest(mock_request);

    nova.resizeServer('mock_id', 'mock_flavor_id', function(error){
      test.ifError(error, 'There should be no error');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.resizeServer('mock_id', 'mock_flavor_id', function(error){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.confirmResizeServer = {
  confirmNoErrorOnValidStatus: function(test)
  {
    var mock_request = getMockRequest(null, 200, 'mock_response');
    nova.setRequest(mock_request);

    nova.confirmResizeServer('mock_id', function(error){
      test.ifError(error, 'There should be no error');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.confirmResizeServer('mock_id', function(error){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.revertResizeServer = {
  confirmNoErrorOnValidStatus: function(test)
  {
    var mock_request = getMockRequest(null, 200, 'mock_response');
    nova.setRequest(mock_request);

    nova.revertResizeServer('mock_id', function(error){
      test.ifError(error, 'There should be no error');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.revertResizeServer('mock_id', function(error){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.removeServer = {
  confirmNoErrorOnValidStatus: function(test)
  {
    var mock_request = getMockRequest(null, 200, 'mock response');
    nova.setRequest(mock_request);

    nova.removeServer('mock_id', function(error){
      test.ifError(error, 'There should be no error');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.removeServer('mock_id', function(error){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.rebootServer = {
  confirmNoErrorOnValidStatus: function(test)
  {
    var mock_request = getMockRequest(null, 200, 'mock response');
    nova.setRequest(mock_request);

    nova.rebootServer('mock_id', function(error){
      test.ifError(error, 'There should be no error');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.rebootServer('mock_id', function(error){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.forceRebootServer = {
  confirmNoErrorOnValidStatus: function(test)
  {
    var mock_request = getMockRequest(null, 200, 'mock response');
    nova.setRequest(mock_request);

    nova.forceRebootServer('mock_id', function(error){
      test.ifError(error, 'There should be no error');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.forceRebootServer('mock_id', function(error){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.stopServer = {
  confirmNoErrorOnValidStatus: function(test)
  {
    var mock_request = getMockRequest(null, 200, 'mock response');
    nova.setRequest(mock_request);

    nova.stopServer('mock_id', function(error){
      test.ifError(error, 'There should be no error');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.stopServer('mock_id', function(error){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.startServer = {
  confirmNoErrorOnValidStatus: function(test)
  {
    var mock_request = getMockRequest(null, 200, 'mock response');
    nova.setRequest(mock_request);

    nova.startServer('mock_id', function(error){
      test.ifError(error, 'There should be no error');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.startServer('mock_id', function(error){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.pauseServer = {
  confirmNoErrorOnValidStatus: function(test)
  {
    var mock_request = getMockRequest(null, 200, {meh: 'meh'});
    nova.setRequest(mock_request);

    nova.pauseServer('mock_id', function(error){
      test.ifError(error, 'There should be no error');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.pauseServer('mock_id', function(error){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.suspendServer = {
  confirmNoErrorOnValidStatus: function(test)
  {
    var mock_request = getMockRequest(null, 200, {meh: 'meh'});
    nova.setRequest(mock_request);

    nova.suspendServer('mock_id', function(error){
      test.ifError(error, 'There should be no error');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.suspendServer('mock_id', function(error){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.resumeServer = {
  confirmNoErrorOnSuccess: function(test)
  {
    //can't use the normal getMockRequest here as there are actually 2 requests in this function
    //first a get in getById then a post in the actual function
    var mock_request = {
      get: function(options_array, callback){
        callback(null, {statusCode: 200}, {server: {status: 'PAUSED'}});
      },
      post: function(options_array, callback){
        callback(null, {statusCode: 200}, {meh: 'meh'});
      }
    };
    nova.setRequest(mock_request);

    nova.resumeServer('mock_id', function(error){
      test.ifError(error, 'There should be no error');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.resumeServer('mock_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.getServerConsoleUrl = {
  confirmURLOnSuccess: function(test)
  {
    var mock_request = getMockRequest(null, 200, {console: {url: 'http://something'}});
    nova.setRequest(mock_request);

    nova.getServerConsoleURL('mock-type', 'mock_id', function(error, result){
      test.ifError(error, 'There should be no error');
      test.equal(result, 'http://something', 'value should be boolean "http://something"');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.getServerConsoleURL('mock-type', 'mock_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.getServerLog = {
  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.getServerLog('mock_id', 50, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.createServerImage = {
  confirmResponseOnSuccess: function(test)
  {
    var mock_request = {
      post: function(options_array, callback){
        callback(null, {statusCode: 200, headers: {location: '/images/image_id'}}, {output: {result: 'result'}});
      }
    };
    nova.setRequest(mock_request);

    nova.createServerImage('mock_id', {meh: 'meh'}, function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual({result: 'result', ImageId: 'image_id'}, result, 'value should be {result: "result", ImageId: "image_id"}');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.createServerImage('mock_id', {meh: 'meh'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};


//tests Nova.Instance.setMetadata()
exports.setServerMetadata = {
  confirmResponseOnSuccess: function(test)
  {
    var mock_request = getMockRequest(null, 200, {x:'x'});
    nova.setRequest(mock_request);

    nova.setServerMetadata('mock_id', {meh: 'meh'}, function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual({x:'x'}, result, 'value should be {x: "x"}');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.setServerMetadata('mock_id', {meh: 'meh'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.listFlavors = {
  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.listFlavors(function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};


exports.getFlavor = {
  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.getFlavor("id", function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.floatinglistFloatingIpsip_list = {
  confirmArrayOnSuccess: function(test)
  {
    var mock_request = getMockRequest(null, 200, {floating_ips:[{status: 'ACTIVE'}]});
    nova.setRequest(mock_request);

    nova.listFloatingIps(function(error, result){
      test.ifError(error, 'There should be no error');
      test.equal(result[0].status, 'ACTIVE', 'value should be "ACTIVE"');
      test.done();
    });
  },
  
  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.listFloatingIps(function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.getFloatingIp = {
  confirmObjectOnSuccess: function(test)
  {
    var mock_request = getMockRequest(null, 200, {floating_ip: {meh: 'meh'}});
    nova.setRequest(mock_request);
    
    nova.getFloatingIp('mock_id', function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, {meh: 'meh'}, 'value should be an object {meh: "meh"}');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.getFloatingIp("id", function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.createFloatingIp = {
  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.createFloatingIp({}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.removeFloatingIp = {
  confirmNoErrorOnSuccess: function(test)
  {
    var mock_request = getMockRequest(null, 200, true);
    nova.setRequest(mock_request);

    nova.removeFloatingIp('mock_id', function(error){
      test.ifError(error, 'There should be no error');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.removeFloatingIp("id", function(error){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.associateFloatingIp = {
  confirmNoErrorOnSuccess: function(test)
  {
    var mock_request = getMockRequest(null, 204, true);
    nova.setRequest(mock_request);

    nova.associateFloatingIp('mock_id', 'mock-address', function(error){
      test.ifError(error, 'There should be no error');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.associateFloatingIp("mock_id", 'mock-address', function(error){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.disassociateFloatingIp = {
  confirmNoErrorOnSuccess: function(test)
  {
    var mock_request = getMockRequest(null, 204, true);
    nova.setRequest(mock_request);

    nova.disassociateFloatingIp('mock_id', 'mock-address', function(error, result){
      test.ifError(error, 'There should be no error');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.disassociateFloatingIp("mock_id", 'mock-address', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.listFloatingIpPools = {
  setUp: function(cb){
    this.valid_response_body = {floating_ip_pools: [{name: 'mock_id'}]};
    this.valid_result = [{name: 'mock_id'}];

    cb();
  },

  confirmArrayOnSuccess: function(test)
  {
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    nova.setRequest(mock_request);

    nova.listFloatingIpPools(function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.listFloatingIpPools(function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.getFloatingIpPool = {
  setUp: function(cb){
    //this function will actually call listIpPools so use a valid response body for that
    this.valid_response_body = {floating_ip_pools: [{name: 'mock_id'}]};
    //just need the individual matching object though for the valid result check
    this.valid_result = {name: 'mock_id'};

    cb();
  },


  confirmObjectOnSuccess: function(test)
  {
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    nova.setRequest(mock_request);

    nova.getFloatingIpPool('mock_id', function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.getFloatingIpPool("not-testid", function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.listAvailabilityZones = {
  setUp: function(cb){
    this.valid_response_body = {availabilityZoneInfo:[{zoneName: 'mock_name1'}, {zoneName: 'mock_name2'}]};
    this.valid_result = [{zoneName: 'mock_name1'}, {zoneName: 'mock_name2'}];

    cb();
  },

  confirmArrayValuesOnSuccess: function(test)
  {
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    nova.setRequest(mock_request);

    nova.listAvailabilityZones(function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'value should match object: ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.listAvailabilityZones(function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.getAvailabilityZone = {
   setUp: function(cb){
    this.valid_response_body = {availabilityZoneInfo:[{zoneName: 'mock_name'}, {zoneName: 'mock_name2'}]};
    this.valid_result = {zoneName: 'mock_name'};

    cb();
  },

  confirmObjectOnSuccess: function(test)
  {
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    nova.setRequest(mock_request);

    nova.getAvailabilityZone('mock_name', function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'value should be an object: ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.getAvailabilityZone("not-testname", function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.listKeyPairs = {
  setUp: function(cb){
    this.valid_response_body = {keypairs:[{keypair: {name: 'mock_name'}}, {keypair: {name: 'mock_name2'}}]};
    this.valid_result = [{name: 'mock_name'}, {name: 'mock_name2'}];

    cb();
  },

  confirmArrayValuesOnSuccess: function(test)
  {
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    nova.setRequest(mock_request);

    nova.listKeyPairs(function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'value should match object: ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.listKeyPairs(function(error, result){
      test.ok(error, 'Should be an error object');
      test.done();
    });
  }
};



exports.getKeyPair = {
  confirmObjectOnSuccess: function(test)
  {
    var mock_request = getMockRequest(null, 200, {keypair: {meh: 'meh'}});
    nova.setRequest(mock_request);

    nova.getKeyPair('mock_id', function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, {meh: 'meh'}, 'value should be an object {meh: "meh"}');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.getKeyPair('mock_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.createKeyPair = {
  confirmObjectOnSuccess: function(test)
  {
    var mock_request = getMockRequest(null, 200, {keypair: {meh: 'meh'}});
    nova.setRequest(mock_request);

    nova.createKeyPair('mock_name', 'mock-key', function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, {meh: 'meh'}, 'value should be an object {meh: "meh"}');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.createKeyPair('mock_name', 'mock-key', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.removeKeyPair = {
  confirmSuccessOn200: function(test)
  {
    var mock_request = getMockRequest(null, 200, {keypair: {meh: 'meh'}});
    nova.setRequest(mock_request);

    nova.removeKeyPair('mock_id', function(error, result){
      test.ifError(error, 'There should be no error');
      //I think thats all we can test for...
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.removeKeyPair('mock_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.getQuotaSet = {
  setUp: function(cb){
    this.valid_response_body = {quota_set: {ram: 1234}};
    this.valid_result = {ram: 1234};

    cb();
  },

  confirmValueOnSuccess: function(test)
  {
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    nova.setRequest(mock_request);

    nova.getQuotaSet('mock_id', function(error, result){
      test.ifError(error, 'There should be no error')
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.getQuotaSet('mock_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};




exports.setQuotaSet = {
  setUp: function(cb){
    this.valid_response_body = {quota_set: {ram: 1234}};
    this.valid_result = {ram: 1234};

    cb();
  },

  confirmValueOnSuccess: function(test)
  {
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    nova.setRequest(mock_request);

    nova.setQuotaSet('mock_id', {ram: 1234}, function(error, result){
      test.ifError(error, 'There should be no error')
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.setQuotaSet('mock_id', {}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};


exports.getTenantUsage = {
  setUp: function(cb){
    this.valid_response_body = {tenant_usage: {total_hours: 3.14167}};
    this.valid_result = {total_hours: 3.14167};

    cb();
  },

  confirmTenantUsageOnSuccess: function(test)
  {
    var self = this;
    var start_date = new Date();
    var end_date = new Date();
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    nova.setRequest(mock_request);

    nova.getTenantUsage('mock_id', start_date, end_date, function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'value should be an object: ' +  JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    var start_date = new Date();
    var end_date = new Date();
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.getTenantUsage('mock_id', start_date, end_date, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.assignSecurityGroup = {
  confirmNoErrorOn200: function(test)
  {
    var mock_request = getMockRequest(null, 200, {meh: 'meh'});
    nova.setRequest(mock_request);

    nova.assignSecurityGroup('mock_name', 'mock_id', function(error, response){
      test.ifError(error, 'There should be no error');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.assignSecurityGroup('mock_name', 'mock_id', function(error, response){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.removeSecurityGroup = {
  confirmValuesOnSuccess: function(test)
  {
    var mock_request = getMockRequest(null, 200, {meh: 'meh'});
    nova.setRequest(mock_request);

    nova.removeSecurityGroup('mock_name', 'mock_id', function(error, response){
      test.ifError(error, 'There should be no error');
      test.done();
    });
  },

  confirmErrorOn5Error: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.removeSecurityGroup('mock_name', 'mock_id', function(error, response){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.getImageMetaData = {
  confirmResponseOnSuccess: function(test)
  {
    var mock_request = getMockRequest(null, 200, {metadata: {x:'x'}});
    nova.setRequest(mock_request);

    nova.getImageMetaData('mock_id', function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual({x:'x'}, result, 'value should be {x: "x"}');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.getImageMetaData('mock_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.setImageMetadata = {
  confirmResponseOnSuccess: function(test)
  {
    var mock_request = getMockRequest(null, 200, {metadata: {x:'x'}});
    nova.setRequest(mock_request);

    nova.setImageMetaData('mock_id', {meh: 'meh'}, function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual({x:'x'}, result, 'value should be {x: "x"}');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    nova.setRequest(mock_request);

    nova.setImageMetaData('mock_id', {meh: 'meh'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};
