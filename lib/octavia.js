var OSUtils = require('./os-utils');
var Request = require('./os-request');


//constructor - should be the only export
function Octavia(endpoint_url, auth_token)
{
  //set this way purely to facilitate unit test dependency injetion
  this.request = Request;
  
  //this is an optional lib that we override to normalfy the openstack responses - leave as is for no munging
  this.mangler = require('./mangler');
  this.mangleObject = this.mangler.mangleObject;

  //Keystone v3 is the only supported version at this point - add the url and yank all trailing slashes
  this.url = endpoint_url.replace(/\/$/, "");
  
  //auth_token should be the scoped token from the projectInfo call
  this.token = auth_token;

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
Octavia.prototype.setTimeout = function(new_timeout)
{
  this.timeout = new_timeout;
};

Octavia.prototype.setRequestID = function(request_id)
{
  this.request_id = request_id;
};

Octavia.prototype.setUserName = function(user_name)
{
  this.user_name = user_name;
};

Octavia.prototype.setLogger = function(logger)
{
  this.logger = logger;
};

//this should only be used for dependency injection
Octavia.prototype.setRequest = function(request_lib)
{
  this.request = request_lib;
}


//lets us mangle/sanitize/make sane the various responses from openstack
//any replacement must simply support a static mangleObject that supports the following types [ie mangleObject(type, object)]
//SecurityGroup, SecurityRule, etc..
Octavia.prototype.setMangler = function(mangle_lib)
{
  this.mangler = mangle_lib;
  this.mangleObject = this.mangler.mangleObject;
}



//returns an formatted options object - just makes the code below a little less repetitious
//path should begin with a "/"
//json_value should be almost certainly be true if you don't have an actual object you want to send over
Octavia.prototype.getRequestOptions = function(path, json_value)
{
  //start w/the instance timeout
  var request_timeout = this.timeout;
  if(!request_timeout)
  {
    //override with the static value if no instance value was given
    request_timeout = Octavia.timeout;
  }
  var return_object = {
    uri: this.url + path,
    headers:{'X-Auth-Token': this.token},
    json: json_value,
    timeout: this.timeout,
    metricRequestID: this.request_id,
    metricUserName: this.user_name,
    metricLogger: this.logger
  };

  return return_object;
};



Octavia.prototype.listLoadBalancers = function(cb){
  var self = this;
  var request_options = this.getRequestOptions('/lbaas/loadbalancers', true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.loadbalancers.list';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'loadbalancers';

  this.request.get(request_options, function(error, response, body){
    var lb_array = [];
    var n = 0;

    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    // Not sure at this point if a blank resource comes back as an empty array or what so....
    if(body.loadbalancers.length)
    {
      for(n = 0; n < body.loadbalancers.length; n++)
      {
        lb_array[n] = self.mangleObject('LoadBalancer', body.loadbalancers[n]);
      }
    }
    
    cb(null, lb_array);
  });
};


Octavia.prototype.getLoadBalancer = function(lb_id, cb){
  var self = this;
  var request_options = this.getRequestOptions('/lbaas/loadbalancers/' + lb_id, true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.loadbalancers.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'loadbalancer';

  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else

    cb(null, self.mangleObject('LoadBalancer', body.loadbalancer));
  });
};


//Calls back cb(error, rule) with a newly created resource from the given params
//also we need a freakin un-mangler!
Octavia.prototype.createLoadBalancer = function(project_id, data, cb){
  var self = this;
  var optional_keys = ['name', 'description', 'vip_address', 'vip_network_id', 'vip_port_id', 'admin_state_up', 'flavor', 'provider'];
  var post_data = {loadbalancer: {}};
  var key = '';
  var n = 0;
  var request_options = {};

  //loop through all the data values
  for(n = 0; n < optional_keys.length; n++)
  {
    key = optional_keys[n];
    if(typeof data[key] != 'undefined')
    {
      post_data.loadbalancer[key] = data[key];
    }
  }

  //and now we can get the full request options object add the log path and make the request
  request_options = this.getRequestOptions('/lbaas/loadbalancers', post_data);
  request_options.metricPath = 'remote-calls.octavia.lbaas.loadbalancers.create';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'loadbalancer';
  request_options.debug = true;
  
  this.request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, self.mangleObject('LoadBalancer', body.loadbalancer));
  });
};



