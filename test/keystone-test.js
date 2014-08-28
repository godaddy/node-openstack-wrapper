var Keystone = require('../lib/keystone.js');
var keystone = new Keystone('meh');


//returns a mock request object for dependency injection with the get method calling back with the given 3 values
function getMockRequest(return_error, return_status_code, return_headers, return_response)
{
  function mockVerb(options_array, callback)
  {
    callback(return_error, {statusCode: return_status_code, headers: return_headers}, return_response);
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



exports.getAuthToken = {
  setUp: function(callback){
    callback();
  },
  
  
  confirmTokenOnSuccess: function(test)
  {
    //stub out the request for an automatic valid response
    var mock_request = getMockRequest(null, 200, {'x-subject-token': 'tokenstringvalue'}, {access: {token: {id:'validtoken'}}});
    keystone.setRequest(mock_request);
    
    keystone.getAuthToken('anyusername', 'anypassword', function(error, access_token){
      test.ifError(error, 'There should be no error');
      test.equal(access_token, 'tokenstringvalue', 'value should be "validtoken"');
      test.done();
    });
  },
  
  
  confirmErrorOnInvalidHeader: function(test)
  {
    //stub out the request for an 200 response with junk json in the body
    var mock_request = getMockRequest(null, 200, {meh: 'meh'}, {});
    keystone.setRequest(mock_request);
    
    keystone.getAuthToken('anyusername', 'anypassword', function(error, access_token){
      test.ok(error, 'We should receive an error object or string');
      test.done();
    });
  },
  
  
  confirmErrorOnNon200: function(test)
  {
    //stub out request for an automagic 500 with junk text in the body
    var mock_request = getMockRequest(null, 500, {}, 'Our server just borked');
    keystone.setRequest(mock_request);
    
    keystone.getAuthToken("anyusername", "anypassword", function(error, access_token){
      test.ok(error, "We should receive an error object or string");
      test.done();
    });
  }
};



exports.getProjects = {
  setUp: function(callback){
    callback();
  },
  
  
  confirmProjectsArrayOnSuccess: function(test)
  {
    var response_body = {
      links: {self: 'http://blah', previous: null, next: null},
      projects:[]
    }
    response_body.projects[0] = {
      description: null,
      links: [{}],
      enabled: true,
      id: 'project_id1',
      domain_id: 'default',
      name: 'project_name1'
    };
    response_body.projects[1] = {
      description: null,
      links: [{}],
      enabled: true,
      id: 'project_id2',
      domain_id: 'default',
      name: 'project_name2'
    };
    
    //inject a mock request with a valid response to inject
    var mock_request = getMockRequest(null, 200, {}, response_body);
    keystone.setRequest(mock_request);
    
    //validate response and response format
    keystone.getProjects('username', 'accesstoken', function(error, project_array){
      test.ifError(error, 'There should be no error')
      test.equal(project_array[0].id, 'project_id1');
      test.equal(project_array[1].name, 'project_name2');
      test.done();
    });
  },
  
  
  confirmErrorOnInvalidJSONBody: function(test)
  {
    //stub out the request for an 200 response with junk json in the body
    var mock_request = getMockRequest(null, 200, {}, {meh:'meh'});
    keystone.setRequest(mock_request);
    
    keystone.getProjects('username', 'accesstoken', function(error, project_array){
      test.ok(error, "We should receive an error object or string");
      test.done();
    });
  },
  
  
  confirmErrorOnInvalidStringBody: function(test)
  {
    //stub out the request for an 200 response with junk text in the body
    var mock_request = getMockRequest(null, 200, {}, 'meh');
    keystone.setRequest(mock_request);
    
    keystone.getProjects('username', 'accesstoken', function(error, project_array){
      test.ok(error, "We should receive an error object or string");
      test.done();
    });
  },
  
  
  confirmErrorOnNon200: function(test)
  {
    //stub out request for an automagic 500 with junk text in the body
    var mock_request = getMockRequest(null, 500, {}, 'Our server just borked');
    keystone.setRequest(mock_request);
    
    keystone.getProjects('username', 'accesstoken', function(error, project_array){
      test.ok(error, "We should receive an error object or string");
      test.done();
    });
  }
};


exports.getProjectInfo = {
  setUp: function(callback){
    callback();
  },
  
  
  confirmDataOnSuccess: function(test)
  {
    var valid_body = {
      token:{
        catalog: [],
        token: {},
        roles: [{id: 'roleid', name: 'admin'}]
      }
    };
    //just stubbing out 1 endpoint for now
    valid_body.token.catalog[0] = {
      type: 'compute',
      endpoints: [{'interface': 'public', url: 'public_url'}, {'interface': 'private', url: 'private_url'}]
    };
    
    //stub out the request for an automatic valid response
    var mock_request = getMockRequest(null, 200, {'x-subject-token': 'tokenstringvalue'}, valid_body);
    keystone.setRequest(mock_request);
    
    //just testing to see if the function
    //(given a valid repsonse from the remote box)
    //sends back the structure and a value we expect
    keystone.getProjectInfo("access_token", "project_id", function(error, project_info){
      test.ifError(error, 'There should be no error');
      test.equal(project_info.endpoints.nova.publicUrl, 'public_url');
      test.equal(project_info.token, 'tokenstringvalue', 'The token value should be tokenstringvalue');
      test.ok(project_info.is_admin, 'The is_admin value should be boolean true');
      test.done();
    });
  },
  
  
  confirmErrorOnInvalidHeader: function(test)
  {
    //stub out the request for an 200 response with junk json in the body
    var mock_request = getMockRequest(null, 200, {}, {meh:'meh'});
    keystone.setRequest(mock_request);
    
    keystone.getProjectInfo("access_token", "project_id", function(error, project_info){
      test.ok(error, "We should receive an error object or string");
      test.done();
    });
  },
  
  confirmErrorOnInvalidJSONBody: function(test)
  {
    //stub out the request for an 200 response with junk json in the body
    var mock_request = getMockRequest(null, 200, {'x-subject-token': 'tokenstringvalue'}, {meh:'meh'});
    keystone.setRequest(mock_request);
    
    keystone.getProjectInfo("access_token", "project_id", function(error, project_info){
      test.ok(error, "We should receive an error object or string");
      test.done();
    });
  },
  
  
  confirmErrorOnInvalidStringBody: function(test)
  {
    //stub out the request for an 200 response with junk text in the body
    var mock_request = getMockRequest(null, 200, {}, 'meh');
    keystone.setRequest(mock_request);
    
    keystone.getProjectInfo("access_token", "project_id", function(error, project_info){
      test.ok(error, "We should receive an error object or string");
      test.done();
    });
  },
  
  
  confirmErrorOnNon200: function(test)
  {
    //stub out request for an automagic 500 with junk text in the body
    var mock_request = getMockRequest(null, 500, {}, 'Our server just borked');
    keystone.setRequest(mock_request);
    
    keystone.getProjectInfo("access_token", "project_id", function(error, project_info){
      test.ok(error, "We should receive an error object or string");
      test.done();
    });
  }
};




exports.getRoles = {
  setUp: function(callback){
    callback();
  },
  
  
  confirmRolesArrayOnSuccess: function(test)
  {
    //mock out a successful response
    var response_body = {
      links: {
        self: 'http://selfurl',
        previous: null,
        next: null
      },
      roles: [
        {id: 'role_id_1', links: [], name: 'role_name_1'},
        {id: 'role_id_2', links: [], name: 'role_name_2'}
      ]
    };
    
    //inject a mock request with a valid response to inject
    var mock_request = getMockRequest(null, 200, {}, response_body);
    keystone.setRequest(mock_request);
    
    //validate response and response format
    keystone.getRoles('access_token', function(error, roles_array){
      test.ifError(error, 'There should be no error')
      test.equal(roles_array[0].id, 'role_id_1');
      test.equal(roles_array[1].name, 'role_name_2');
      test.done();
    });
  },
  
  
  confirmErrorOnInvalidJSONBody: function(test)
  {
    //stub out the request for an 200 response with junk json in the body
    var mock_request = getMockRequest(null, 200, {}, {meh:'meh'});
    keystone.setRequest(mock_request);
    
    keystone.getRoles('accesstoken', function(error, roles_array){
      test.ok(error, "We should receive an error object or string");
      test.done();
    });
  },
  
  
  confirmErrorOnInvalidStringBody: function(test)
  {
    //stub out the request for an 200 response with junk text in the body
    var mock_request = getMockRequest(null, 200, {}, 'meh');
    keystone.setRequest(mock_request);
    
    keystone.getRoles('accesstoken', function(error, roles_array){
      test.ok(error, "We should receive an error object or string");
      test.done();
    });
  },
  
  
  confirmErrorOnNon200: function(test)
  {
    //stub out request for an automagic 500 with junk text in the body
    var mock_request = getMockRequest(null, 500, {}, 'Our server just borked');
    keystone.setRequest(mock_request);
    
    keystone.getRoles('accesstoken', function(error, roles_array){
      test.ok(error, "We should receive an error object or string");
      test.done();
    });
  }
};




exports.getProjectAssignments = {
  setUp: function(callback){
    callback();
  },
  
  
  confirmAssignmentsArrayOnSuccess: function(test)
  {
    //mock out a successful response
    var response_body = {
      links: {
        self: 'http://selfurl',
        previous: null,
        next: null
      },
      role_assignments: [
        {scope: {}, role: {id: 'role_id_1'}, user: {id: 'user_id'}, links: {assignment: 'http://assignment_url1'}},
        {scope: {}, role: {id: 'role_id_2'}, group: {id: 'group_id'}, links: {assignment: 'http://assignment_url2'}}
      ]
    };
    
    //inject a mock request with a valid response to inject
    var mock_request = getMockRequest(null, 200, {}, response_body);
    keystone.setRequest(mock_request);
    
    //validate response and response format
    keystone.getProjectAssignments('access_token', 'project_id', function(error, assignment_array){
      test.ifError(error, 'There should be no error')
      test.equal(assignment_array[0].role.id, 'role_id_1');
      test.equal(assignment_array[1].group.id, 'group_id');
      test.done();
    });
  },
  
  
  confirmErrorOnInvalidJSONBody: function(test)
  {
    //stub out the request for an 200 response with junk json in the body
    var mock_request = getMockRequest(null, 200, {}, {meh:'meh'});
    keystone.setRequest(mock_request);
    
    keystone.getProjectAssignments('accesstoken', 'project_id', function(error, assignment_array){
      test.ok(error, "We should receive an error object or string");
      test.done();
    });
  },
  
  
  confirmErrorOnInvalidStringBody: function(test)
  {
    //stub out the request for an 200 response with junk text in the body
    var mock_request = getMockRequest(null, 200, {}, 'meh');
    keystone.setRequest(mock_request);
    
    keystone.getProjectAssignments('accesstoken', 'project_id', function(error, assignment_array){
      test.ok(error, "We should receive an error object or string");
      test.done();
    });
  },
  
  
  confirmErrorOnNon200: function(test)
  {
    //stub out request for an automagic 500 with junk text in the body
    var mock_request = getMockRequest(null, 500, {}, 'Our server just borked');
    keystone.setRequest(mock_request);
    
    keystone.getProjectAssignments('accesstoken', 'project_id', function(error, assignment_array){
      test.ok(error, "We should receive an error object or string");
      test.done();
    });
  }
};



exports.addProjectAssignment = {
  setUp: function(callback){
    callback();
  },
  
  
  confirmNoErrorOnSuccess: function(test)
  {
    var mock_request = getMockRequest(null, 200, {}, {});
    keystone.setRequest(mock_request);
    
    //validate non-error status
    keystone.addProjectAssignment('access_token', 'project_id', 'entry_id', 'group', 'role_id', function(error){
      test.ifError(error, 'There should be no error')
      test.done();
    });
  },
  
  
  confirmErrorOnNon200: function(test)
  {
    //stub out request for an automagic 500 with junk text in the body
    var mock_request = getMockRequest(null, 500, {}, 'Our server just borked');
    keystone.setRequest(mock_request);
    
    keystone.addProjectAssignment('accesstoken', 'project_id', 'entry_id', 'user', 'role_id', function(error){
      test.ok(error, "We should receive an error object or string");
      test.done();
    });
  }
};




exports.removeProjectAssignment = {
  setUp: function(callback){
    callback();
  },
  
  
  confirmNoErrorOnSuccess: function(test)
  {
    var mock_request = getMockRequest(null, 200, {}, {});
    keystone.setRequest(mock_request);
    
    //validate non-error status
    keystone.removeProjectAssignment('access_token', 'project_id', 'entry_id', 'group', 'role_id', function(error){
      test.ifError(error, 'There should be no error')
      test.done();
    });
  },
  
  
  confirmErrorOnNon200: function(test)
  {
    //stub out request for an automagic 500 with junk text in the body
    var mock_request = getMockRequest(null, 500, {}, 'Our server just borked');
    keystone.setRequest(mock_request);
    
    keystone.removeProjectAssignment('accesstoken', 'project_id', 'entry_id', 'user', 'role_id', function(error){
      test.ok(error, "We should receive an error object or string");
      test.done();
    });
  }
};
