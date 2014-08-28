var osutils = require('./os-utils');


//constructor - should be the only export
function Keystone(v3_url, call_timeout)
{
  //we need to overwrite this for unit testing and it allows us to use a custom request object that includes graphite logging
  this.request = require('request');
  
  //Keystone v3 is the only supported version at this point - add the url and yank all trailing slashes
  this.url = v3_url.replace(/\/$/, "");
  
  //default the timeout in case one isn't set
  if(typeof call_timeout == 'undefined')
  {
    this.timeout = 9000;
  }
  this.timeout = call_timeout;
}



//lets us override the existing request lib for this instance (useful for a bunch of things)
Keystone.prototype.setRequest = function(request_lib)
{
  this.request = request_lib;
};



//returns an formatted options object - just makes the code below a little less repetitious
//auth_token can be either a generic or project scoped token depending what your doing
//json_value should be almost certainly be true if you don't have an actual object you want to send over
//NOTE: because keystone is non-project specific this function is different than all the other classes with it
Keystone.prototype.getRequestOptions = function(auth_token, path, json_value)
{
  var return_object = {
    uri: this.url + path,
    headers:{'X-Auth-Token': auth_token},
    json: json_value,
    timeout: this.timeout
  };

  return return_object;
};



//make a callback(error, token) authenticating the user and returning a token
Keystone.prototype.getAuthToken = function(username, password, cb)
{
  var auth_data = {
    auth:{
      identity:{
        methods: ['password'],
        'password': {user: {domain: {name: 'Default'}, name: username, 'password': password}}
      }
    }
  }
  var request_options = this.getRequestOptions('bogus', '/auth/tokens', auth_data);
  request_options.headers = {}; //we don't want the normal auth header due to bogus token
  request_options.logPath = 'api-calls.keystone.token-get';

  //auth-token will come back in the header for some reason as x-subject-token (used to come back in the body all nice like)
  this.request.post(request_options, function(error, response, body){
    if(osutils.isError(error, response) || !response.headers || !response.headers['x-subject-token'])
    {
      cb(osutils.getError('keystone.getAuthToken', error, response, body));
      return;
    }

    access_token = response.headers['x-subject-token'];
    cb(null, access_token);
  });
};



//make a callback(error, project_array) with the list of projects a user has access to
Keystone.prototype.getProjects = function(username, access_token, cb)
{
  var request_options = this.getRequestOptions(access_token, '/users/' + username + '/projects', true);
  request_options.logPath = 'api-calls.keystone.projects-list';

  this.request.get(request_options, function(error, response, body){
    if(osutils.isError(error, response) || !body.projects)
    {
      cb(osutils.getError('keystone.getProjects', error, response, body));
      return;
    }

    cb(null, body.projects);
  });
};