//calls back with (error, lb) after updating the lb params
Octavia.prototype.updateLoadBalancer = function(lb_id, data, cb){
  var self = this;
  var optional_keys = ['name', 'description', 'admin_state_up'];
  var put_data = {loadbalancer: {}};
  var key = '';
  var n = 0;
  var request_options = {};

  //loop through all the optional data keys and add them to the post data
  for(n = 0; n < optional_keys.length; n++)
  {
    key = optional_keys[n];
    if(typeof data[key] != 'undefined')
    {
      put_data.loadbalancer[key] = data[key];
    }
  }

  request_options = this.getRequestOptions('/lbaas/loadbalancers/' + lb_id, put_data);
  request_options.metricPath = 'remote-calls.octavia.lbaas.loadbalancers.update';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'loadbalancer';

  this.request.put(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, self.mangleObject('updateLoadBalancer', body.loadbalancer));
  });
};



//calls back with (error) after attempting to remove the given lb
Octavia.prototype.removeLoadBalancer = function(lb_id, cb){
  var request_options = this.getRequestOptions('/lbaas/loadbalancers/' + lb_id, true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.loadbalancers.remove';
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



// -------------------------------------------------- //
// ------------------- Load Balancer Listeners -------------------- //
// -------------------------------------------------- //

Octavia.prototype.listLBListeners = function(cb){
  var self = this;
  var request_options = this.getRequestOptions('/lbaas/listeners', true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.listeners.list';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'listeners';

  this.request.get(request_options, function(error, response, body){
    var listener_array = [];
    var n = 0;

    if(error)
    {
      cb(error);
      return;
    }
    //else

    // Not sure at this point if a blank listener comes back as an empty array or what so....
    if(body.listeners && body.listeners.length)
    {
      for(n = 0; n < body.listeners.length; n++)
      {
        listener_array[n] = self.mangleObject('LBListener', body.listeners[n]);
      }
    }
    
    cb(null, listener_array);
  });
};


Octavia.prototype.getLBListener = function(listener_id, cb){
  var self = this;
  var request_options = this.getRequestOptions('/lbaas/listeners/' + listener_id, true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.listeners.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'listener';

  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, self.mangleObject('LBListener', body.listener));
  });
};


// Calls back cb(error, rule) with a newly created listener from the given params
Octavia.prototype.createLBListener = function(tenant_id, loadbalancer_id, description, protocol, data, cb){
  var self = this;
  var optional_keys = ['protocol_port', 'default_tls_container_ref', 'sni_container_refs', 'admin_state_up', 'name', 'connection_limit'];
  var post_data = {listener: {}};
  var key = '';
  var n = 0;
  var request_options = {};

  //we have 4 required params
  post_data.listener.tenant_id = tenant_id;
  post_data.listener.loadbalancer_id = loadbalancer_id;
  post_data.listener.description = description;
  post_data.listener.protocol = protocol;

  //now loop through all the optional ones
  for(n = 0; n < optional_keys.length; n++)
  {
    key = optional_keys[n];
    if(typeof data[key] != 'undefined')
    {
      post_data.listener[key] = data[key];
    }
  }

  //and now we can get the full request options object add the log path and make the request
  request_options = this.getRequestOptions('/lbaas/listeners', post_data);
  request_options.metricPath = 'remote-calls.octavia.lbaas.listeners.create';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'listener';

  this.request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, self.mangleObject('LBListener', body.listener));
  });
};


