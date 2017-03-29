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
      timeout: 9000,
      metricRequestID: '',
      metricUserName: '',
      metricLogger: null
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


  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
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

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
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

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

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

  confirmPortsOnSuccessWithOptions: function(test)
  {
    //stub out a request obj with a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.listFloatingIps({}, function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },


  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
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

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
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

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

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

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
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

  confirmPortsOnSuccessWithOptions: function(test)
  {
    //stub out a request obj with a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.listPorts({}, function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

 
  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
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

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

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

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
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

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
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

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

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

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
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

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
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
  
  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
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

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.getSecurityGroupRule('mock_id', function(error, result){
      test.ok(error, 'We should receive an error object');
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
  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
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

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
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

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
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

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.getLoadBalancer('mock_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};


exports.createLoadBalancer = {
  setUp: function(cb){
    this.valid_response_body = {loadbalancer: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmValidResultOnSuccess: function(test)
  {
    //stub out a completely valid request
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.createLoadBalancer('tenant_id', 'vip_subnet_id', {name: 'mock_name'}, function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  //stub out a request with a valid status but an invalid json response body
  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.createLoadBalancer('tenant_id', 'vip_subnet_id', {name: 'mock_name'}, function(error, result){
      test.ok(error, 'We should receive an error object');
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

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

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

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.removeLoadBalancer('mock_id', function(error){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};


exports.getLBStats = {
  setUp: function(cb){
    this.valid_response_body = {stats: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmValidResultOnSuccess: function(test)
  {
    //stub out a completely valid request
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.getLBStats('lb_id', function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.getLBStats('lb_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};


exports.listLBListeners = {
  setUp: function(cb){
    this.valid_response_body = {listeners: [{id: 'mock_id'}, {id: 'mock_id2'}]};
    this.valid_result = [{id: 'mock_id'}, {id: 'mock_id2'}];

    cb();
  },

  confirmLBListenersOnSuccess: function(test)
  {
    //stub out a completely valid request
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.listLBListeners(function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },
  
  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.listLBListeners(function(error, rules_array){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};


exports.getLBListener = {
  setUp: function(cb){
    this.valid_response_body = {listener: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmLBListenerOnSuccess: function(test)
  {
    //stub out a completely valid request
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.getLBListener('mock_id', function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.getLBListener('mock_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};


exports.createLBListener = {
  setUp: function(cb){
    this.valid_response_body = {listener: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmValidResultOnSuccess: function(test)
  {
    //stub out a completely valid request
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.createLBListener('tenant_id', 'loadbalancer_id', 'description', 'protocol', {protocol_port: 'mock_protocol_port'}, function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  //stub out a request with a valid status but an invalid json response body
  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);
    
    neutron.createLBListener('tenant_id', 'loadbalancer_id', 'description', 'protocol', {protocol_port: 'mock_protocol_port'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.updateLBListener = {
  setUp: function(cb){
    this.valid_response_body = {listener: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmValidResultOnSuccess: function(test)
  {
    //stub out a request obj with a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.updateLBListener('mock_id', {description: 'Updated Listener'}, function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.updateLBListener('mock_id', {description: 'Updated Listener'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.removeLBListener = {
  setUp: function(cb){
    cb();
  },

  confirmNoErrorOnSuccess: function(test)
  {
    //stub out a completely valid response
    var mock_request = getMockRequest(null, 200, '');
    neutron.setRequest(mock_request);

    neutron.removeLBListener('mock_id', function(error){
      test.ifError(error, 'There should be no error');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.removeLBListener('mock_id', function(error){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.listLBPools = {
  setUp: function(cb){
    this.valid_response_body = {pools: [{id: 'mock_id'}, {id: 'mock_id2'}]};
    this.valid_result = [{id: 'mock_id'}, {id: 'mock_id2'}];

    cb();
  },

  confirmLBPoolsOnSuccess: function(test)
  {
    //stub out a completely valid request
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.listLBPools(function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.listLBPools(function(error, rules_array){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.getLBPool = {
  setUp: function(cb){
    this.valid_response_body = {pool: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};
    
    cb();
  },

  confirmPoolOnSuccess: function(test)
  {
    //stub out a completely valid request
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.getLBPool('mock_id', function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.getLBPool('mock_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.createLBPool = {
  setUp: function(cb){
    this.valid_response_body = {pool: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmValidResultOnSuccess: function(test)
  {
    //stub out a completely valid request
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.createLBPool('tenant_id', 'protocol', 'lb_algorithm', 'listener_id', {'admin_state_up': 'mock_admin_state_up'}, function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);
  
    neutron.createLBPool('tenant_id', 'protocol', 'lb_algorithm', 'listener_id', {'admin_state_up': 'mock_admin_state_up'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.updateLBPool = {
  setUp: function(cb){
    this.valid_response_body = {pool: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmValidResultOnSuccess: function(test)
  {
    //stub out a request obj with a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.updateLBPool('mock_id', {description: 'Updated LBPool'}, function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.updateLBPool('mock_id', {description: 'Updated LBPool'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.removeLBPool = {
  setUp: function(cb){
    cb();
  },

  confirmNoErrorOnSuccess: function(test)
  {
    //stub out a completely valid response
    var mock_request = getMockRequest(null, 200, '');
    neutron.setRequest(mock_request);

    neutron.removeLBPool('mock_id', function(error){
      test.ifError(error, 'There should be no error');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.removeLBPool('mock_id', function(error){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.listLBPoolMembers = {
  setUp: function(cb){
    this.valid_response_body = {members: [{id: 'mock_id'}, {id: 'mock_id2'}]};
    this.valid_result = [{id: 'mock_id'}, {id: 'mock_id2'}];

    cb();
  },

  confirmMembersOnSuccess: function(test)
  {
    //stub out a completely valid request
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.listLBPoolMembers('pool_id', function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.listLBPoolMembers('pool_id', function(error, rules_array){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.getLBPoolMember = {
  setUp: function(cb){
    this.valid_response_body = {member: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmMemberOnSuccess: function(test)
  {
    //stub out a completely valid request
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.getLBPoolMember('pool_id', 'member_id', function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.getLBPoolMember('pool_id', 'member_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};


exports.createLBPoolMember= {
  setUp: function(cb){
    this.valid_response_body = {member: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmValidResultOnSuccess: function(test)
  {
    //stub out a completely valid request
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.createLBPoolMember('pool_id', 'tenant_id', 'address', 'protocol_port', {'admin_state_up': 'mock_admin_state_up'}, function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.createLBPoolMember('pool_id', 'tenant_id', 'address', 'protocol_port', {'admin_state_up': 'mock_admin_state_up'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.updateLBPoolMember = {
  setUp: function(cb){
    this.valid_response_body = {member: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmValidResultOnSuccess: function(test)
  {
    //stub out a request obj with a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.updateLBPoolMember('pool_id', 'member_id', {description: 'Updated LBPool'}, function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.updateLBPoolMember('pool_id', 'member_id', {description: 'Updated LBPool'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.removeLBPoolMember = {
  setUp: function(cb){
    cb();
  },

  confirmNoErrorOnSuccess: function(test)
  {
    //stub out a completely valid response
    var mock_request = getMockRequest(null, 200, '');
    neutron.setRequest(mock_request);

    neutron.removeLBPoolMember('pool_id', 'member_id', function(error){
      test.ifError(error, 'There should be no error');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.removeLBPoolMember('pool_id', 'member_id', function(error){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.listLBHealthMonitors = {
  setUp: function(cb){
    this.valid_response_body = {healthmonitors: [{id: 'mock_id'}, {id: 'mock_id2'}]
    };
    this.valid_result = [{id: 'mock_id'}, {id: 'mock_id2'}];

    cb();
  },

  confirmMembersOnSuccess: function(test)
  {
    //stub out a completely valid request
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.listLBHealthMonitors(function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.listLBHealthMonitors(function(error, rules_array){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.getLBHealthMonitor = {
  setUp: function(cb){
    this.valid_response_body = {healthmonitor: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmValidResultOnSuccess: function(test)
  {
    //stub out a completely valid request
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.getLBHealthMonitor('health_monitor_id', function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.getLBHealthMonitor('health_monitor_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.createLBHealthMonitor= {
  setUp: function(cb){
    this.valid_response_body = {healthmonitor: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmValidResultOnSuccess: function(test)
  {
    //stub out a completely valid request
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.createLBHealthMonitor('tenant_id', 'type', 'delay', 'timeout', 'max_retries', 'pool_id', {'http_method': 'mock_http_method'}, function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.createLBHealthMonitor('tenant_id', 'type', 'delay', 'timeout', 'max_retries', 'pool_id', {'http_method': 'mock_http_method'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.updateLBHealthMonitor = {
  setUp: function(cb){
    this.valid_response_body = {healthmonitor: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmValidResultOnSuccess: function(test)
  {
    //stub out a request obj with a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.updateLBHealthMonitor('health_monitor_id', {delay: 'mock_delay'}, function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.updateLBHealthMonitor('health_monitor_id', {delay: 'mock_delay'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.removeLBHealthMonitor = {
  setUp: function(cb){
    cb();
  },

  confirmNoErrorOnSuccess: function(test)
  {
    //stub out a completely valid response
    var mock_request = getMockRequest(null, 200, '');
    neutron.setRequest(mock_request);

    neutron.removeLBHealthMonitor('health_monitor_id', function(error){
      test.ifError(error, 'There should be no error');
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    var mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.removeLBHealthMonitor('health_monitor_id', function(error){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};