//make a callback(error, project_info) with all of the data on a project
//NOTE: this is not the admin function that gets project details
//its a hackish thing that re-auths with the generic token to get a scoped token for that project along with other details
Keystone.prototype.getProjectInfo = function(access_token, project_id, cb)
{
  var project_info = new Object();
  var api_docs = {
    'identity':       'http://developer.openstack.org/api-ref-identity-v2.html',
    'identityv3':     'http://developer.openstack.org/api-ref-identity-v3.html',
    'compute':        'http://developer.openstack.org/api-ref-compute-v2.html',
    'computev3':      'http://developer.openstack.org/api-ref-compute-v3.html',
    'image':          'http://developer.openstack.org/api-ref-image-v1.html',
    'imagev2':        'http://developer.openstack.org/api-ref-image-v2.html',
    'volume':         'http://developer.openstack.org/api-ref-blockstorage-v1.html',
    'volumev2':       'http://developer.openstack.org/api-ref-blockstorage-v2.html',
    'metering':       'http://developer.openstack.org/api-ref-telemetry-v2.html',
    'network':        'http://developer.openstack.org/api-ref-networking-v2.html',
    'networkv2':      'http://developer.openstack.org/api-ref-networking-v2.html',
    's3':             'http://aws.amazon.com/documentation/s3/',
    'ec2':            'http://aws.amazon.com/documentation/ec2/',
    'orchestration':  'http://api.openstack.org/api-ref-orchestration-v1.html',
    'cloudformation': 'http://docs.openstack.org/developer/heat/',
  };
  var api_names = {
    'identity':       'keystone',
    'identityv3':     'keystonev3',
    'compute':        'nova',
    'computev3':      'novav3',
    'image':          'glance',
    'imagev2':        'glancev2',
    'volume':         'ummmm',
    'metering':       'ceilometer',
    'network':        'neutron',
    'networkv2':      'neutronv2',
    's3':             's3',
    'ec2':            'nova_ec2',
    'orchestration':  'heat',
    'cloudformation': 'heat-cfn',
  }
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
  var request_options = this.getRequestOptions('bogus', '/auth/tokens', auth_data);
  request_options.headers = {}; //we don't want the normal auth header due to bogus token
  request_options.logPath = 'api-calls.keystone.project-info';

  this.request.post(request_options, function(error, response, body){
    var roles = [];
    var catalog = {};
    var endpoints = {};
    var is_admin = false;
    var role = 'Member';
    var public_url = '';
    var admin_url = '';
    var internal_url = '';
    var api_name = '';
    var api_doc = '';
    var type = '';
    var n = 0;
    var p = 0;

    if(osutils.isError(error, response) || !body.token || !body.token.catalog || !response.headers || !response.headers['x-subject-token'])
    {
      cb(osutils.getError('keystone.getProjectInfo', error, response, body));
      return;
    }

    //we can break out and send back all the roles,
    //but since its an array we might as well loop and look for the most expansive role
    roles = body.token.roles;
    for(n = 0; n < roles.length; n++)
    {
      if(roles[n].name.toLowerCase() == 'admin')
      {
        role = 'Admin';
        is_admin = true;
        break;
      }
      else if (roles[n].name.toLowerCase() == 'projectadmin')
      {
        role = 'ProjectAdmin';
        is_admin = true;
        //don't break - allow it to keep looping in case the user is a full admin
      }
      //else go with the default of member and keep lookin
    }

    //catalog will come back as an array of arrays (endpoints->urls)
    //we tweak it here to make it easier to work with/look at
    catalog = body.token.catalog;
    for(n = 0; n < catalog.length; n++)
    {
      // dkHack: ELS Puppet sometimes screws up Keystone and puts in duplicate service entries
      //  that have no endpoints.. ignore these.
      if ( !catalog[n].endpoints || !catalog[n].endpoints.length )
      {
        continue;
      }

      //reset these for each endpoint - though each one should have all in theory
      type = catalog[n].type;
      api_name = api_names[type];  //name no longer comes back in the array sadly - we can remove this if we want but its used for now
      api_doc = api_docs[type];
      public_url = '';
      admin_url = '';
      internal_url = '';

      for(p = 0; p < catalog[n].endpoints.length; p++)
      {
        if(catalog[n].endpoints[p]['interface'] == 'public')
        {
          public_url = catalog[n].endpoints[p].url;
        }
        if(catalog[n].endpoints[p]['interface'] == 'admin')
        {
          admin_url = catalog[n].endpoints[p].url;
        }
        if(catalog[n].endpoints[p]['interface'] == 'admin')
        {
          internal_url = catalog[n].endpoints[p].url;
        }
      }

      endpoints[api_name] = {
        id: catalog[n].id,
        name: api_name,
        type: catalog[n].type,
        docs: api_doc,
        publicUrl: public_url.replace(/\/$/, ""),//yank any trailing /'s,
        adminUrl: admin_url.replace(/\/$/, ""),
        internalUrl: internal_url.replace(/\/$/, "")
      };
    }

    //and since we are using the beta-ish v2.0 for glance and v2.0 for neutron right now
    //may need to add these to internalUrl and adminUrl in the future
    if ( endpoints['glance'] && !endpoints['glancev2'] )
    {
      var glancev2 = JSON.parse(JSON.stringify(endpoints.glance));
      glancev2.publicUrl = glancev2.publicUrl + '/v2.0';
      glancev2.name = 'glancev2';
      endpoints['glancev2'] = glancev2;
    }

    if ( endpoints['neutron'] && !endpoints['neutronv2'] )
    {
      var neutronv2 = JSON.parse(JSON.stringify(endpoints.neutron));
      neutronv2.publicUrl = neutronv2.publicUrl + '/v2.0';
      neutronv2.name = 'neutronv2';
      endpoints['neutronv2'] = neutronv2;
    }

    project_info.role = role;
    project_info.is_admin = is_admin;
    project_info.endpoints = endpoints;
    project_info.token = response.headers['x-subject-token']; //no need for the rest of the token info...

    cb(null, project_info);
  });
};



