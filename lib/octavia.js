var Async = require('async');
var Request = require('./os-request');


//constructor - should be the only export
function Octavia(endpoint_url, auth_token)
{
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
  
  //the # of retries to attempt if a call is met with a 409/immutable error
  this.retries = 5;
  
  //the delay between the call attempts when met with a 409/immutable error
  this.retry_delay = 2000;
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

Octavia.prototype.setRetries = function(retries)
{
  this.retries = retries;
};

Octavia.prototype.setRetryDelay = function(retry_delay)
{
  this.retry_delay = retry_delay;
};


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
  var request_options = this.getRequestOptions('/lbaas/loadbalancers', true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.loadbalancers.list';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'loadbalancers';

  Request.get(request_options, function(error, response, body){
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
        lb_array[n] = body.loadbalancers[n];
      }
    }
    
    cb(null, lb_array);
  });
};


Octavia.prototype.getLoadBalancer = function(lb_id, cb){
  var request_options = this.getRequestOptions('/lbaas/loadbalancers/' + lb_id, true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.loadbalancers.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'loadbalancer';

  Request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else

    cb(null, body.loadbalancer);
  });
};


//Calls back cb(error, rule) with a newly created resource from the given params
Octavia.prototype.createLoadBalancer = function(project_id, data, cb){
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
  
  Request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, body.loadbalancer);
  });
};



//calls back with (error, lb) after updating the lb params
Octavia.prototype.updateLoadBalancer = function(lb_id, data, cb){
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

  Request.put(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, body.loadbalancer);
  });
};



//calls back with (error) after attempting to remove the given lb
Octavia.prototype.removeLoadBalancer = function(lb_id, cb){
  var request_options = this.getRequestOptions('/lbaas/loadbalancers/' + lb_id, true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.loadbalancers.remove';
  request_options.validateStatus = true; 

  Request.del(request_options, function(error, response, body){
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
  var request_options = this.getRequestOptions('/lbaas/listeners', true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.listeners.list';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'listeners';

  Request.get(request_options, function(error, response, body){
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
        listener_array[n] = body.listeners[n];
      }
    }
    
    cb(null, listener_array);
  });
};


Octavia.prototype.getLBListener = function(listener_id, cb){
  var request_options = this.getRequestOptions('/lbaas/listeners/' + listener_id, true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.listeners.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'listener';

  Request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, body.listener);
  });
};



//Creates a load balancer listener
//calls back with cb(error, listener)
Octavia.prototype.createLBListener = function(loadbalancer_id, protocol, data, cb){
  var self = this;
  var done = false;
  var count = 0;
  var optional_keys = ['default_pool', 'default_pool_id', 'insert_headers', 'l7policies', 'description', 'protocol_port', 'default_tls_container_ref', 'sni_container_refs', 'admin_state_up', 'name', 'connection_limit'];
  var post_data = {listener: {}};
  var key = '';
  var n = 0;
  var request_options = {};

  //we have 2 required params
  post_data.listener.loadbalancer_id = loadbalancer_id;
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

  //async to allow for retry logic
  Async.until(
    function(){return done},
    function(cb){
      count++;
      Request.post(request_options, function(error, response, body){
        if(error && error.detail.remoteStatusCode == 409 && count <= self.retries)
        {
          //wait a second then call back to trigger another try and ignore this error
          setTimeout(cb, self.retry_delay);
          return;
        }
        //else one way or another we are done
        done = true;
        
        //now handle error and success
        if(error)
        {
          cb(error);
          return;
        }
        //else success!
        
        cb(null, body.listener);
      });
    },
    function(error, result){
      cb(error, result);
    }
  );
};



//calls back with (error, listener) after updating the listener
Octavia.prototype.updateLBListener = function(listener_id, data, cb){
  var self = this;
  var done = false;
  var count = 0;
  var optional_keys = ['default_pool_id', 'insert_headers', 'name', 'description', 'admin_state_up', 'connection_limit', 'default_tls_container_ref', 'sni_container_refs'];
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

  //async to allow for retry logic
  Async.until(
    function(){return done},
    function(cb){
      count++;
      Request.put(request_options, function(error, response, body){
        if(error && error.detail.remoteStatusCode == 409 && count <= self.retries)
        {
          //wait a second then call back to trigger another try and ignore this error
          setTimeout(cb, self.retry_delay);
          return;
        }
        //else one way or another we are done
        done = true;
        
        //now handle error and success
        if(error)
        {
          cb(error);
          return;
        }
        //else success!
        
        cb(null, body.listener);
      });
    },
    function(error, result){
      cb(error, result);
    }
  );
};


