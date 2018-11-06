var Request = require('./os-request');


//constructor - should be the only export
function Keystone(endpoint_url)
{
  //set this way purely to facilitate unit test dependency injetion
  this.request = Request;
  
  //this is an optional lib that we override to normalfy the openstack responses - leave as is for no munging
  this.mangler = require('./mangler');
  this.mangleObject = this.mangler.mangleObject;

  //Keystone v3 is the only supported version at this point - add the url and yank all trailing slashes
  this.url = endpoint_url.replace(/\/$/, "");

  //default the timeout to false - this forces the static value to be used
  this.timeout = 9000;
  
  //default request id to blank - should represent the incomming request id
  this.request_id = '';
  
  //default to a blank user_name
  this.user_name = '';
  
  //logger should default to null - might consider checking for a logMetric function in that obj too?
  this.logger = null;
}


//setters for individual obj/call usage
//just set these prior to doing things and your good to go until you want to change it
Keystone.prototype.setTimeout = function(new_timeout)
{
  this.timeout = new_timeout;
};

Keystone.prototype.setRequestID = function(request_id)
{
  this.request_id = request_id;
};

Keystone.prototype.setUserName = function(user_name)
{
  this.user_name = user_name;
};

Keystone.prototype.setLogger = function(logger)
{
  this.logger = logger;
};

//this should only be used for dependency injection
Keystone.prototype.setRequest = function(request_lib)
{
  this.request = request_lib;
}

//lets us mangle/sanitize/make sane the various responses from openstack
//any replacement must simply support a static mangleObject that supports the following types [ie mangleObject(type, object)]
//Project, Role, Assignment
Keystone.prototype.setMangler = function(mangle_lib)
{
  this.mangler = mangle_lib;
  this.mangleObject = this.mangler.mangleObject;
}



//returns an formatted options object - just makes the code below a little less repetitious
//auth_token can be either a generic or project scoped token depending what your doing
//json_value should be almost certainly be true if you don't have an actual object you want to send over
//NOTE: because keystone is non-project specific this function is different than all the other classes with it
Keystone.prototype.getRequestOptions = function(auth_token, path, json_value)
{
  //start w/the instance timeout
  var request_timeout = this.timeout;
  if(!request_timeout)
  {
    //override with the static value if no instance value was given
    request_timeout = Keystone.timeout;
  }
  var return_object = {
    uri: this.url + path,
    headers:{'X-Auth-Token': auth_token},
    json: json_value,
    timeout: this.timeout,
    metricRequestID: this.request_id,
    metricUserName: this.user_name,
    metricLogger: this.logger
  };

  return return_object;
};



//authorizes the users against the specified keystone
//can be called with 3 or 4 params (domain is optional, cb is not)
//calls back with (error, token) where token is an object containing all the token info
//NOTE: the actual token value normally comes back in the header - i'm modifying this to token.token for easier consumption
Keystone.prototype.getToken = function(username, password, domain, cb)
{ 
  //handle domain not being passed in for backwards compat
  if(arguments.length === 3)
  {
    cb = domain;
    domain = 'Default'
  }
  
  var self = this;
  var auth_data = {
    auth:{
      identity:{
        methods: ['password'],
        'password': {user: {domain: {name: domain}, name: username, 'password': password}}
      }
    }
  }
  var request_options = this.getRequestOptions('bogus', '/auth/tokens', auth_data);
  request_options.headers = {}; //we don't want the normal auth header due to bogus token
  request_options.metricPath = 'remote-calls.keystone.tokens.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'token';
  
  //auth-token will come back in the header for some reason as x-subject-token (used to come back in the body all nice like)
  this.request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error)
      return;
    }
    //else
    
    //tiny hack here to put the actual token string back into the object
    body.token.token = response.headers['x-subject-token'];
    
    //now we good
    cb(null, self.mangleObject('Token', body.token));
  });
};



