var util = require('util');
var Neutron = require('../lib/neutron.js');
var neutron = new Neutron('http://mock_neutron_url', 'mock_token');



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
    var result = neutron.getRequestOptions('/mock_path', {meh: 'meh'});
    var expected_result = {
      uri: 'http://mock_neutron_url/mock_path',
      headers:{'X-Auth-Token': 'mock_token'},
      json: {meh: 'meh'},
      timeout: 9000
    };

    test.deepEqual(result, expected_result, 'result should be ' + JSON.stringify(expected_result));
    test.done();
  }
};



exports.listNetworks = {
  setUp: function(cb){
    this.valid_response_body = {networks: [{id: 1}, {id: 2}]};
    this.valid_result = [{id: 1}, {id: 2}];

    cb();
  },

  confirmValidResultOnSuccess: function(test)
  {
    //stub out a request obj with a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.listNetworks(function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmEmptyArrayOnInvalidJSONBody: function(test)
  {
    //stub out a request obj with an invalid json response - shouldn't trigger an error but instead give back a blank array
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    neutron.setRequest(mock_request);

    neutron.listNetworks(function(error, result){
      test.ifError(error, 'There should be no error');
      test.equal(util.isArray(result), true, 'value should be an array');
      test.equal(result.length, 0, 'value should be an empty array');
      test.done();
    });
  },

  confirmEmptyArrayOnInvalidStringBody: function(test)
  {
    //stub out a request obj with an invalid text response - shouldn't trigger an error but instead give back a blank array
    var mock_request = getMockRequest(null, 200, 'meh');
    neutron.setRequest(mock_request);

    neutron.listNetworks(function(error, result){
      test.ifError(error, 'There should be no error');
      test.equal(util.isArray(result), true, 'value should be an array');
      test.equal(result.length, 0, 'value should be an empty array');
      test.done();
    });
  },

  confirmErrorOnInvalidStatus: function(test)
  {
    //stub out a request obj with an invalid status but a valid json body (to ensure invalid status triggers error)
    var mock_request = getMockRequest(null, 500, this.valid_respone_body);
    neutron.setRequest(mock_request);

    neutron.listNetworks(function(error, result){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  }
};



exports.getNetwork = {
  setUp: function(cb){
    this.valid_response_body = {network: {id: 1}};
    this.valid_result = {id: 1};

    cb();
  },

  confirmFipsOnSuccess: function(test)
  {
    //stub out a request obj with a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.getNetwork('id', function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnInvalidJSONBody: function(test)
  {
    //stub out a request obj with an invalid json response - shouldn't trigger an error but instead give back a blank array
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    neutron.setRequest(mock_request);

    neutron.getNetwork('id', function(error, result){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  },

  confirmEmptyErrorOnInvalidStringBody: function(test)
  {
    //stub out a request obj with an invalid text response - shouldn't trigger an error but instead give back a blank array
    var mock_request = getMockRequest(null, 200, 'meh');
    neutron.setRequest(mock_request);

    neutron.getNetwork('id', function(error, result){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  },

  confirmErrorOnInvalidStatus: function(test)
  {
    //stub out a request obj with an invalid status but a valid json body (to ensure invalid status triggers error)
    var mock_request = getMockRequest(null, 500, this.valid_respone_body);
    neutron.setRequest(mock_request);

    neutron.getNetwork('id', function(error, result){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  }
};




exports.createFloatingIp = {
  setUp: function(cb){
    this.valid_response_body = {floatingip: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmValidResultOnSuccess: function(test)
  {
    //stub out a request obj with a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.createFloatingIp('mock_network_id', function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnInvalidJSONBody: function(test)
  {
    //stub out a request with a valid response status but invalid response json body
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    neutron.setRequest(mock_request);

    neutron.createFloatingIp('mock_network_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  },

  confirmErrorOnInvalidStringBody: function(test)
  {
    //stub out a request with a valid response status but a junk text response body
    var mock_request = getMockRequest(null, 200, 'meh');
    neutron.setRequest(mock_request);

    neutron.createFloatingIp('mock_network_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  },

  confirmErrorOnInvalidStatus: function(test)
  {
    var mock_request = getMockRequest(null, 500, 'Our server just borked');
    neutron.setRequest(mock_request);

    //stub out a request with an invalid status but a completely valid response body to test that invalid status triggers an error
    neutron.createFloatingIp('mock_network_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.listFloatingIps = {
  setUp: function(cb){
    this.valid_response_body = {floatingips: [{id: 1}, {id: 2}]};
    this.valid_result = [{id: 1}, {id: 2}];

    cb();
  },

  confirmPortsOnSuccess: function(test)
  {
    //stub out a request obj with a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.listFloatingIps(function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmEmptyArrayOnInvalidJSONBody: function(test)
  {
    //stub out a request obj with an invalid json response - shouldn't trigger an error but instead give back a blank array
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    neutron.setRequest(mock_request);

    neutron.listFloatingIps(function(error, result){
      test.ifError(error, 'There should be no error');
      test.equal(util.isArray(result), true, 'value should be an array');
      test.equal(result.length, 0, 'value should be an empty array');
      test.done();
    });
  },

  confirmEmptyArrayOnInvalidStringBody: function(test)
  {
    //stub out a request obj with an invalid text response - shouldn't trigger an error but instead give back a blank array
    var mock_request = getMockRequest(null, 200, 'meh');
    neutron.setRequest(mock_request);

    neutron.listFloatingIps(function(error, result){
      test.ifError(error, 'There should be no error');
      test.equal(util.isArray(result), true, 'value should be an array');
      test.equal(result.length, 0, 'value should be an empty array');
      test.done();
    });
  },

  confirmErrorOnInvalidStatus: function(test)
  {
    //stub out a request obj with an invalid status but a valid json body (to ensure invalid status triggers error)
    var mock_request = getMockRequest(null, 500, this.valid_respone_body);
    neutron.setRequest(mock_request);

    neutron.listFloatingIps(function(error, result){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  }
};



exports.getFloatingIp = {
  setUp: function(cb){
    this.valid_response_body = {floatingip: {id: 1}};
    this.valid_result = {id: 1};

    cb();
  },

  confirmFipsOnSuccess: function(test)
  {
    //stub out a request obj with a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.getFloatingIp('id', function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnInvalidJSONBody: function(test)
  {
    //stub out a request obj with an invalid json response - shouldn't trigger an error but instead give back a blank array
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    neutron.setRequest(mock_request);

    neutron.getFloatingIp('id', function(error, result){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  },

  confirmEmptyErrorOnInvalidStringBody: function(test)
  {
    //stub out a request obj with an invalid text response - shouldn't trigger an error but instead give back a blank array
    var mock_request = getMockRequest(null, 200, 'meh');
    neutron.setRequest(mock_request);

    neutron.getFloatingIp('id', function(error, result){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  },

  confirmErrorOnInvalidStatus: function(test)
  {
    //stub out a request obj with an invalid status but a valid json body (to ensure invalid status triggers error)
    var mock_request = getMockRequest(null, 500, this.valid_respone_body);
    neutron.setRequest(mock_request);

    neutron.getFloatingIp('id', function(error, result){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  }
};



exports.updateFloatingIp = {
  setUp: function(cb){
    this.valid_response_body = {floatingip: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmValidResultOnSuccess: function(test)
  {
    //stub out a request obj with a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.updateFloatingIp('mock_id', 'mock_port_id', function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnInvalidJSONBody: function(test)
  {
    //stub out a request with a valid response status but invalid response json body
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    neutron.setRequest(mock_request);

    neutron.updateFloatingIp('mock_id', 'mock_port_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  },

  confirmErrorOnInvalidStringBody: function(test)
  {
    //stub out a request with a valid response status but a junk text response body
    var mock_request = getMockRequest(null, 200, 'meh');
    neutron.setRequest(mock_request);

    neutron.updateFloatingIp('mock_id', 'mock_port_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  },

  confirmErrorOnInvalidStatus: function(test)
  {
    var mock_request = getMockRequest(null, 500, 'Our server just borked');
    neutron.setRequest(mock_request);

    //stub out a request with an invalid status but a completely valid response body to test that invalid status triggers an error
    neutron.updateFloatingIp('mock_id', 'mock_port_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};


exports.removeFloatingIp = {
  setUp: function(cb){
    cb();
  },

  confirmNoErrorOnSuccess: function(test)
  {
    //stub out a completely valid response
    var mock_request = getMockRequest(null, 200, '');
    neutron.setRequest(mock_request);

    neutron.removeFloatingIp('mock_id', function(error){
      test.ifError(error, 'There should be no error');
      test.done();
    });
  },

  confirmErrorOnInvalidStatus: function(test)
  {
    //stub out a request with a valid response body but invalid status to make sure the status triggers an error
    var mock_request = getMockRequest(null, 500, '');
    neutron.setRequest(mock_request);

    neutron.removeFloatingIp('mock_id', function(error){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};


exports.listPorts = {
  setUp: function(cb){
    this.valid_response_body = {ports: [{id: 1}, {id: 2}]};
    this.valid_result = [{id: 1}, {id: 2}];

    cb();
  },

  confirmPortsOnSuccess: function(test)
  {
    //stub out a request obj with a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.listPorts(function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmEmptyArrayOnInvalidJSONBody: function(test)
  {
    //stub out a request obj with an invalid json response - shouldn't trigger an error but instead give back a blank array
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    neutron.setRequest(mock_request);

    neutron.listPorts(function(error, result){
      test.ifError(error, 'There should be no error');
      test.equal(util.isArray(result), true, 'value should be an array');
      test.equal(result.length, 0, 'value should be an empty array');
      test.done();
    });
  },

  confirmEmptyArrayOnInvalidStringBody: function(test)
  {
    //stub out a request obj with an invalid text response - shouldn't trigger an error but instead give back a blank array
    var mock_request = getMockRequest(null, 200, 'meh');
    neutron.setRequest(mock_request);

    neutron.listPorts(function(error, result){
      test.ifError(error, 'There should be no error');
      test.equal(util.isArray(result), true, 'value should be an array');
      test.equal(result.length, 0, 'value should be an empty array');
      test.done();
    });
  },

  confirmErrorOnInvalidStatus: function(test)
  {
    //stub out a request obj with an invalid status but a valid json body (to ensure invalid status triggers error)
    var mock_request = getMockRequest(null, 500, this.valid_respone_body);
    neutron.setRequest(mock_request);

    neutron.listPorts(function(error, result){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  }
};



exports.updatePort = {
  setUp: function(cb){
    this.valid_response_body = {port: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmPortOnSuccess: function(test)
  {
    //stub out a request obj with a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.updatePort('mock_id', {name: 'mock_name'}, function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnInvalidJSONBody: function(test)
  {
    //stub out a request with a valid response status but invalid response json body
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    neutron.setRequest(mock_request);

    neutron.updatePort('mock_id', {name: 'mock_name'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  },

  confirmErrorOnInvalidStringBody: function(test)
  {
    //stub out a request with a valid response status but a junk text response body
    var mock_request = getMockRequest(null, 200, 'meh');
    neutron.setRequest(mock_request);

    neutron.updatePort('mock_id', {name: 'mock_name'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  },

  confirmErrorOnInvalidStatus: function(test)
  {
    var mock_request = getMockRequest(null, 500, 'Our server just borked');
    neutron.setRequest(mock_request);

    //stub out a request with an invalid status but a completely valid response body to test that invalid status triggers an error
    neutron.updatePort('mock_id', {name: 'mock_name'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.listSecurityGroups = {
  setUp: function(cb){
    this.valid_response_body = {security_groups: [{}, {}]};
    this.valid_result = [{}, {}];

    cb();
  },

  confirmSecurityGroupsOnSuccess: function(test)
  {
    //stub out a request obj with a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.listSecurityGroups('mock_id', function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmEmptyArrayOnInvalidJSONBody: function(test)
  {
    //stub out a request obj with an invalid json response - shouldn't trigger an error but instead give back a blank array
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    neutron.setRequest(mock_request);

    neutron.listSecurityGroups('mock_id', function(error, result){
      test.ifError(error, 'There should be no error');
      test.equal(util.isArray(result), true, 'value should be an array');
      test.equal(result.length, 0, 'value should be an empty array');
      test.done();
    });
  },

  confirmEmptyArrayOnInvalidStringBody: function(test)
  {
    //stub out a request obj with an invalid text response - shouldn't trigger an error but instead give back a blank array
    var mock_request = getMockRequest(null, 200, 'meh');
    neutron.setRequest(mock_request);

    neutron.listSecurityGroups('mock_id', function(error, result){
      test.ifError(error, 'There should be no error');
      test.equal(util.isArray(result), true, 'value should be an array');
      test.equal(result.length, 0, 'value should be an empty array');
      test.done();
    });
  },

  confirmErrorOnInvalidStatus: function(test)
  {
    //stub out a request obj with an invalid status but a valid json body (to ensure invalid status triggers error)
    var mock_request = getMockRequest(null, 500, this.valid_respone_body);
    neutron.setRequest(mock_request);

    neutron.listSecurityGroups('mock_id', function(error, result){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  }
};



exports.getSecurityGroup = {
  setUp: function(cb){
    this.valid_response_body = {security_group: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmSecurityGroupOnSuccess: function(test)
  {
    //stub out a request obj with a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.getSecurityGroup('mock_id', function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnInvalidJSONBody: function(test)
  {
    //stub out a request with a valid response status but invalid response json body
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    neutron.setRequest(mock_request);

    neutron.getSecurityGroup('mock_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  },

  confirmErrorOnInvalidStringBody: function(test)
  {
    //stub out a request with a valid response status but a junk text response body
    var mock_request = getMockRequest(null, 200, 'meh');
    neutron.setRequest(mock_request);

    neutron.getSecurityGroup('mock_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  },

  confirmErrorOnInvalidStatus: function(test)
  {
    //stub out a request with an invalid status but a completely valid response body to test that invalid status triggers an error
    var mock_request = getMockRequest(null, 500, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.getSecurityGroup('mock_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.createSecurityGroup = {
  setUp: function(cb){
    this.valid_response_body = {security_group: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmSecurityGroupOnSuccess: function(test)
  {
    //stub out a request obj with a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.createSecurityGroup('mock_name', {description: 'mock_description'}, function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnInvalidJSONBody: function(test)
  {
    //stub out a request with a valid response status but invalid response json body
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    neutron.setRequest(mock_request);

    neutron.createSecurityGroup('mock_name', {description: 'mock_description'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  },

  confirmErrorOnInvalidStringBody: function(test)
  {
    //stub out a request with a valid response status but a junk text response body
    var mock_request = getMockRequest(null, 200, 'meh');
    neutron.setRequest(mock_request);

    neutron.createSecurityGroup('mock_name', {description: 'mock_description'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  },

  confirmErrorOnInvalidStatus: function(test)
  {
    var mock_request = getMockRequest(null, 500, 'Our server just borked');
    neutron.setRequest(mock_request);

    //stub out a request with an invalid status but a completely valid response body to test that invalid status triggers an error
    neutron.createSecurityGroup('mock_name', {description: 'mock_description'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.updateSecurityGroup = {
  setUp: function(cb){
    this.valid_response_body = {security_group: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmSecurityGroupOnSuccess: function(test)
  {
    //stub out a request obj with a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.updateSecurityGroup('mock_id', {name: 'mock-name'}, function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnInvalidJSONBody: function(test)
  {
    //stub out a request with a valid response status but invalid response json body
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    neutron.setRequest(mock_request);

    neutron.updateSecurityGroup('mock_id', {name: 'mock-name'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  },

  confirmErrorOnInvalidStringBody: function(test)
  {
    //stub out a request with a valid response status but a junk text response body
    var mock_request = getMockRequest(null, 200, 'meh');
    neutron.setRequest(mock_request);

    neutron.updateSecurityGroup('mock_id', {name: 'mock-name'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  },

  confirmErrorOnNon200: function(test)
  {
    //stub out a request with an invalid status but a completely valid response body to test that invalid status triggers an error
    var mock_request = getMockRequest(null, 500, 'Our server just borked');
    neutron.setRequest(mock_request);

    neutron.updateSecurityGroup('mock_id', {name: 'mock-name'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.removeSecurityGroup = {
  setUp: function(cb){
    cb();
  },

  confirmNoErrorOnSuccess: function(test)
  {
    //stub out a completely valid response
    var mock_request = getMockRequest(null, 200, '');
    neutron.setRequest(mock_request);

    neutron.removeSecurityGroup('mock_id', function(error){
      test.ifError(error, 'There should be no error');
      test.done();
    });
  },

  confirmErrorOnInvalidStatus: function(test)
  {
    //stub out a request with a valid response body but invalid status to make sure the status triggers an error
    var mock_request = getMockRequest(null, 500, '');
    neutron.setRequest(mock_request);

    neutron.removeSecurityGroup('mock_id', function(error){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.listSecurityGroupRules = {
  setUp: function(cb){
    this.valid_response_body = {security_group_rules: [{id: 'mock_id'}, {id: 'mock_id2'}]};
    this.valid_result = [{id: 'mock_id'}, {id: 'mock_id2'}];

    cb();
  },

  confirmSecurityGroupRulesOnSuccess: function(test)
  {
    //stub out a completely valid request
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.listSecurityGroupRules(function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmEmptyArrayOnInvalidJSONBody: function(test)
  {
    //stub out a request with a valid status but an invalid json response body
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    neutron.setRequest(mock_request);

    neutron.listSecurityGroupRules(function(error, result){
      test.ifError(error, 'There should be no error');
      test.equal(util.isArray(result), true, 'result should be an array');
      test.equal(result.length, 0, 'result should be an empty array');
      test.done();
    });
  },

  confirmEmptyArrayOnInvalidStringBody: function(test)
  {
    //stub out a request with a valid status but invalid text body
    var mock_request = getMockRequest(null, 200, 'meh');
    neutron.setRequest(mock_request);

    neutron.listSecurityGroupRules(function(error, result){
      test.ifError(error, 'There should be no error');
      test.equal(util.isArray(result), true, 'result should be an array');
      test.deepEqual(result, [], 'result should be a blank array');
      test.done();
    });
  },

  confirmErrorOnNon200: function(test)
  {
    //mock out a request with an invalid status but a valid response body to ensure the status triggers an error
    var mock_request = getMockRequest(null, 500, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.listSecurityGroupRules(function(error, rules_array){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.getSecurityGroupRule = {
  setUp: function(cb){
    this.valid_response_body = {security_group_rule: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmSecurityGroupRuleOnSuccess: function(test)
  {
    //stub out a completely valid request
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.getSecurityGroupRule('mock_id', function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnInvalidJSONBody: function(test)
  {
    //stub out a request with a valid status but an invalid json response body
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    neutron.setRequest(mock_request);

    neutron.getSecurityGroupRule('mock_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  },

  confirmErrorOnInvalidStringBody: function(test)
  {
    //stub out a request with a valid status but invalid text body
    var mock_request = getMockRequest(null, 200, 'meh');
    neutron.setRequest(mock_request);

    neutron.getSecurityGroupRule('mock_id', function(error, result){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  },

  confirmErrorOnNon200: function(test)
  {
    //mock out a request with an invalid status but a valid response body to ensure the status triggers an error
    var mock_request = getMockRequest(null, 500, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.getSecurityGroupRule('mock_id', function(error, result){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  }
};



exports.createSecurityGroupRule = {
  setUp: function(cb){
    this.valid_response_body = {security_group_rule: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmSecurityGroupRuleOnSuccess: function(test)
  {
    //stub out a completely valid request
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.createSecurityGroupRule('mock_id', {name: 'mock_name', description: 'mock_description'}, function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  //stub out a request with a valid status but an invalid json response body
  confirmErrorOnInvalidJSONBody: function(test)
  {
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    neutron.setRequest(mock_request);

    neutron.createSecurityGroupRule('mock_id', {name: 'mock_name', description: 'mock_description'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  },

  confirmErrorOnInvalidStringBody: function(test)
  {
    //stub out a request with a valid status but invalid text body
    var mock_request = getMockRequest(null, 200, 'meh');
    neutron.setRequest(mock_request);

    neutron.createSecurityGroupRule('mock_id', {name: 'mock_name', description: 'mock_description'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  },

  confirmErrorOnNon200: function(test)
  {
    //mock out a request with an invalid status but a valid response body to ensure the status triggers an error
    var mock_request = getMockRequest(null, 500, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.createSecurityGroupRule('mock_id', {name: 'mock_name', description: 'mock_description'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



//various tests for neutron.securityRule.remove()
exports.removeSecurityGroupRule = {
  setUp: function(cb){
    cb();
  },

  confirmNoErrorOnSuccess: function(test)
  {
    //stub out a completely valid request
    var mock_request = getMockRequest(null, 200, '');
    neutron.setRequest(mock_request);

    neutron.removeSecurityGroupRule('mock_id', function(error){
      test.ifError(error, 'There should be no error');
      test.done();
    });
  },

  confirmErrorOnInvalidStatus: function(test)
  {
    //mock out a request with an invalid status but a valid response body to ensure the status triggers an error
    var mock_request = getMockRequest(null, 500, 'Our server just borked');
    neutron.setRequest(mock_request);

    neutron.removeSecurityGroupRule('mock_id', function(error){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};


exports.listLoadBalancers = {
  setUp: function(cb){
    this.valid_response_body = {loadbalancers: [{id: 'mock_id'}, {id: 'mock_id2'}]
    };
    this.valid_result = [{id: 'mock_id'}, {id: 'mock_id2'}];

    cb();
  },

  confirmLoadBalancersOnSuccess: function(test)
  {
    //stub out a completely valid request
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.listLoadBalancers(function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmEmptyArrayOnInvalidJSONBody: function(test)
  {
    //stub out a request with a valid status but an invalid json response body
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    neutron.setRequest(mock_request);

    neutron.listLoadBalancers(function(error, result){
      test.ifError(error, 'There should be no error');
      test.equal(util.isArray(result), true, 'result should be an array');
      test.equal(result.length, 0, 'result should be an empty array');
      test.done();
    });
  },

  confirmEmptyArrayOnInvalidStringBody: function(test)
  {
    //stub out a request with a valid status but invalid text body
    var mock_request = getMockRequest(null, 200, 'meh');
    neutron.setRequest(mock_request);

    neutron.listLoadBalancers(function(error, result){
      test.ifError(error, 'There should be no error');
      test.equal(util.isArray(result), true, 'result should be an array');
      test.deepEqual(result, [], 'result should be a blank array');
      test.done();
    });
  },

  confirmErrorOnNon200: function(test)
  {
    //mock out a request with an invalid status but a valid response body to ensure the status triggers an error
    var mock_request = getMockRequest(null, 500, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.listLoadBalancers(function(error, rules_array){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.getLoadBalancers = {
  setUp: function(cb){
    this.valid_response_body = {loadbalancer: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmLoadBalancerOnSuccess: function(test)
  {
    //stub out a completely valid request
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.getLoadBalancer('mock_id', function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnInvalidJSONBody: function(test)
  {
    //stub out a request with a valid status but an invalid json response body
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    neutron.setRequest(mock_request);

    neutron.getLoadBalancer('mock_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  },

  confirmErrorOnInvalidStringBody: function(test)
  {
    //stub out a request with a valid status but invalid text body
    var mock_request = getMockRequest(null, 200, 'meh');
    neutron.setRequest(mock_request);

    neutron.getLoadBalancer('mock_id', function(error, result){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  },

  confirmErrorOnNon200: function(test)
  {
    //mock out a request with an invalid status but a valid response body to ensure the status triggers an error
    var mock_request = getMockRequest(null, 500, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.getLoadBalancer('mock_id', function(error, result){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  }
};

exports.updateLoadBalancer = {
  setUp: function(cb){
    this.valid_response_body = {loadbalancer: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmValidResultOnSuccess: function(test)
  {
    //stub out a request obj with a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.updateLoadBalancer('mock_id', {description: 'Updated LB'}, function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnInvalidJSONBody: function(test)
  {
    //stub out a request with a valid response status but invalid response json body
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    neutron.setRequest(mock_request);

    neutron.updateLoadBalancer('mock_id', {description: 'Updated LB'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  },

  confirmErrorOnInvalidStringBody: function(test)
  {
    //stub out a request with a valid response status but a junk text response body
    var mock_request = getMockRequest(null, 200, 'meh');
    neutron.setRequest(mock_request);

    neutron.updateLoadBalancer('mock_id', {description: 'Updated LB'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  },

  confirmErrorOnInvalidStatus: function(test)
  {
    var mock_request = getMockRequest(null, 500, 'Our server just borked');
    neutron.setRequest(mock_request);

    //stub out a request with an invalid status but a completely valid response body to test that invalid status triggers an error
    neutron.updateLoadBalancer('mock_id', {description: 'Updated LB'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};

exports.removeLoadBalancer = {
  setUp: function(cb){
    cb();
  },

  confirmNoErrorOnSuccess: function(test)
  {
    //stub out a completely valid response
    var mock_request = getMockRequest(null, 200, '');
    neutron.setRequest(mock_request);

    neutron.removeLoadBalancer('mock_id', function(error){
      test.ifError(error, 'There should be no error');
      test.done();
    });
  },

  confirmErrorOnInvalidStatus: function(test)
  {
    //stub out a request with a valid response body but invalid status to make sure the status triggers an error
    var mock_request = getMockRequest(null, 500, '');
    neutron.setRequest(mock_request);

    neutron.removeLoadBalancer('mock_id', function(error){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};
