var Keystone = require('../lib/keystone.js');
var keystone = new Keystone('http://mock_keystone_url');


//returns a mock request object for dependency injection with the get method calling back with the given 3 values
function getMockRequest(return_error, return_status_code, return_headers, return_response)
{
  function mockVerb(options_array, callback)
  {
    callback(return_error, {statusCode: return_status_code, headers: return_headers}, return_response);
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
    var result = keystone.getRequestOptions('mock_token', '/mock_path', {meh: 'meh'});
    var expected_result = {
      uri: 'http://mock_keystone_url/mock_path',
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



exports.getToken = {
  setUp: function(cb){
    //we'll need these a few times so...
    this.valid_response_headers = {'x-subject-token': 'token_value'};
    this.valid_response_body = {token: {meh: 'meh'}};
    this.valid_result = {meh: 'meh', token: 'token_value'};

    cb();
  },


  confirmTokenOnSuccess: function(test)
  {
    //stub out the request for a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_headers, this.valid_response_body);
    keystone.setRequest(mock_request);

    keystone.getToken('username', 'password', function(error, result){
      test.ifError(error, 'There should be no error')
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out request for an automagic 500 with junk text in the body
    var mock_request = getMockRequest(new Error('meh'), 500, this.valid_response_headers, this.valid_response_body);
    keystone.setRequest(mock_request);

    keystone.getToken('username', 'password', function(error, result){
      test.ok(error, "We should receive an error object or string");
      test.done();
    });
  }
};



exports.getProjectToken = {
  setUp: function(cb){
    //we'll need these a few times so...
    this.valid_response_headers = {'x-subject-token': 'token_value'};
    this.valid_response_body = {token: {meh: 'meh'}};
    this.valid_result = {meh: 'meh', token: 'token_value'};

    cb();
  },


  confirmTokenOnSuccess: function(test)
  {
    //stub out the request for a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, this.valid_response_headers, this.valid_response_body);
    keystone.setRequest(mock_request);

    keystone.getProjectToken('access_token', 'project_id', function(error, result){
      test.ifError(error, 'There should be no error')
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out request for a 500 with a valid header/body (worst case scenario)
    var mock_request = getMockRequest(new Error('meh'), 500, this.valid_response_headers, this.valid_response_body);
    keystone.setRequest(mock_request);

    keystone.getProjectToken("access_token", "project_id", function(error, project_info){
      test.ok(error, "We should receive an error object or string");
      test.done();
    });
  }
};




exports.listProjects = {
  setUp: function(cb){
    //we'll need these a few times so...
    this.valid_response_body = {links: {self: 'selfurl', previous: null, next: null}, projects: []};
    this.valid_result = [];
    this.valid_result.self = 'selfurl';
    this.valid_result.previous = null;
    this.valid_result.next = null;

    cb();
  },


  confirmProjectsOnSuccess: function(test)
  {
    //stub out request with a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, {}, this.valid_response_body);
    keystone.setRequest(mock_request);

    keystone.listProjects('accesstoken', function(error, result){
      test.ifError(error, 'There should be no error')
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out request for a 500 with a valid body (worst case scenario)
    var mock_request = getMockRequest(new Error('meh'), 500, {}, this.valid_response_body);
    keystone.setRequest(mock_request);

    keystone.listProjects('accesstoken', function(error, result){
      test.ok(error, "We should receive an error object");
      test.done();
    });
  }
};



exports.listUserProjects = {
  setUp: function(cb){
    //we'll need these a few times so...
    this.valid_response_body = {links: {self: 'selfurl', previous: null, next: null}, projects: []};
    this.valid_result = [];
    this.valid_result.self = 'selfurl';
    this.valid_result.previous = null;
    this.valid_result.next = null;

    cb();
  },


  confirmProjectsOnSuccess: function(test)
  {
    //stub out request with a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, {}, this.valid_response_body);
    keystone.setRequest(mock_request);

    keystone.listUserProjects('username', 'accesstoken', function(error, result){
      test.ifError(error, 'There should be no error')
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },
  

  confirmErrorOnError: function(test)
  {
    //stub out request for a 500 with a valid body (worst case scenario)
    var mock_request = getMockRequest(new Error('meh'), 500, {}, this.valid_response_body);
    keystone.setRequest(mock_request);

    keystone.listUserProjects('username', 'accesstoken', function(error, result){
      test.ok(error, "We should receive an error object");
      test.done();
    });
  }
};



exports.getProjectByName = {
   setUp: function(cb){
    //we'll need these a few times so...
    this.valid_response_body = {links: {self: 'selfurl', previous: null, next: null}, projects: [{meh: 'meh'}]};
    this.valid_result = {meh: 'meh'};

    cb();
  },
  
  confirmProjectsOnSuccess: function(test)
  {
    //stub out request with a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, {}, this.valid_response_body);
    keystone.setRequest(mock_request);

    keystone.getProjectByName('accesstoken', 'project_name', function(error, result){
      test.ifError(error, 'There should be no error')
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },


  confirmErrorOnError: function(test)
  {
    //stub out request for a 500 with a valid body (worst case scenario)
    var mock_request = getMockRequest(new Error('meh'), 500, {}, this.valid_response_body);
    keystone.setRequest(mock_request);

    keystone.getProjectByName('accesstoken', 'project_name', function(error, result){
      test.ok(error, "We should receive an error object");
      test.done();
    });
  }
};


exports.listRoles = {
  setUp: function(cb){
    //we'll need these a few times so...
    this.valid_response_body = {links: {self: 'selfurl', previous: null, next: null}, roles: []};
    this.valid_result = [];
    this.valid_result.self = 'selfurl';
    this.valid_result.previous = null;
    this.valid_result.next = null;

    cb();
  },


  confirmRolesOnSuccess: function(test)
  {
    //stub out request with a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, {}, this.valid_response_body);
    keystone.setRequest(mock_request);

    keystone.listRoles('access_token', function(error, result){
      test.ifError(error, 'There should be no error')
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },


  confirmErrorOnError: function(test)
  {
    //stub out request with an invalid status but a valid body/header
    var mock_request = getMockRequest(new Error('meh'), 500, {}, this.valid_response_body);
    keystone.setRequest(mock_request);

    keystone.listRoles('accesstoken', function(error, result){
      test.ok(error, "We should receive an error object or string");
      test.done();
    });
  }
};



exports.listRoleAssignments = {
  setUp: function(cb){
    //we'll need these a few times so...
    this.valid_response_body = {links: {self: 'selfurl', previous: null, next: null}, role_assignments: []};
    this.valid_result = [];
    this.valid_result.self = 'selfurl';
    this.valid_result.previous = null;
    this.valid_result.next = null;

    cb();
  },


  confirmAssignmentsArrayOnSuccess: function(test)
  {
    //inject request to give a completely valid response
    var self = this;
    var mock_request = getMockRequest(null, 200, {}, this.valid_response_body);
    keystone.setRequest(mock_request);

    keystone.listRoleAssignments('access_token', 'project_id', function(error, result){
      test.ifError(error, 'There should be no error')
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },


  confirmErrorOnError: function(test)
  {
    //stub out request for an invalid status but with a valid body
    var mock_request = getMockRequest(new Error('meh'), 500, {}, this.valid_response_body);
    keystone.setRequest(mock_request);

    keystone.listRoleAssignments('accesstoken', 'project_id', function(error, result){
      test.ok(error, "We should receive an error object");
      test.done();
    });
  }
};



exports.addRoleAssignment = {
  setUp: function(cb){
    cb();
  },


  confirmObjectOnSuccess: function(test)
  {
    //stub out a rquest with a valid result
    var mock_request = getMockRequest(null, 200, {}, {});
    keystone.setRequest(mock_request);

    keystone.addRoleAssignment('access_token', 'project_id', 'entry_id', 'group', 'role_id', function(error){
      test.ifError(error, 'There should be no error')
      test.done();
    });
  },


  confirmErrorOnError: function(test)
  {
    //stub out request for an invalid status
    var mock_request = getMockRequest(new Error('meh'), 500, {}, 'Our server just borked');
    keystone.setRequest(mock_request);

    keystone.addRoleAssignment('accesstoken', 'project_id', 'entry_id', 'user', 'role_id', function(error){
      test.ok(error, "We should receive an error object or string");
      test.done();
    });
  }
};



exports.removeRoleAssignment = {
  setUp: function(cb){
    cb();
  },


  confirmNoErrorOnSuccess: function(test)
  {
    var mock_request = getMockRequest(null, 200, {}, {});
    keystone.setRequest(mock_request);

    //stub out a rquest with a valid result
    keystone.removeRoleAssignment('access_token', 'project_id', 'entry_id', 'group', 'role_id', function(error){
      test.ifError(error, 'There should be no error')
      test.done();
    });
  },


  confirmErrorOnError: function(test)
  {
    //stub out request for an invalid status
    var mock_request = getMockRequest(new Error('meh'), 500, {}, 'Our server just borked');
    keystone.setRequest(mock_request);

    keystone.removeRoleAssignment('accesstoken', 'project_id', 'entry_id', 'user', 'role_id', function(error){
      test.ok(error, "We should receive an error object or string");
      test.done();
    });
  }
};


exports.listMetaEnvironments = {
  setUp: function(cb){
    this.valid_result = [{id: 'DEV', name: 'Development'}];
    cb();
  },


  confirmObjectsOnSuccess: function(test)
  {
    //stub out a rquest with a valid result
    var self = this;
    var mock_request = getMockRequest(null, 200, {}, {environments: [{id: 'DEV', name: 'Development'}]});
    keystone.setRequest(mock_request);

    keystone.listMetaEnvironments('access_token', function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },


  confirmErrorOnError: function(test)
  {
    //stub out request for an invalid status
    var mock_request = getMockRequest(new Error('meh'), 500, {}, 'Our server just borked');
    keystone.setRequest(mock_request);

    keystone.listMetaEnvironments('accesstoken', function(error, result){
      test.ok(error, "We should receive an error object or string");
      test.done();
    });
  }
};


exports.listMetaOwningGroups = {
  setUp: function(cb){
    this.valid_result = [{id: '1 - Group Name', name: 'Group Name'}];
    cb();
  },


  confirmObjetsOnSuccess: function(test)
  {
    //stub out a rquest with a valid result
    var self = this;
    var mock_request = getMockRequest(null, 200, {}, {owning_groups: [{id: '1 - Group Name', name: 'Group Name'}]});
    keystone.setRequest(mock_request);

    keystone.listMetaOwningGroups('access_token', function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, JSON.stringify(result) + '!=' + JSON.stringify(self.valid_result));
      test.done();
    });
  },


  confirmErrorOnError: function(test)
  {
    //stub out request for an invalid status
    var mock_request = getMockRequest(new Error('meh'), 500, {}, 'Our server just borked');
    keystone.setRequest(mock_request);

    keystone.listMetaOwningGroups('accesstoken', function(error, result){
      test.ok(error, "We should receive an error object or string");
      test.done();
    });
  }
};


exports.listProjectMeta = {
  setUp: function(cb){
    this.valid_result = {name: 'value'};
    cb();
  },


  confirmObjectsOnSuccess: function(test)
  {
    //stub out a rquest with a valid result
    var self = this;
    var mock_request = getMockRequest(null, 200, {}, {meta: {name: 'value'}});
    keystone.setRequest(mock_request);

    keystone.listProjectMeta('access_token', 'project_id', function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },


  confirmErrorOnError: function(test)
  {
    //stub out request for an invalid status
    var mock_request = getMockRequest(new Error('meh'), 500, {}, 'Our server just borked');
    keystone.setRequest(mock_request);

    keystone.listProjectMeta('accesstoken', 'project_id', function(error, result){
      test.ok(error, "We should receive an error object or string");
      test.done();
    });
  }
};


exports.updateProjectMeta = {
  setUp: function(cb){
    this.valid_result = {name: 'value'};
    cb();
  },


  confirmObjectOnSuccess: function(test)
  {
    //stub out a rquest with a valid result
    var self = this;
    var mock_request = getMockRequest(null, 200, {}, {meta: {name: 'value'}});
    keystone.setRequest(mock_request);

    keystone.updateProjectMeta('access_token', 'project_id', {environment: 'ENV', owning_group: 'GROUPID'}, function(error, result){
      test.ifError(error, 'There should be no error');
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },


  confirmErrorOnError: function(test)
  {
    //stub out request for an invalid status
    var mock_request = getMockRequest(new Error('meh'), 500, {}, 'Our server just borked');
    keystone.setRequest(mock_request);

    keystone.updateProjectMeta('accesstoken', 'project_id', {environment: 'ENV', owning_grouop: 'GROUPID'}, function(error, result){
      test.ok(error, "We should receive an error object or string");
      test.done();
    });
  }
};