//make a callback(error, project_authorization) with all of the data on a project and an access token for further calls on it
//NOTE: this is not the admin function that gets project details - you have to do this so I'm not bothering with that
Keystone.prototype.getProjectTokenForReal = function(auth_data, cb)
{
  var self = this;

  //use the normal getRequestOptions but send in a bogus token and nullfiy the header
  //the token will get passed in the data in this call
  var request_options = this.getRequestOptions('bogus', '/auth/tokens', auth_data);
  request_options.headers = {};
  request_options.metricPath = 'remote-calls.keystone.tokens.get-project';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'token';

  this.request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else

    //hack to put the actual token value back into the body
    body.token.token = response.headers['x-subject-token'];
    
    cb(null, self.mangleObject('ProjectToken', body.token));
  });
};



//make a callback(error, project_authorization) with all of the data on a project and an access token for further calls on it
//NOTE: this is not the admin function that gets project details - you have to do this so I'm not bothering with that
Keystone.prototype.getProjectToken = function(access_token, project_id, cb)
{
  var auth_data = {
    auth:{
      identity:{
        methods: ['token'],
        token: {id: access_token}
      },
      scope: {
        project: {id: project_id}
      }
    }
  };

  this.getProjectTokenForReal(auth_data, cb);
};



//passthru function for future stuff
Keystone.prototype.getProjectTokenById = Keystone.prototype.getProjectToken;



//make a callback(error, project_authorization) with all of the data on a project and an access token for further calls on it
//NOTE: this is not the admin function that gets project details - you have to do this so I'm not bothering with that
Keystone.prototype.getProjectTokenByName = function(access_token, domain_id, project_name, cb)
{
  var auth_data = {
    auth:{
      identity:{
        methods: ['token'],
        token: {id: access_token}
      },
      scope: {
        project: {
          domain: {id: domain_id},
          name: project_name
        }
      }
    }
  };

  this.getProjectTokenForReal(auth_data, cb);
};



//gets a list of all projects in the system
//calls back with cb(error, project_array)
//***NOTE: admin_access_token is a scoped token from a project you have admin rights on - yes this is weird
Keystone.prototype.listProjects = function(admin_access_token, cb)
{
  var self = this;
  var request_options = this.getRequestOptions(admin_access_token, '/projects', true);
  request_options.metricPath = 'remote-calls.keystone.projects.list';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'projects';
  
  this.request.get(request_options, function(error, response, body){
    var projects_array =[];
    if(error)
    {
      cb(error);
      return;
    }

    for(var n = 0; n < body.projects.length; n++)
    {
      projects_array[n] = self.mangleObject('Project', body.projects[n]);
    }

    //tack these on for easy consupmtion and in case we ever need pagination
    projects_array.self = body.links.self;
    projects_array.previous = body.links.previous;
    projects_array.next = body.links.next;

    cb(null, projects_array);
  });
};




//gets a list of projects the given token is authorized to have some access to
//calls back with (error, projects_array) and self, previous, and null are tacked on as properties of the array
Keystone.prototype.listUserProjects = function(username, access_token, cb)
{
  var self = this;
  var request_options = this.getRequestOptions(access_token, '/users/' + username + '/projects', true);
  request_options.metricPath = 'remote-calls.keystone.projects.list-user';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'projects';
  
  this.request.get(request_options, function(error, response, body){
    var projects_array =[];
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    for(var n = 0; n < body.projects.length; n++)
    {
      projects_array[n] = self.mangleObject('Project', body.projects[n]);
    }
    
    //tack these on for easy consupmtion and in case we ever need pagination
    projects_array.self = body.links.self;
    projects_array.previous = body.links.previous;
    projects_array.next = body.links.next;

    cb(null, projects_array);
  });
};