//calls back with (error, listener) after updating the listener
Octavia.prototype.updateLBListener = function(listener_id, data, cb){
  var self = this;
  var optional_keys = ['name', 'description', 'admin_state_up', 'connection_limit', 'default_tls_container_ref', 'sni_container_refs'];
  var put_data = {listener: {}};
  var key = '';
  var n = 0;
  var request_options = {};

  //loop through all the optional data keys and add them to the post data
  for(n = 0; n < optional_keys.length; n++)
  {
    key = optional_keys[n];
    if(typeof data[key] != 'undefined')
    {
      put_data.listener[key] = data[key];
    }
  }

  request_options = this.getRequestOptions('/lbaas/listeners/' + listener_id, put_data);
  request_options.metricPath = 'remote-calls.octavia.lbaas.listeners.update';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'listener';

  this.request.put(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, self.mangleObject('LBListener', body.listener));
  });
};


//calls back with (error) after attempting to remove the given resource
Octavia.prototype.removeLBListener = function(listener_id, cb){
  var request_options = this.getRequestOptions('/lbaas/listeners/' + listener_id, true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.listeners.remove';
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


// -------------------------------------------------- //
// -------------------- LBPools --------------------- //
// -------------------------------------------------- //

Octavia.prototype.listLBPools = function(cb){
  var self = this;
  var request_options = this.getRequestOptions('/lbaas/pools', true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.pools.list';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'pools';
  
  this.request.get(request_options, function(error, response, body){
    var pool_array = [];
    var n = 0;

    if(error)
    {
      cb(error);
      return;
    }
    //else

    if(body.pools.length)
    {
      for(n = 0; n < body.pools.length; n++)
      {
        pool_array[n] = self.mangleObject('LBPool', body.pools[n]);
      }
    }
    
    cb(null, pool_array);
  });
};


Octavia.prototype.getLBPool = function(pool_id, cb){
  var self = this;
  var request_options = this.getRequestOptions('/lbaas/pools/' + pool_id, true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.pools.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'pool';

  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else

    cb(null, self.mangleObject('LBPool', body.pool));
  });
};


// Calls back cb(error, rule) with a newly created resource from the given params
Octavia.prototype.createLBPool = function(tenant_id, protocol, lb_algorithm, listener_id, data, cb){
  var self = this;
  var optional_keys = ['admin_state_up', 'name', 'description', 'session_persistence'];
  var post_data = {pool: {}};
  var key = '';
  var n = 0;
  var request_options = {};

  // we have 4 required params
  post_data.pool.tenant_id = tenant_id;
  post_data.pool.protocol = protocol;
  post_data.pool.lb_algorithm = lb_algorithm;
  post_data.pool.listener_id = listener_id;

  // now loop through all the optional ones
  for(n = 0; n < optional_keys.length; n++)
  {
    key = optional_keys[n];
    if(typeof data[key] != 'undefined')
    {
      post_data.pool[key] = data[key];
    }
  }

  //and now we can get the full request options object add the log path and make the request
  request_options = this.getRequestOptions('/lbaas/pools', post_data);
  request_options.metricPath = 'remote-calls.octavia.lbaas.pools.create';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'pool';

  this.request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, self.mangleObject('LBPool', body.pool));
  });
};


Octavia.prototype.updateLBPool = function(pool_id, data, cb){
  var self = this;
  var optional_keys = ['name', 'description', 'admin_state_up', 'lb_algorithm', 'session_persistence'];
  var put_data = {pool: {}};
  var key = '';
  var n = 0;
  var request_options = {};

  //loop through all the optional data keys and add them to the post data
  for(n = 0; n < optional_keys.length; n++)
  {
    key = optional_keys[n];
    if(typeof data[key] != 'undefined')
    {
      put_data.pool[key] = data[key];
    }
  }

  request_options = this.getRequestOptions('/lbaas/pools/' + pool_id, put_data);
  request_options.metricPath = 'remote-calls.octavia.lbaas.pools.update';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'pool';

  this.request.put(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, self.mangleObject('LBPool', body.pool));
  });
};