//make a callback(error, roles_array) with all of the possible roles for a project
//NOTE: for now this needs a project token that is an admin or ProjectAdmin on a project but we are fixing this... hopefully
Keystone.prototype.getRoles = function(project_token, cb)
{
  var request_options = this.getRequestOptions(project_token, '/roles', true);
  request_options.logPath = 'api-calls.keystone.roles-get';

  this.request.get(request_options, function(error, response, body){
    //console.log('roles', body);
    var n = 0;

    if(osutils.isError(error, response) == true || !body.roles)
    {
      cb(osutils.getError('keystone.getRoles', error, response, body));
    }
    else
    {
      cb(null, body.roles);
    }
  });
};



//make a callback(error, roles_array) with all of the roles for a project
//NOTE: this is only works if the user is authed as an admin or projectAdmin
Keystone.prototype.getProjectAssignments = function(project_token, project_id, cb)
{
  var request_options = this.getRequestOptions(project_token, '/role_assignments?scope.project.id=' + project_id, true);
  request_options.logPath = 'api-calls.keystone.project-assigments-list';

  this.request.get(request_options, function(error, response, body){
    //console.log('users', body);
    var cb_error = null;

    if(osutils.isError(error, response) == true || !body.role_assignments)
    {
      cb_error = osutils.getError('keystone.getProjectRoles', error, response, body);
    }

    cb(cb_error, body.role_assignments);
  });
};



//make a callback(error) after adding a specific entry from the project assignments (either a user or a group)
//NOTE: this is only works if the user is authed as an admin or projectAdmin
Keystone.prototype.addProjectAssignment = function(project_token, project_id, entry_id, entry_type, role_id, cb)
{
  var request_options = {};
  var entry_type_path = 'users';

  if(entry_type == 'group')
  {
    entry_type_path = 'groups';
  }
  request_options = this.getRequestOptions(project_token, '/projects/' + project_id + '/' + entry_type_path + '/' + entry_id + '/roles/' + role_id, true);
  request_options.logPath = 'api-calls.keystone.project-assignment-add';

  this.request.put(request_options, function(error, response, body){
    if(osutils.isError(error, response) == true)
    {
      cb(osutils.getError('keystone.addProjectAssignment', error, response, body));
    }
    else
    {
      cb();//nothing useful to return at this time
    }
  });
};



//make a callback(error) after removing a specific entry from the project assignments (either a user or a group)
//NOTE: this is only works if the user is authed as an admin or projectAdmin
Keystone.prototype.removeProjectAssignment = function(project_token, project_id, entry_id, entry_type, role_id, cb)
{
  var request_options = {};
  var entry_type_path = 'users';

  if(entry_type == 'group')
  {
    entry_type_path = 'groups';
  }

  request_options = this.getRequestOptions(project_token, '/projects/' + project_id + '/' + entry_type_path + '/' + entry_id + '/roles/' + role_id, true);
  request_options.logPath = 'api-calls.keystone.project-assignment-remove';

  this.request.del(request_options, function(error, response, body){
    if(osutils.isError(error, response) == true)
    {
      cb(osutils.getError('keystone.removeProjectAssignment', error, response, body));
    }
    else
    {
      cb();//nothing useful to return at this time
    }
  });
};


module.exports = Keystone;