//gets the details of a specific project by name
//calls back with cb(error, project_array)
//***NOTE: admin_access_token is a scoped token from a project you have admin rights on - yes this is weird
//***NOTE: this will return an error if 2 projects are named the same - not usable unless distinct projects are configured/required.
Keystone.prototype.getProjectByName = function(admin_access_token, project_name, cb)
{
  var self = this;
  var request_options = this.getRequestOptions(admin_access_token, '/projects?name=' + project_name, true);
  request_options.metricPath = 'remote-calls.keystone.projects.get-by-name';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'projects';
  
  this.request.get(request_options, function(error, response, body){
    var project_object = {};
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    if(body.projects.length > 1)
    {
      //kind of an error... in theory
      cb(new Error('Found multiple projects with same name'));
      return;
    }
    //else
    
    if(body.projects.length == 0)
    {
      //not an error but no data either
      cb(null, project_object);
      return;
    }
    //else
    
    //we are good
    project_object = self.mangleObject('Project', body.projects[0]);
    cb(null, project_object);
  });
};



//gets a list of roles for the given project (specified by token ...kinda weird)
//calls back with (error, roles_array) and self, previous, and null are tacked on as properties of the array
//NOTE: this needs a project token scoped in our system - this may vary depending on how the security is setup
Keystone.prototype.listRoles = function(project_token, cb)
{
  var self = this;
  var request_options = this.getRequestOptions(project_token, '/roles', true);
  request_options.metricPath = 'remote-calls.keystone.roles.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'roles';
  
  this.request.get(request_options, function(error, response, body){
    //console.log('roles', body);
    var n = 0;
    var roles_array = [];

    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    for(n = 0; n < body.roles.length; n++)
    {
      roles_array[n] = self.mangleObject('Role', body.roles[n]);
    }
    
    //tack these on for easy consupmtion and in case we ever need pagination
    roles_array.self = body.links.self;
    roles_array.previous = body.links.previous;
    roles_array.next = body.links.next;

    cb(null, roles_array);
  });
};



//make a callback(error, assignments_array) with all of the role assignments for a project
//NOTE: this is only works if the user is authed as an admin or projectAdmin
Keystone.prototype.listRoleAssignments = function(project_token, project_id, cb)
{
  var self = this;
  var request_options = this.getRequestOptions(project_token, '/role_assignments?scope.project.id=' + project_id, true);
  request_options.metricPath = 'remote-calls.keystone.role-assigments.list';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'role_assignments';

  this.request.get(request_options, function(error, response, body){
    var cb_error = null;
    var assignments_array = [];
    var n = 0;

    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    for(n = 0; n < body.role_assignments.length; n++)
    {
      assignments_array[n] = self.mangleObject('RoleAssignment', body.role_assignments[n]);
    }

    //tack these on for easy consupmtion and in case we ever need pagination
    assignments_array.self = body.links.self;
    assignments_array.previous = body.links.previous;
    assignments_array.next = body.links.next;

    cb(cb_error, assignments_array);
  });
};



//make a callback(error) after adding a specific role assignment to a project (either a user or a group)
//NOTE: this is only works if the user is authed as an admin or projectAdmin
Keystone.prototype.addRoleAssignment = function(project_token, project_id, entry_id, entry_type, role_id, cb)
{
  var request_options = {};
  var entry_type_path = 'users';

  if(entry_type == 'group')
  {
    entry_type_path = 'groups';
  }
  request_options = this.getRequestOptions(project_token, '/projects/' + project_id + '/' + entry_type_path + '/' + entry_id + '/roles/' + role_id, true);
  request_options.metricPath = 'remote-calls.keystone.role-assignments.add';
  request_options.validateStatus = true;

  this.request.put(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else the body comes back as undefined instead of containing the new role assingment - lame
    //so just call back with no error and we should be good
    
    cb();
  });
};



//make a callback(error) after removing a specific role assignments on a project(either a user or a group)
//NOTE: this is only works if the user is authed as an admin or projectAdmin
Keystone.prototype.removeRoleAssignment = function(project_token, project_id, entry_id, entry_type, role_id, cb)
{
  var request_options = {};
  var entry_type_path = 'users';

  if(entry_type == 'group')
  {
    entry_type_path = 'groups';
  }

  request_options = this.getRequestOptions(project_token, '/projects/' + project_id + '/' + entry_type_path + '/' + entry_id + '/roles/' + role_id, true);
  request_options.metricPath = 'remote-calls.keystone.role-assignments.remove';
  request_options.validateStatus = true;

  this.request.del(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb();
  });
};