//calls back with (error) after attempting to remove the given resource
Octavia.prototype.removeLBPool = function(pool_id, cb){
  var request_options = this.getRequestOptions('/lbaas/pools/' + pool_id, true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.pools.remove';
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


// -------------------------------------------------- //
// -------------------- LBPoolMembers --------------------- //
// -------------------------------------------------- //

Octavia.prototype.listLBPoolMembers = function(pool_id, cb){
  var self = this;
  var member_array = [];
  var n = 0;
  var request_options = this.getRequestOptions('/lbaas/pools/' + pool_id + '/members', true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.pools.members.list';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'members';

  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    if(body.members.length)
    {
      for(n = 0; n < body.members.length; n++)
      {
        member_array[n] = self.mangleObject('LBPoolMember', body.members[n]);
      }
    }

    cb(null, member_array);
  });
};


Octavia.prototype.getLBPoolMember = function(pool_id, member_id, cb){
  var self = this;
  var request_options = this.getRequestOptions('/lbaas/pools/' + pool_id + '/members/' + member_id, true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.pools.members.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'member';

  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, self.mangleObject('LBPoolMember', body.member));
  });
};


// Calls back cb(error, rule) with a newly created resource from the given params
Octavia.prototype.createLBPoolMember = function(pool_id, tenant_id, address, protocol_port, data, cb){
  var self = this;
  var optional_keys = ['admin_state_up', 'weight', 'subnet_id'];
  var post_data = {member: {}};
  var key = '';
  var n = 0;
  var request_options = {};

  // we have 4 required params
  post_data.member.tenant_id = tenant_id;
  post_data.member.address = address;
  post_data.member.protocol_port = protocol_port;

  // now loop through all the optional ones
  for(n = 0; n < optional_keys.length; n++)
  {
    key = optional_keys[n];
    if(typeof data[key] != 'undefined')
    {
      post_data.member[key] = data[key];
    }
  }

  //and now we can get the full request options object add the log path and make the request
  request_options = this.getRequestOptions('/lbaas/pools/' + pool_id + '/members', post_data);
  request_options.metricPath = 'remote-calls.octavia.lbaas.pools.members.create';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'member';

  this.request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, self.mangleObject('LBPoolMember', body.member));
  });
};


Octavia.prototype.updateLBPoolMember = function(pool_id, member_id, data, cb){
  var self = this;
  var optional_keys = ['weight', 'admin_state_up'];
  var put_data = {member: {}};
  var key = '';
  var n = 0;
  var request_options = {};

  //loop through all the optional data keys and add them to the post data
  for(n = 0; n < optional_keys.length; n++)
  {
    key = optional_keys[n];
    if(typeof data[key] != 'undefined')
    {
      put_data.member[key] = data[key];
    }
  }

  request_options = this.getRequestOptions('/lbaas/pools/' + pool_id + '/members/' + member_id, put_data);
  request_options.metricPath = 'remote-calls.octavia.lbaas.pools.members.update';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'member';

  this.request.put(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, self.mangleObject('LBMember', body.member));
  });
};


