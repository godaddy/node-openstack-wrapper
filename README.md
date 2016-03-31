# Openstack-Wrapper
A convenience wrapper for many of Openstack's common features with a focus on projects/tenants

## Install

``` bash
npm install openstack-wrapper
```

## General Usage

### Step 1 - Basic Authentication:

```js
//Before any other calls are made into the Openstack system,
//the user must do a general authentication

var OSWrap = require('openstack-wrapper');
var keystone = new OSWrap.Keystone('http://www.keystone.url');

keystone.getToken('username', 'password', function(error, token){
  if(error)
  {
    console.error('an error occured', error);
  }
  else
  {
    console.log('A general token object has been retrived', token);
    //the token value (token.token) is required for project listing & getting project specific tokens
  }
});
```


### Step 2 - Listing Projects:

```js
//Once a general authentication token value has been obtained
//a project id needs to be found before authenicating to that project
//obviously this listing step can be skipped if one already knows the id

var OSWrap = require('openstack-wrapper');
var keystone = new OSWrap.Keystone('http://www.keystone.url');

keystone.listProjects('username', 'general_token_value', function(error, projects_array)){
  if(error)
  {
    console.error('an error occured', error);
  }
  else
  {
    console.log('A list of projects was retrived', projects_array);
    //projects_array[n].id is required for many other calls and to generate a project specific token
  }
});
```


### Step 3 - Authenticating for a particular project:

```js
//Once a generic token and a project id have been obtained (through whatever means)
//a project specific token can be generated before instantiating the other library objects

var OSWrap = require('openstack-wrapper');
var keystone = new OSWrap.Keystone('http://www.keystone.url');

keystone.getProjectToken('general_token_value', 'project_id', function(error, project_token){
  if(error)
  {
    console.error('an error occured', error);
  }
  else
  {
    console.log('A project specific token has been retrived', project_token);
    //the project token contains all kinds of project information
    //including endpoint urls for each of the various systems (Nova, Neutron, Glance)
    //and the token value (project_token.token) required for instantiating all non Keystone Objects
    //see the openstack docs for more specifics on the return format of this object (or print it out I suppose)
  }
});
```


### Step 4 - Other Calls:

```js
//Now that we have a project specific token and the endpoint urls,
//we can instnantiate the other objects (Nova, Neutron, Glance) and call their methods

var OSWrap = require('openstack-wrapper');
var nova = new OSWrap.Nova('nova_endpoint_url', 'project_token_value');

nova.listServers(function(error, servers_array){
  if(error)
  {
    console.error('an error occured', error);
  }
  else
  {
    console.log('A list of servers have been retrived', servers_array);
    //Other objects (Glance, Neutron, Nova) and their methods follow a nearly identical pattern
  }
});
```

-----------

## Simplified Usage:

```js
//A simplified project object is available if the project id is already known
//it will perform both the general and project level authentications
//and return an object with nova, glance, and neutron objects ready to use

var OSWrap = require('openstack-wrapper');
OSWrap.getSimpleProject('username', 'password', 'project_id', 'keystone_url', function(error, project){
  if(error)
  {
    console.log('An error occured', error);
  }
  else
  {
    console.log('A Simple Project Object was retrieved', project);

    //to use the project object:
    project.nova.listServers(function(error, servers_array){
      if(error)
      {
        console.error('An error occured', error);
      }
      else
      {
        console.log('A list of servers was retrived', servers_array);
      }
    });
  }
});
```


## Objects & Methods

### Keystone (aka Identity)
* new Keystone(v3_public_url)
* setTimeout(timeout_milliseconds)
* setRequest(request_lib)
* setMangler(mangler_lib)
* getToken(username, password, callback)
* getProjectTokenById(generic_token_value, project_id, callback)
* getProjectTokenByName(generic_token_value, domain_id, project_name, callback)
* listProjects(project_token_value, callback) - token from any project w/admin privledges
* getProjectByName(project_token_value, project_name, callback) - token from any project w/admin privledges
* listUserProjects(username, generic_token_value, callback)
* listRoles(project_token_value, callback)
* listRoleAssignments(project_token_value, project_id, callback)
* addRoleAssignment(project_token_value, project_id, entry_id, entry_type, role_id, callback)
* removeRoleAssignment(project_token_value, project_id, entry_id, entry_type, role_id, callback)