//calls back with (error) after attempting to remove the given resource
Octavia.prototype.removeLBListener = function(listener_id, cb){
  var self = this;
  var count = 0; 
  var done = false;
  var request_options = this.getRequestOptions('/lbaas/listeners/' + listener_id, true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.listeners.remove';
  request_options.validateStatus = true;

  //async to allow for retry logic
  Async.until(
    function(){return done},
    function(cb){
      count++;
      Request.del(request_options, function(error, response, body){
        if(error && error.detail.remoteStatusCode == 409 && count <= self.retries)
        {
          //wait a second then call back to trigger another try and ignore this error
          setTimeout(cb, self.retry_delay);
          return;
        }
        //else we are done one way or another
        
        done = true;
        cb(error);
      });
    },
    function(error){
      cb(error);
    }
  );
};



// -------------------------------------------------- //
// -------------------- LBPools --------------------- //
// -------------------------------------------------- //

Octavia.prototype.listLBPools = function(cb){
  var request_options = this.getRequestOptions('/lbaas/pools', true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.pools.list';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'pools';
  
  Request.get(request_options, function(error, response, body){
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
        pool_array[n] = body.pools[n];
      }
    }
    
    cb(null, pool_array);
  });
};



Octavia.prototype.getLBPool = function(pool_id, cb){
  var request_options = this.getRequestOptions('/lbaas/pools/' + pool_id, true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.pools.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'pool';

  Request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else

    cb(null, body.pool);
  });
};



// Calls back cb(error, rule) with a newly created resource from the given params
Octavia.prototype.createLBPool = function(protocol, lb_algorithm, data, cb){
  var self = this;
  var count = 0; 
  var done = false;
  var optional_keys = ['loadbalancer_id', 'listener_id', 'admin_state_up', 'name', 'description', 'session_persistence'];
  var post_data = {pool: {}};
  var key = '';
  var n = 0;
  var request_options = {};

  //add the required params
  post_data.pool.protocol = protocol;
  post_data.pool.lb_algorithm = lb_algorithm;

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

  //async to allow for retry logic
  Async.until(
    function(){return done},
    function(cb){
      count++;
      Request.post(request_options, function(error, response, body){
        if(error && error.detail.remoteStatusCode == 409 && count <= self.retries)
        {
          //wait a second then call back to trigger another try and ignore this error
          setTimeout(cb, self.retry_delay);
          return;
        }
        //else one way or another we are done
        done = true;
        
        //now handle error and success
        if(error)
        {
          cb(error);
          return;
        }
        //else success!
        
        cb(null, body.pool);
      });
    },
    function(error, result){
      cb(error, result);
    }
  );
};


Octavia.prototype.updateLBPool = function(pool_id, data, cb){
  var self = this;
  var count = 0; 
  var done = false;
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

  //async to allow for retry logic
  Async.until(
    function(){return done},
    function(cb){
      count++;
      Request.put(request_options, function(error, response, body){
        if(error && error.detail.remoteStatusCode == 409 && count <= self.retries)
        {
          //wait a second then call back to trigger another try and ignore this error
          setTimeout(cb, self.retry_delay);
          return;
        }
        //else one way or another we are done
        done = true;
        
        //now handle error and success
        if(error)
        {
          cb(error);
          return;
        }
        //else success!
        
        cb(null, body.pool);
      });
    },
    function(error, result){
      cb(error, result);
    }
  );
};