//gets a list of all regions in the system
//calls back with cb(error, region_array)
Keystone.prototype.listRegions = function(access_token, cb)
{
  var self = this;
  var regions_array =[];
  var request_options = this.getRequestOptions(access_token, '/regions', true);
  request_options.metricPath = 'remote-calls.keystone.regions.list';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'regions';
  
  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //No mangling
    //You should handle input and output mangling outside of this lib going forward
    regions_array = body.regions;
    
    //tack these on for easy consupmtion and in case we ever need pagination
    regions_array.self = body.links.self;
    regions_array.previous = body.links.previous;
    regions_array.next = body.links.next;
    
    cb(null, regions_array);
  });
};



//THE FOLLOWING ARE ONLY USEFUL WITHIN GODADDY (and are prioprietary functions until/if the project meta data work is adopted)
//THUS THEY AREN"T DOCUMENTED
//--------------------------------------------------------------------------
//make a callback(error) after retrieving all of the possible environments for the project/server meta data
//calls back with cb(error, environments_array)
Keystone.prototype.listMetaEnvironments = function(auth_token, cb)
{
  var self = this;
  var request_options = {};
  var environments_array = [];
  var n = 0;

  request_options = this.getRequestOptions(auth_token, '/meta_values/environment', true);
  request_options.metricPath = 'remote-calls.keystone.meta-environments.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'environments';

  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    for(n = 0; n < body.environments.length; n++)
    {
      //this is a little silly since its just id/name but meh...
      environments_array[n] = self.mangleObject('MetaEnvironment', body.environments[n]);
    }
    cb(null, environments_array);
  });
};


//make a callback(error) after retrieving all of the possible ownsers for the project/server meta data
//calls back with cb(error, owning_groups_array)
Keystone.prototype.listMetaOwningGroups = function(auth_token, cb)
{
  var self = this;
  var request_options = {};
  var owning_groups_array = [];
  var n = 0;

  request_options = this.getRequestOptions(auth_token, '/meta_values/owning_group', true);
  request_options.metricPath = 'remote-calls.keystone.meta-owninggroups.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'owning_groups';

  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    for(n = 0; n < body.owning_groups.length; n++)
    {
      //this is a little silly since its just id/name but meh...
      owning_groups_array[n] = self.mangleObject('MetaOwningGroups', body.owning_groups[n]);
    }
    
    cb(null, owning_groups_array);
  });
};


//make a callback(error) after listing all of the project meta data
//calls back with cb(error, meta_object)
Keystone.prototype.listProjectMeta = function(project_token, project_id, cb)
{
  var self = this;
  var request_options = {};
  var meta_object = {};

  request_options = this.getRequestOptions(project_token, '/projects/' + project_id + '/meta', true);
  request_options.metricPath = 'remote-calls.keystone.projects.meta.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'meta';

  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else

    meta_object = self.mangleObject('ProjectMeta', body.meta);
    cb(null, meta_object);
  });
};


//make a callback(error) after updating the project meta data
//meta_data should be an object with key-value pairs ie: {environment: 'dev', group: 'marketing'}
//calls back with cb(error, meta_object)
Keystone.prototype.updateProjectMeta = function(project_token, project_id, new_meta, cb)
{
  var self = this;
  var request_options = {};
  var meta_data = {meta: new_meta}
  var meta_object = {};

  request_options = this.getRequestOptions(project_token, '/projects/' + project_id + '/meta', meta_data);
  request_options.metricPath = 'remote-calls.keystone.projects.meta.update';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'meta';

  this.request.put(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else

    meta_object = self.mangleObject('ProjectMeta', body.meta);
    cb(null, meta_object);
  });
};




module.exports = Keystone;
