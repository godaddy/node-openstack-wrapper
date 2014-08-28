var util = require('util');
var Neutron = require('../lib/neutron.js');
var neutron = new Neutron('mock_url', 'mock_token');



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



//various tests for securityGroup.list()
exports.listSecurityGroups = {
  setUp: function(callback){
   callback();
  },
  
  confirmValueOnSuccess: function(test)
  {
    //theoretically the response should be more complex than this but it shouldn't error as is
    var mock_request = getMockRequest(null, 200, {security_groups: [{meh: 'meh'}]});
    neutron.setRequest(mock_request);
    
    neutron.listSecurityGroups('mock_id', function(error, group_array){
      test.ifError(error, 'There should be no error');
      test.equal(group_array.length, 1, 'there should be at 1 value in the return array');
      test.done();
    });
  },

  confirmEmptyArrayOnInvalidJSONBody: function(test)
  {
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    neutron.setRequest(mock_request);
    
    neutron.listSecurityGroups('mock_id', function(error, group_array){
      test.ifError(error, 'There should be no error');
      test.equal(util.isArray(group_array), true, 'value should be an array');
      test.equal(group_array.length, 0, 'value should be an empty array');
      test.done();
    });
  },
  
  confirmEmptyArrayOnInvalidStringBody: function(test)
  {
    var mock_request = getMockRequest(null, 200, 'meh');
    neutron.setRequest(mock_request);
    
    neutron.listSecurityGroups('mock_id', function(error, group_array){
      test.ifError(error, 'There should be no error');
      test.equal(util.isArray(group_array), true, 'value should be an array');
      test.equal(group_array.length, 0, 'value should be an empty array');
      test.done();
    });
  },
  
  confirmErrorOnNon200: function(test)
  {
    var mock_request = getMockRequest(null, 500, 'Our server just borked');
    neutron.setRequest(mock_request);
    
    neutron.listSecurityGroups('mock_id', function(error, group_array){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  }
};




//various tests for neutron.securityGroup.get()
exports.getSecurityGroup = {
  confirmErrorOnInvalidJSONBody: function(test)
  {
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    neutron.setRequest(mock_request);
    
    neutron.getSecurityGroup('mock-id', function(error, groups_object){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  },
  
  confirmErrorOnInvalidStringBody: function(test)
  {
    var mock_request = getMockRequest(null, 200, 'meh');
    neutron.setRequest(mock_request);
    
    neutron.getSecurityGroup('mock-id', function(error, groups_object){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  },
  
  confirmErrorOnNon200: function(test)
  {
    var mock_request = getMockRequest(null, 500, 'Our server just borked');
    neutron.setRequest(mock_request);
    
    neutron.getSecurityGroup('mock-id', function(error, groups_object){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  }
};




//various tests for neutron.securityGroup.create()
exports.createSecurityGroup = {
  confirmErrorOnInvalidJSONBody: function(test)
  {
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    neutron.setRequest(mock_request);
    
    neutron.createSecurityGroup('mock-name', 'moc-description', function(error, group_object){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  },
  
  confirmErrorOnInvalidStringBody: function(test)
  {
    var mock_request = getMockRequest(null, 200, 'meh');
    neutron.setRequest(mock_request);
    
    neutron.createSecurityGroup('mock-name', 'moc-description', function(error, group_object){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  },
  
  confirmErrorOnNon200: function(test)
  {
    var mock_request = getMockRequest(null, 500, 'Our server just borked');
    neutron.setRequest(mock_request);
    
    neutron.createSecurityGroup('mock-name', 'moc-description', function(error, group_object){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  }
};




//various tests for neutron.securityGroup.update()
exports.updateSecurityGroup = {
  confirmErrorOnInvalidJSONBody: function(test)
  {
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    neutron.setRequest(mock_request);
    
    neutron.updateSecurityGroup('mock-id', {}, function(error, group_object){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  },
  
  confirmErrorOnInvalidStringBody: function(test)
  {
    var mock_request = getMockRequest(null, 200, 'meh');
    neutron.setRequest(mock_request);
    
    neutron.updateSecurityGroup('mock-id', {}, function(error, group_object){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  },
  
  confirmErrorOnNon200: function(test)
  {
    var mock_request = getMockRequest(null, 500, 'Our server just borked');
    neutron.setRequest(mock_request);
    
    neutron.updateSecurityGroup('mock-id', {}, function(error, group_object){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  }
};




//various tests for neutron.securityGroup.remove()
exports.removeSecurityGroup = {
  //no clue what comes back from this so just checking for the 200/500 for now
  confirmNoErrorOnSuccess: function(test)
  {
    //theoretically the response should be more complex than this but it shouldn't error as is
    var mock_request = getMockRequest(null, 200, 'unknown');
    neutron.setRequest(mock_request);
    
    neutron.removeSecurityGroup('moc-id', function(error, group_array){
      test.ifError(error, 'There should be no error');
      test.done();
    });
  },
  
  confirmErrorOnNon200: function(test)
  {
    var mock_request = getMockRequest(null, 500, 'Our server just borked');
    neutron.setRequest(mock_request);
    
    neutron.removeSecurityGroup('mock-id', function(error, group_object){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  }
};



//various tests for securityRule.list()
exports.listSecurityRules = {
  confirmValueOnSuccess: function(test)
  {
    //theoretically the response should be more complex than this but it shouldn't error as is
    var mock_request = getMockRequest(null, 200, {security_group_rules: [{meh: 'meh'}]});
    neutron.setRequest(mock_request);
    
    neutron.listSecurityRules(function(error, rules_array){
      test.ifError(error, 'There should be no error');
      test.equal(rules_array.length, 1, 'there should be at 1 value in the return array');
      test.done();
    });
  },

  confirmEmptyArrayOnInvalidJSONBody: function(test)
  {
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    neutron.setRequest(mock_request);
    
    neutron.listSecurityRules(function(error, rules_array){
      test.ifError(error, 'There should be no error');
      test.equal(util.isArray(rules_array), true, 'value should be an array');
      test.equal(rules_array.length, 0, 'value should be an empty array');
      test.done();
    });
  },
  
  confirmEmptyArrayOnInvalidStringBody: function(test)
  {
    var mock_request = getMockRequest(null, 200, 'meh');
    neutron.setRequest(mock_request);
    
    neutron.listSecurityRules(function(error, rules_array){
      test.ifError(error, 'There should be no error');
      test.deepEqual(rules_array, [], 'value should be a blank array');
      test.done();
    });
  },
  
  confirmErrorOnNon200: function(test)
  {
    var mock_request = getMockRequest(null, 500, 'Our server just borked');
    neutron.setRequest(mock_request);
    
    neutron.listSecurityRules(function(error, rules_array){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  }
};




//various tests for neutron.securityRule.get()
exports.getSecurityRule = {
  confirmErrorOnInvalidJSONBody: function(test)
  {
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    neutron.setRequest(mock_request);
    
    neutron.getSecurityRule('mock-id', function(error, rule_object){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  },
  
  confirmErrorOnInvalidStringBody: function(test)
  {
    var mock_request = getMockRequest(null, 200, 'meh');
    neutron.setRequest(mock_request);
    
    neutron.getSecurityRule('mock-id', function(error, rule_object){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  },
  
  confirmErrorOnNon200: function(test)
  {
    var mock_request = getMockRequest(null, 500, 'Our server just borked');
    neutron.setRequest(mock_request);
    
    neutron.getSecurityRule('mock-id', function(error, rule_object){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  }
};




//various tests for neutron.securityRule.create()
exports.createSecurityRule = {
  confirmErrorOnInvalidJSONBody: function(test)
  {
    var mock_request = getMockRequest(null, 200, {meh:'meh'});
    neutron.setRequest(mock_request);
    
    neutron.createSecurityRule('mock-id', {}, function(error, rule_object){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  },
  
  confirmErrorOnInvalidStringBody: function(test)
  {
    var mock_request = getMockRequest(null, 200, 'meh');
    neutron.setRequest(mock_request);
    
    neutron.createSecurityRule('mock-id', {}, function(error, rule_object){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  },
  
  confirmErrorOnNon200: function(test)
  {
    var mock_request = getMockRequest(null, 500, 'Our server just borked');
    neutron.setRequest(mock_request);
    
    neutron.createSecurityRule('mock-id', {}, function(error, rule_object){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  }
};



//various tests for neutron.securityRule.remove()
exports.removeSecurityRule = {
  //no clue what comes back from this so just checking for the 200/500 for now
  confirmNoErrorOnSuccess: function(test)
  {
    //theoretically the response should be more complex than this but it shouldn't error as is
    var mock_request = getMockRequest(null, 200, 'unknown');
    neutron.setRequest(mock_request);
    
    neutron.removeSecurityRule('mock-id', function(error, rule_object){
      test.ifError(error, 'There should be no error');
      test.done();
    });
  },
  
  confirmErrorOnNon200: function(test)
  {
    var mock_request = getMockRequest(null, 500, 'Our server just borked');
    neutron.setRequest(mock_request);
    
    neutron.removeSecurityRule('mock-id', function(error, rule_object){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  }
};