//calls back with (error) after attempting to remove the given resource
Octavia.prototype.removeLBPool = function(pool_id, cb){
  var self = this;
  var count = 0; 
  var done = false;
  var request_options = this.getRequestOptions('/lbaas/pools/' + pool_id, true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.pools.remove';
  request_options.validateStatus = true;

  //async to allow for retry logic
  Async.until(
    function(){return done},
    function(cb){
      count++;
      Request.del(request_options, function(error, response, body){
        if(error && error.detail.remoteStatusCode == 409 && count <= self.retries)
        {
          //wait a second then call back to trigger another try and ignore this error
          setTimeout(cb, self.retry_delay);
          return;
        }
        //else we are done one way or another
        
        done = true;
        cb(error);
      });
    },
    function(error){
      cb(error);
    }
  );
};


// -------------------------------------------------- //
// -------------------- LBPoolMembers --------------------- //
// -------------------------------------------------- //

Octavia.prototype.listLBPoolMembers = function(pool_id, cb){
  var member_array = [];
  var n = 0;
  var request_options = this.getRequestOptions('/lbaas/pools/' + pool_id + '/members', true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.pools.members.list';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'members';

  Request.get(request_options, function(error, response, body){
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
        member_array[n] = body.members[n];
      }
    }

    cb(null, member_array);
  });
};



Octavia.prototype.getLBPoolMember = function(pool_id, member_id, cb){
  var request_options = this.getRequestOptions('/lbaas/pools/' + pool_id + '/members/' + member_id, true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.pools.members.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'member';

  Request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, body.member);
  });
};



//Creates a member on a given pool
//calls back with cb(error, member_obj)
Octavia.prototype.createLBPoolMember = function(pool_id, address, protocol_port, data, cb){
  var self = this;
  var count = 0; 
  var done = false;
  var optional_keys = ['name', 'monitor_port', 'monitor_address', 'admin_state_up', 'weight', 'subnet_id'];
  var post_data = {member: {}};
  var key = '';
  var n = 0;
  var request_options = {};

  //handle the required params
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

  //async to allow for retry logic
  Async.until(
    function(){return done},
    function(cb){
      count++;
      Request.post(request_options, function(error, response, body){
        if(error && error.detail.remoteStatusCode == 409 && count <= self.retries)
        {
          //wait a second then call back to trigger another try and ignore this error
          setTimeout(cb, self.retry_delay);
          return;
        }
        //else one way or another we are done
        done = true;
        
        //now handle error and success
        if(error)
        {
          cb(error);
          return;
        }
        //else success!
        
        cb(null, body.member);
      });
    },
    function(error, result){
      cb(error, result);
    }
  );
};


Octavia.prototype.updateLBPoolMember = function(pool_id, member_id, data, cb){
  var self = this;
  var count = 0; 
  var done = false;
  var optional_keys = ['name', 'monitor_port', 'monitor_address', 'weight', 'admin_state_up'];
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

  //async to allow for retry logic
  Async.until(
    function(){return done},
    function(cb){
      count++;
      Request.put(request_options, function(error, response, body){
        if(error && error.detail.remoteStatusCode == 409 && count <= self.retries)
        {
          //wait a second then call back to trigger another try and ignore this error
          setTimeout(cb, self.retry_delay);
          return;
        }
        //else one way or another we are done
        done = true;
        
        //now handle error and success
        if(error)
        {
          cb(error);
          return;
        }
        //else success!
        
        cb(null, body.member);
      });
    },
    function(error, result){
      cb(error, result);
    }
  );
};


//calls back with (error) after attempting to remove the given resource
Octavia.prototype.removeLBPoolMember = function(pool_id, member_id, cb){
  var self = this;
  var count = 0; 
  var done = false;
  var request_options = this.getRequestOptions('/lbaas/pools/' + pool_id +'/members/' + member_id, true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.pools.members.remove';
  request_options.validateStatus = true;
  request_options.debug = true;
  
  //async to allow for retry logic
  Async.until(
    function(){return done},
    function(cb){
      count++;
      Request.del(request_options, function(error, response, body){
        if(error && error.detail.remoteStatusCode == 409 && count <= self.retries)
        {
          //wait a second then call back to trigger another try and ignore this error
          setTimeout(cb, self.retry_delay);
          return;
        }
        //else we are done one way or another
        
        done = true;
        cb(error);
      });
    },
    function(error){
      cb(error);
    }
  );
};


// -------------------------------------------------- //
// ----------------- Health Monitors ---------------- //
// -------------------------------------------------- //


Octavia.prototype.listLBHealthMonitors = function(cb){
  var request_options = this.getRequestOptions('/lbaas/healthmonitors', true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.healthmonitors.list';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'healthmonitors';

  Request.get(request_options, function(error, response, body){
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
        healthmonitor_array[n] = body.healthmonitors[n];
      }
    }
    
    cb(null, healthmonitor_array);
  });
};