### Nova (aka Compute)
* new Nova(v2_public_url, project_token_value)
* setTimeout(timeout_milliseconds)
* setRequest(request_lib)
* setMangler(mangler_lib)
* **Servers**
  * listServers(callback)
  * getServer(server_id, callback)
  * createServer(data_object, callback)
  * renameServer(server_id, new_name_string, callback)
  * resizeServer(server_id, flavor_id, callback)
  * confirmResizeServer(server_id, callback)
  * revertResizeServer(server_id, callback)
  * removeServer(server_id, callback)
  * rebootServer(server_id, callback)
  * forceRebootServer(server_id, callback)
  * stopServer(server_id, callback)
  * startServer(server_id, callback)
  * pauseServer(server_id, callback)
  * suspendServer(server_id, callback)
  * resumeServer(server_id, callback)
  * getConsoleURL(console_type_string, server_id, callback)
  * getServerLog(server_id, log_length_integer, callback)
  * createServerImage(server_id, data_object, callback)
  * setMetaData(server_id, data_object, callback)
* **Flavors**
  * listFlavors(callback)
  * getFlavor(flavor_id, callback)
* **Floating Ips**
  * listFloatingIps(callback)
  * getFloatingIp(floating_ip_id, callback)
  * createFloatingIp(data_object, callback)
  * removeFloatingIp(floating_ip_id, callback)
  * associateFloatingIp(server_id, ip_address, callback)
  * disassociateFloatingIp(server_id, ip_address, callback)
* **Floating IP Pools**
  * listFloatingIpPools(callback)
  * getFloatingIpPool(id, callback)
* **Availability Zones**
  * listAvailabilityZones(callback)
  * getAvailabilityZone(id, callback)
* **Key Pairs**
  * listKeyPairs(callback)
  * getKeyPair(key_pair_id, callback)
  * createKeyPair(key_pair_name, public_key, callback)
  * removeKeyPair(key_pair_id, callback)
* **Quota/Usage**
  * getQuotaSet(project_id, callback)
  * setQuotaSet(project_id, data_object, callback)
  * getTenantUsage(project_id, start_date_object, end_date_object, callback)
* **Security Groups**
  * assignSecurityGroup(security_group_name, server_id, callback)
  * removeSecurityGroup(security_group_name, server_id, callback)

### Glance (aka Image)
* new Glance(v2_public_url, project_token_value)
* setTimeout(timeout_milliseconds)
* setRequest(request_lib)
* setMangler(mangler_lib)
* listImages(callback)
* getImage(image_id, callback)
* queueImage(data_object, callback)
* uploadImage(image_id, stream_object, callback)
* updateImage(image_id, data_object, callback
* removeImage(image_id, callback)

### Neutron (aka Network)
* new Neutron(v2_public_url)
* setTimeout(timeout_milliseconds)
* setRequest(request_lib)
* setMangler(mangler_lib)
* **Networks**
* listNetworks(callback(error, array))
* getNetwork(network_id, callback(error, obj))
* **Routers**
* listRouters(callback(error, array))
* getRouter(router_id, callback(error, obj))
* **FloatingIps**
* createFloatingIp(floating_network_id, callback(error, obj))
* listFloatingIps(callback(error, array))
* getFloatingIp(ip_id, callback(error, obj))
* updateFloatingIp(ip_id, port_id, callback(error, obj))
* removeFloatingIp(ip_id, callback(error))
* **Ports**
* listPorts(callback(error, array))
* getPort(port_id, callback(error, obj))
* updatePort(port_id, data_object, callback(error, obj))
* **Security Groups**
* createSecurityGroup(group_name, data_object, callback(error, obj))
* listSecurityGroups(project_id, callback(error, array))
* getSecurityGroup(group_id, callback(error, obj))
* updateSecurityGroup(group_id, data_object, callback(error, obj))
* removeSecurityGroup(group_id, callback(error))
* **SecurityGroupRules**
* createSecurityGroupRule(group_id, data_object, callback(error, obj))
* listSecurityGroupRules(callback(error, array))
* getSecurityGroupRule(rule_id, callback(error, obj))

### Errors
* **OpenStackError** -- All other errors extend this, so you can check instanceof OpenStackError
* BadRequestError (400)
* InvalidStateError (400)
* NotLoggedInError (401)
* ForbiddenError (403)
* NotFoundError (404)
* BadMethodError (405)
* LimitExceededError (413)
* BadMediaError (415)
* ValidationError (422)
* GenericError (500)
* NotImplementedError (501)
* UnavailableError (503)


## Running Tests

To run the tests:

``` bash
cd openstack_wrapper/
npm install
npm test
```

## License

Copyright (c) 2014 Go Daddy Operating Company, LLC

See [LICENSE.txt](LICENSE.txt) for more info.
