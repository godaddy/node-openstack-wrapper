# Openstack-Wrapper
A convenience wrapper for many of Openstack's ecosystem of things

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
* setLogger(logger_obj)
* setMangler(mangler_lib) --DEPRECATED
* getToken(username, password, domain(optional), callback)
* getProjectTokenById(generic_token_value, project_id, callback)
* getProjectTokenByName(generic_token_value, domain_id, project_name, callback)
* listProjects(project_token_value, callback) - token from any project w/admin privledges
* getProjectByName(project_token_value, project_name, callback) - token from any project w/admin privledges
* listUserProjects(username, generic_token_value, callback)
* listRoles(project_token_value, callback)
* listRoleAssignments(project_token_value, project_id, callback)
* addRoleAssignment(project_token_value, project_id, entry_id, entry_type, role_id, callback)
* removeRoleAssignment(project_token_value, project_id, entry_id, entry_type, role_id, callback)
* listRegions(generic_token_value, callback)

### Nova (aka Compute)
* new Nova(v2_public_url, project_token_value)
* setTimeout(timeout_milliseconds)
* setLogger(logger_obj)
* setMangler(mangler_lib) --DEPRECATED
* **Servers**
  * listServers([options], callback)
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
* **Project Networks**
  * listProjectNetworks(callback)
* **Floating Ips**
  * listFloatingIps(callback)
  * listFloatingIps(options, callback)
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
* setMangler(mangler_lib) --DEPRECATED
* listImages(callback)
* getImage(image_id, callback)
* queueImage(data_object, callback)
* uploadImage(image_id, stream_object, callback)
* updateImage(image_id, data_object, callback
* removeImage(image_id, callback)

### Neutron (aka Network)
* new Neutron(v2_public_url, project_token_value)
* setTimeout(timeout_milliseconds)
* setLogger(logger_obj)
* setMangler(mangler_lib) --DEPRECATED
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
  * listPorts(options, callback(error, array))
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

### Octavia (aka LoadBalancing)
* new Octavia(v2_public_url, project_token_value)
* setTimeout(timeout_milliseconds)
* setRequestID(request_id)
* setUserName(user_name)
* setLogger(logger_obj)
* setRetries(retries_on_locked)
* setRetryDelay(delay_milliseconds)
* **Load Balancers**
  * createLoadBalancer(project_id, options_obj, cb(error, result_obj))
  * listLoadBalancers(cb(error, result_array))
  * getLoadBalancer(loadbalancer_id, cb(error, result_obj))
  * updateLoadBalancer(loadbalancer_id, options_obj, result_obj))
  * removeLoadBalancer(loadbalancer_id, cb(error))
* **LB Listeners**
  * createLBListener(loadbalancer_id, protocol, options_obj, cb(error, result_obj))
  * listLBListeners(cb(error, result_array))
  * getLBListener(listener_id, cb(error, result_obj))
  * updateLBListener(listener_id, options_obj, cb(error, result_obj))
  * removeLBListener(listener_id, cb(error))
* **LB Pools**
  * createLBPool(protocol, lb_algorithm, options_obj, cb(error, result_obj))
  * listLBPools(cb(error, result_array))
  * getLBPool(pool_id, cb(error, result_obj))
  * updateLBPool(pool_id, options_obj, cb(error, result_obj))
  * removeLBPool(pool_id, cb(error))
* **LB Health Monitors**
  * createLBHealthMonitor(pool_id, type, delay, timeout, max_retries, options_obj, cb(error, result_obj))
  * listLBHealthMonitors(cb(error, result_array))
  * getLBHealthMonitor(health_monitor_id, cb(error, result_obj))
  * updateLBHealthMonitor(health_monitor_id, options_obj, cb(error, result_obj))
  * removeLBHealthMonitor(health_monitor_id, cb(error))
* **LB Pool Members**
  * createLBPoolMember(pool_id, address, protocol_port, options_obj, cb(error, result_obj))
  * listLBPoolMembers(pool_id, cb(error, result_array))
  * getLBPoolMember(pool_id, member_id, cb(error, result_obj))
  * updateLBPoolMember(pool_id, member_id, options_obj, cb(error, result_obj))
  * removeLBPoolMember(pool_id, member_id, cb(error))

### Heat (aka Orchestration)
* new Heat(v1_public_url, project_token_value)
* setTimeout(timeout_milliseconds)
* **Stacks**
  * listStacks(options_obj, cb(error, result_obj))
  * createStack(stack_name, options_obj, cb(error, result_obj))
  * updateStack(stack_name, stack_id, options_obj, cb(error, result_obj))
  * deleteStack(stack_name, stack_id, cb(error, result_obj))

## Running Tests

To run the tests:

``` bash
cd openstack_wrapper/
npm install
npm test
```

## Change Log
### 2.2.0

* Updated Nova.createServerImage to handle Nova 2.45+ format (new output format breaks backwards compat on this method so incrimented minor ver)

### 2.1.13

* Added Heat object and methods

### 2.1.12

* Added project network listing to Nova

### 2.1.11

* Added region listing to Keystone

### 2.1.8

* Added optional filtering on server listing calls

### 2.1.0

* Added Octavia calls for LoadBalancers, Listeners, Pools, HealthChecks, and Members
* Mangling is now Deprecated and not available in any new methods (like the Octavia ones) because 1-way mangling was a bad idea 2-way is better implemented in-app

### 2.0.0

* Added support for a logger object instead of replacing entire request object to faciliate remote call logging.
* Removed multiple error types.  All methods now return a general error with a 'detail' property containing call details if a call was made
* Removed global timeout feature (too confusing when that was/wasn't in play)

### 1.4.0
	
* Removed usage of OpenStackErrors. Specifically removed all references of isError() & getError() in favor of: isRequestError() & getRequestError().
* Added structures for additional neutron functionality to be released in 1.5.X

## License

Copyright (c) 2014 Go Daddy Operating Company, LLC

See [LICENSE.txt](LICENSE.txt) for more info.