Octavia.prototype.getLBHealthMonitor = function(health_monitor_id, cb){
  var request_options = this.getRequestOptions('/lbaas/healthmonitors/' + health_monitor_id, true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.healthmonitors.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'healthmonitor';

  Request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, body.healthmonitor);
  });
};



//Creates a healthcheck for a given pool
//calls back with cb(error, health_monitor_obj)
Octavia.prototype.createLBHealthMonitor = function(pool_id, type, delay, timeout, max_retries, data, cb){
  var self = this;
  var count = 0; 
  var done = false;
  var optional_keys = ['name', 'max_retries_down', 'http_method', 'url_path', 'expected_codes', 'admin_state_up'];
  var post_data = {healthmonitor: {}};
  var key = '';
  var n = 0;
  var request_options = {};

  //handle the required params
  post_data.healthmonitor.pool_id = pool_id;
  post_data.healthmonitor.type = type;
  post_data.healthmonitor.delay = delay;
  post_data.healthmonitor.timeout = timeout;
  post_data.healthmonitor.max_retries = max_retries;
  

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

  //async to allow for retry logic
  Async.until(
    function(){return done},
    function(cb){
      count++;
      Request.post(request_options, function(error, response, body){
        if(error && error.detail.remoteStatusCode == 409 && count <= self.retries)
        {
          //wait a second then call back to trigger another try and ignore this error
          setTimeout(cb, self.retry_delay);
          return;
        }
        //else one way or another we are done
        done = true;
        
        //now handle error and success
        if(error)
        {
          cb(error);
          return;
        }
        //else success!
        
        cb(null, body.healthmonitor);
      });
    },
    function(error, result){
      cb(error, result);
    }
  );
};



Octavia.prototype.updateLBHealthMonitor = function(health_monitor_id, data, cb){
  var self = this;
  var count = 0; 
  var done = false;
  var optional_keys = ['delay', 'timeout', 'max_retries', 'max_retries_down', 'http_method', 'url_path', 'expected_codes', 'admin_state_up'];
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
  
  
  //async to allow for retry logic
  Async.until(
    function(){return done},
    function(cb){
      count++;
      Request.put(request_options, function(error, response, body){
        if(error && error.detail.remoteStatusCode == 409 && count <= self.retries)
        {
          //wait a second then call back to trigger another try and ignore this error
          setTimeout(cb, self.retry_delay);
          return;
        }
        //else one way or another we are done
        done = true;
        
        //now handle error and success
        if(error)
        {
          cb(error);
          return;
        }
        //else success!
        
        cb(null, body.healthmonitor);
      });
    },
    function(error, result){
      cb(error, result);
    }
  );
};



//calls back with (error) after attempting to remove the given resource
Octavia.prototype.removeLBHealthMonitor = function(health_monitor_id, cb){
  var self = this;
  var count = 0; 
  var done = false;
  var request_options = this.getRequestOptions('/lbaas/healthmonitors/' + health_monitor_id, true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.healthmonitors.remove';
  request_options.validateStatus = true;
  
  //async to allow for retry logic
  Async.until(
    function(){return done},
    function(cb){
      count++;
      Request.del(request_options, function(error, response, body){
        if(error && error.detail.remoteStatusCode == 409 && count <= self.retries)
        {
          //wait a second then call back to trigger another try and ignore this error
          setTimeout(cb, self.retry_delay);
          return;
        }
        //else we are done one way or another
        
        done = true;
        cb(error);
      });
    },
    function(error){
      cb(error);
    }
  );
};



// -------------------------------------------------- //
// ---------------------- Stats --------------------- //
// -------------------------------------------------- //
//NOTE: This is just here for experimentation - not really supporting/supported yet
//Leaving it here though as it may be of use to those who do have it available
Octavia.prototype.getLBStats = function(lb_id, cb){
  var request_options = this.getRequestOptions('/lbaas/loadbalancers/' + lb_id + '/stats', true);
  request_options.metricPath = 'remote-calls.octavia.lbaas.loadbalancers.stats.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'stats';

  Request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, body.stats);
  });
};

module.exports = Octavia;