//calls back with (error) after attempting to remove the given resource
Octavia.prototype.removeLBPoolMember = function(pool_id, member_id, cb){
  var request_options = this.getRequestOptions('/lbaas/pools/' + pool_id +'/members/' + member_id, true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.pools.members.remove';
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


// -------------------------------------------------- //
// ----------------- Health Monitors ---------------- //
// -------------------------------------------------- //


Octavia.prototype.listLBHealthMonitors = function(cb){
  var self = this;
  var request_options = this.getRequestOptions('/lbaas/healthmonitors', true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.healthmonitors.list';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'healthmonitors';

  this.request.get(request_options, function(error, response, body){
    var healthmonitor_array = [];
    var n = 0;

    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    if(body.healthmonitors && body.healthmonitors.length)
    {
      for(n = 0; n < body.healthmonitors.length; n++)
      {
        healthmonitor_array[n] = self.mangleObject('LBHealthMonitor', body.healthmonitors[n]);
      }
    }
    
    cb(null, healthmonitor_array);
  });
};


Octavia.prototype.getLBHealthMonitor = function(health_monitor_id, cb){
  var self = this;
  var request_options = this.getRequestOptions('/lbaas/healthmonitors/' + health_monitor_id, true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.healthmonitors.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'healthmonitor';

  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, self.mangleObject('LBHealthMonitor', body.healthmonitor));
  });
};


// Calls back cb(error, rule) with a newly created resource from the given params
Octavia.prototype.createLBHealthMonitor = function(tenant_id, type, delay, timeout, max_retries, pool_id, data, cb){
  var self = this;
  var optional_keys = ['http_method', 'url_path', 'expected_codes', 'admin_state_up'];
  var post_data = {healthmonitor: {}};
  var key = '';
  var n = 0;
  var request_options = {};

  // we have 4 required params
  post_data.healthmonitor.tenant_id = tenant_id;
  post_data.healthmonitor.type = type;
  post_data.healthmonitor.delay = delay;
  post_data.healthmonitor.timeout = timeout;
  post_data.healthmonitor.max_retries = max_retries;
  post_data.healthmonitor.pool_id = pool_id;

  // now loop through all the optional ones
  for(n = 0; n < optional_keys.length; n++)
  {
    key = optional_keys[n];
    if(typeof data[key] != 'undefined')
    {
      post_data.healthmonitor[key] = data[key];
    }
  }

  //and now we can get the full request options object add the log path and make the request
  request_options = this.getRequestOptions('/lbaas/healthmonitors', post_data);
  request_options.metricPath = 'remote-calls.octavia.lbaas.healthmonitors.create';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'healthmonitor';

  this.request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, self.mangleObject('LBHealthMonitor', body.healthmonitor));
  });
};


Octavia.prototype.updateLBHealthMonitor = function(health_monitor_id, data, cb){
  var self = this;
  var optional_keys = ['delay', 'timeout', 'max_retries', 'http_method', 'url_path', 'expected_codes', 'admin_state_up'];
  var put_data = {healthmonitor: {}};
  var key = '';
  var n = 0;
  var request_options = {};

  //loop through all the optional data keys and add them to the post data
  for(n = 0; n < optional_keys.length; n++)
  {
    key = optional_keys[n];
    if(typeof data[key] != 'undefined')
    {
      put_data.healthmonitor[key] = data[key];
    }
  }

  request_options = this.getRequestOptions('/lbaas/healthmonitors/' + health_monitor_id, put_data);
  request_options.metricPath = 'remote-calls.octavia.lbaas.healthmonitors.update';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'healthmonitor';
  
  this.request.put(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, self.mangleObject('LBHealthMonitor', body.healthmonitor));
  });
};


//calls back with (error) after attempting to remove the given resource
Octavia.prototype.removeLBHealthMonitor = function(health_monitor_id, cb){
  var request_options = this.getRequestOptions('/lbaas/healthmonitors/' + health_monitor_id, true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.healthmonitors.remove';
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


// -------------------------------------------------- //
// ---------------------- Stats --------------------- //
// -------------------------------------------------- //
//NOTE: May not be available in your openstack installation
//Leaving it here as it may be of use to those who do have it available
Octavia.prototype.getLBStats = function(lb_id, cb){
  var self = this;
  var request_options = this.getRequestOptions('/lbaas/loadbalancers/' + lb_id + '/stats', true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.loadbalancers.stats.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'stats';

  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, self.mangleObject('LBStat', body.stats));
  });
};

module.exports = Octavia;
