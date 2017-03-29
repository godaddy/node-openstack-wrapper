var OSUtils = require('./os-utils');
var Request = require('./os-request');


//constructor - should be the only export
function Neutron(endpoint_url, auth_token)
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
Neutron.prototype.setTimeout = function(new_timeout)
{
  this.timeout = new_timeout;
};

Neutron.prototype.setRequestID = function(request_id)
{
  this.request_id = request_id;
};

Neutron.prototype.setUserName = function(user_name)
{
  this.user_name = user_name;
};

Neutron.prototype.setLogger = function(logger)
{
  this.logger = logger;
};

//this should only be used for dependency injection
Neutron.prototype.setRequest = function(request_lib)
{
  this.request = request_lib;
}


//lets us mangle/sanitize/make sane the various responses from openstack
//any replacement must simply support a static mangleObject that supports the following types [ie mangleObject(type, object)]
//SecurityGroup, SecurityRule, etc..
Neutron.prototype.setMangler = function(mangle_lib)
{
  this.mangler = mangle_lib;
  this.mangleObject = this.mangler.mangleObject;
}



//returns an formatted options object - just makes the code below a little less repetitious
//path should begin with a "/"
//json_value should be almost certainly be true if you don't have an actual object you want to send over
Neutron.prototype.getRequestOptions = function(path, json_value)
{
  //start w/the instance timeout
  var request_timeout = this.timeout;
  if(!request_timeout)
  {
    //override with the static value if no instance value was given
    request_timeout = Neutron.timeout;
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



//gets a list of all networks for the given project/tenant
//calls back with cb(error, network_array)
Neutron.prototype.listNetworks = function(cb){
  var self = this;
  var network_array = [];
  var n = 0;
  var request_options = this.getRequestOptions('/networks', true);
  request_options.metricPath = 'remote-calls.neutron.networks.list';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'networks';
  //request_options.debug = true;
  
  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else

    //can't tell at this point if an empty result would come back with a blank array or just no ports at all so...
    if(body.networks && body.networks.length)
    {
      for(n = 0; n < body.networks.length; n++)
      {
        network_array[n] = self.mangleObject('Network', body.networks[n]);
      }
    }
    else
    {
      //leave an empty array as the result and log an issue.... that might not be an issue... or might be...
      console.error('No networks found for this project - returning blank array');
    }

    cb(null, network_array);
  });
};



//gets a network by id (within the current project/tenant)
//calls back with cb(error, network_obj)
Neutron.prototype.getNetwork = function(network_id, cb){
  var self = this;
  var request_options = this.getRequestOptions('/networks/' + network_id, true);
  request_options.metricPath = 'remote-calls.neutron.networks.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'network';
  
  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else

    cb(null, self.mangleObject('Network', body.network));
  });
};




//gets a list of all networks for the given project/tenant
//calls back with cb(error, network_array)
Neutron.prototype.listSubnets = function(cb){
  var self = this;
  var subnet_array = [];
  var n = 0;
  var request_options = this.getRequestOptions('/subnets', true);
  request_options.metricPath = 'remote-calls.neutron.subnets.list';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'subnets';
  
  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //error
    
    //can't tell at this point if an empty result would come back with a blank array or just no ports at all so...
    if(body.subnets && body.subnets.length)
    {
      for(n = 0; n < body.subnets.length; n++)
      {
        subnet_array[n] = self.mangleObject('Subnet', body.subnets[n]);
      }
    }
    else
    {
      //leave an empty array as the result and log an issue.... that might not be an issue... or might be...
      console.error('No subnets found for this project - returning blank array');
    }

    cb(null, subnet_array);
  });
};



//gets a subnet by id (within the current project/tenant)
//calls back with cb(error, subnet_obj)
Neutron.prototype.getSubnet = function(subnet_id, cb){
  var self = this;
  var request_options = this.getRequestOptions('/subnets/' + subnet_id, true);
  request_options.metricPath = 'remote-calls.neutron.subnets.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'subnet';
  
  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else

    cb(null, self.mangleObject('Subnet', body.subnet));
  });
};


//gets a list of all routers for the given project/tenant
//calls back with cb(error, router_array)
Neutron.prototype.listRouters = function(cb){
  var self = this;
  var router_array = [];
  var n = 0;
  var request_options = this.getRequestOptions('/routers', true);
  request_options.metricPath = 'remote-calls.neutron.routers.list';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'routers';

  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    //can't tell at this point if an empty result would come back with a blank array or just no ports at all so...
    if(body.routers && body.routers.length)
    {
      for(n = 0; n < body.routers.length; n++)
      {
        router_array[n] = self.mangleObject('Router', body.routers[n]);
      }
    }
    else
    {
      //leave an empty array as the result and log an issue.... that might not be an issue... or might be...
      console.error('No routers found for this project - returning blank array');
    }

    cb(null, router_array);
  });
};



//gets a specific router by id
//calls back with cb(error, router_obj)
Neutron.prototype.getRouter = function(router_id, cb){
  var self = this;
  var request_options = this.getRequestOptions('/routers/' + router_id, true);
  request_options.metricPath = 'remote-calls.neutron.routers.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'router';
  
  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else

    cb(null, self.mangleObject('Router', body.router));
  });
};



//------------------------FLOATING IPS------------------------------
//Creates(allocates) a new floating ip from a given ip pool(floating_network_id)
//calls back with cb(error, obj)
Neutron.prototype.createFloatingIp = function(floating_network_id, cb){
  var self = this;
  var request_options = {};

  request_options = this.getRequestOptions('/floatingips', {floatingip: {'floating_network_id': floating_network_id}});
  request_options.metricPath = 'remote-calls.neutron.floating-ips.create';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'floatingip';
  
  this.request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }

    cb(null, self.mangleObject("NeutronFloatingIp", body.floatingip));
  });
};



//gets a list of all floating ip's for the given project/tenant
//calls back with cb(error, ip_array)
//takes optional object that contains any filters to apply to request
// i.e.
//{
//  filters: 
//  {
//    'device_id': 'abcdef123567'
//  }
//}
Neutron.prototype.listFloatingIps = function(options, cb){
  var self = this;
  var ip_array = [];
  var n = 0;
  var request_options = this.getRequestOptions('/floatingips', true);
  // get the actual args passed in as this function can be overloaded
  var args = OSUtils.getArgsWithCallback(this.listFloatingIps.length, arguments);
  options = args[0] || {};
  cb = args[1];
  request_options.metricPath = 'remote-calls.neutron.floating-ips.list';
  request_options.qs = options.filters;
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'floatingips';

  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }

    //can't tell at this point if an empty result would come back with a blank array or just no ports at all so...
    if(body.floatingips && body.floatingips.length)
    {
      for(n = 0; n < body.floatingips.length; n++)
      {
        ip_array[n] = self.mangleObject('NeutronFloatingIp', body.floatingips[n]);
      }
    }
    else
    {
      //leave an empty array as the result and log an issue.... that might not be an issue... or might be...
      console.error('No floating ips found for given project - returning blank array');
    }

    //NOTE: for some reason there is no pagination or self url for floating ips - I guess they don't expect that many of em
    cb(null, ip_array);
  });
};



//gets a specific floating ip by id
//calls back with cb(error, ip_obj)
Neutron.prototype.getFloatingIp = function(ip_id, cb){
  var self = this;
  var request_options = this.getRequestOptions('/floatingips/' + ip_id, true);
  request_options.metricPath = 'remote-calls.neutron.floating-ips.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'floatingip';

  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else

    cb(null, self.mangleObject('NeutronFloatingIp', body.floatingip));
  });
};



//updates the port_id on a floating ip (its the only thing we can update)
//calls back with cb(error, ip_obj)
Neutron.prototype.updateFloatingIp = function(ip_id, port_id, cb){
  var self = this;
  var request_options = {};

  //and now we can get the full request options object add the log path and make the request
  request_options = this.getRequestOptions('/floatingips/' + ip_id, {'floatingip': {'port_id': port_id}});
  request_options.metricPath = 'remote-calls.neutron.floating-ips.update';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'floatingip';

  this.request.put(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, self.mangleObject('NeutronFloatingIp', body.floatingip));
  });
};



//removes a floating ip by id
//calls back with cb(error)
Neutron.prototype.removeFloatingIp = function(ip_id, cb){
  var self = this;
  var request_options = {};

  //and now we can get the full request options object add the log path and make the request
  request_options = this.getRequestOptions('/floatingips/' + ip_id);
  request_options.metricPath = 'remote-calls.neutron.floating-ips.remove';
  request_options.validateStatus = true;

  this.request.del(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null);
  });
};



//calls back with (error, ports) for the tenant/project of the current token
//takes optional object that contains any filters to apply to request
// i.e.
//{
//  filters: 
//  {
//    'device_id': 'abcdef123567'
//  }
//}
Neutron.prototype.listPorts = function(options, cb){
  var self = this;
  var ports_array = [];
  var request_options = self.getRequestOptions('/ports', true);
  // get the actual args passed in as this function can be overloaded
  var args = OSUtils.getArgsWithCallback(this.listPorts.length, arguments);
  options = args[0] || {};
  cb = args[1];

  request_options.qs = options.filters;
  request_options.metricPath = 'remote-calls.neutron.ports.list';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'ports';
   
  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    //can't tell at this point if an empty result would come back with a blank array or just no ports at all so...
    if(body.ports && body.ports.length)
    {
      body.ports.forEach(function(port){
        ports_array.push(self.mangleObject('Port', port));
      });
    }
    else
    {
      //leave an empty array as the result and log an issue.... that might not be an issue... or might be...
      console.error('No Ports group found for given project - returning blank array');
    }

    //NOTE: for some reason there is no pagination or self url for ports - I guess they don't expect that many of em
    cb(null, ports_array);
  });
};




//gets the port with the specified id
Neutron.prototype.getPort = function(port_id, cb){
  var self = this;
  var request_options = this.getRequestOptions('/ports/' + port_id, true);
  request_options.metricPath = 'remote-calls.neutron.ports.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'port';

  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }

    cb(null, self.mangleObject("Port", body.port));
  });
};




//updates the data on a specified port then calls back with (error, port)
//NOTE: the network_id is not optional according to the docs but I think it is...
Neutron.prototype.updatePort = function(port_id, data, cb){
  var self = this;
  var optional_keys = ['status', 'name', 'admin_state_up', 'tenant_id', 'mac_address', 'fixed_ips', 'security_groups', 'network_id', "allowed_address_pairs"];
  var put_data = {port: {}};
  var key = '';
  var n = 0;
  var request_options = {};

  //we may have 1 required param
  //put_data.port.network_id = network_id;

  //now loop through all the optional ones
  for(n = 0; n < optional_keys.length; n++)
  {
    key = optional_keys[n];
    if(typeof data[key] != 'undefined')
    {
      put_data.port[key] = data[key];
    }
  }

  //and now we can get the full request options object add the log path and make the request
  request_options = this.getRequestOptions('/ports/' + port_id, put_data);
  request_options.metricPath = 'remote-calls.neutron.ports.update';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'port';
  
  this.request.put(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else

    cb(null, self.mangleObject('Port', body.port));
  });
};



//calls back with (error, security_groups) for the given tenant/project
//NOTE: the ?tenant_id= thing is undocumented
//it forces us to get back permissions only to the given project (as opposed ot the whole company)
Neutron.prototype.listSecurityGroups = function(project_id, cb){
  var self = this;
  var request_options = this.getRequestOptions('/security-groups' + '?tenant_id=' + escape(project_id), true);
  request_options.metricPath = 'remote-calls.neutron.security-groups.list';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'security_groups';

  this.request.get(request_options, function(error, response, body){
    var groups_array = [];
    var n = 0;

    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    //can't tell at this point if an empty result would come back with a blank array or just no security_groups value at all so...
    if(body.security_groups.length)
    {
      for(n = 0; n < body.security_groups.length; n++)
      {
        groups_array[n] = self.mangleObject('SecurityGroup', body.security_groups[n]);
      }
    }
    else
    {
      //leave an empty array as the result and log an issue.... that might not be an issue... or might be...
      console.error('No Security group found for given project - returning blank array');
    }

    //NOTE: for some reason there is no pagination or self url for security groups - I guess they don't expect that many of em
    cb(null, groups_array);
  });
};



Neutron.prototype.getSecurityGroup = function(group_id, cb){
  var self = this;
  var request_options = this.getRequestOptions('/security-groups/' + group_id, true);
  request_options.metricPath = 'remote-calls.neutron.security-groups.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'security_group';

  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, self.mangleObject("SecurityGroup", body.security_group));
  });
};



//Creates a new security group and calls back with cb(error, result)
//NOTE: specifying tenant_id is an undocumented feature that allows you to set it to a different tenant than the token
//we use this for creating groups via a service acct
Neutron.prototype.createSecurityGroup = function(group_name, data, cb){
  var self = this;
  var optional_keys = ['description', 'tenant_id'];
  var post_data = {security_group: {name: group_name}};
  var key = '';
  var n = 0;
  var request_options = {};

  //loop through all the optional data keys and add them to the post data
  for(n = 0; n < optional_keys.length; n++)
  {
    key = optional_keys[n];
    if(typeof data[key] != 'undefined')
    {
      post_data.security_group[key] = data[key];
    }
  }

  request_options = this.getRequestOptions('/security-groups', post_data);
  request_options.metricPath = 'remote-calls.neutron.security-groups.create';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'security_group';

  this.request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, self.mangleObject("SecurityGroup", body.security_group));
  });
};



//calls back with (error, security_group) after updating the name and or description of a security group
Neutron.prototype.updateSecurityGroup = function(group_id, data, cb){
  var self = this;
  var optional_keys = ['name', 'description'];
  var put_data = {security_group: {}};
  var key = '';
  var n = 0;
  var request_options = {};

  //loop through all the optional data keys and add them to the post data
  for(n = 0; n < optional_keys.length; n++)
  {
    key = optional_keys[n];
    if(typeof data[key] != 'undefined')
    {
      put_data.security_group[key] = data[key];
    }
  }

  request_options = this.getRequestOptions('/security-groups/' + group_id, put_data);
  request_options.metricPath = 'remote-calls.neutron.security-groups.update';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'security_group';

  this.request.put(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }

    cb(null, self.mangleObject('SecurityGroup', body.security_group));
  });
};



//calls back with (error) after attempting to remove the given security group
Neutron.prototype.removeSecurityGroup = function(group_id, cb){
  var self = this;
  var request_options = this.getRequestOptions('/security-groups/' + group_id, true);
  request_options.metricPath = 'remote-calls.neutron.security-groups.remove';
  request_options.validateStatus = true;
  
  this.request.del(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else return noosing!

    cb();
  });
};




//Calls back cb(error, security_rules) with a list of security rules for this tenant (which seems kida weird)
Neutron.prototype.listSecurityGroupRules = function(cb){
  var self = this;
  var rules_array = [];
  var n = 0;
  var request_options = this.getRequestOptions('/security-group-rules', true);
  request_options.metricPath = 'remote-calls.neutron.security-group-rules.list';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'security_group_rules';
  
  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    //not sure at this point if a blank rule set comes back as an empty array or what so....
    if(body.security_group_rules.length)
    {
      for(n = 0; n < body.security_group_rules.length; n++)
      {
        rules_array[n] = self.mangleObject('SecurityGroupRule', body.security_group_rules[n]);
      }
    }
    
    cb(null, rules_array);
  });
};



Neutron.prototype.getSecurityGroupRule = function(rule_id, cb){
  var self = this;
  var request_options = this.getRequestOptions('/security-group-rules/' + rule_id, true);
  request_options.metricPath = 'remote-calls.neutron.security-group-rules.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'security_group_rule';

  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, self.mangleObject('SecurityGroupRule', body.security_group_rule));
  });
};



//Calls back cb(error, rule) with a newly created rule from the given group, data
//note: the docs say the direction is optional but lets imagine its not...
//also we need a freakin un-mangler!
Neutron.prototype.createSecurityGroupRule = function(group_id, data, cb){
  var self = this;
  var optional_keys = ['tenant_id', 'ethertype', 'protocol', 'port_range_min', 'port_range_max', 'remote_ip_prefix', 'remote_group_id'];
  var post_data = {security_group_rule: {}};
  var key = '';
  var n = 0;
  var request_options = {};

  //we have 2 required params
  post_data.security_group_rule.security_group_id = group_id;
  post_data.security_group_rule.direction = data.direction;

  //now loop through all the optional ones
  for(n = 0; n < optional_keys.length; n++)
  {
    key = optional_keys[n];
    if(typeof data[key] != 'undefined')
    {
      post_data.security_group_rule[key] = data[key];
    }
  }

  //and now we can get the full request options object add the log path and make the request
  request_options = this.getRequestOptions('/security-group-rules', post_data);
  request_options.metricPath = 'remote-calls.neutron.security-group-rules.create';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'security_group_rule';

  this.request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    
    cb(null, self.mangleObject('SecurityGroupRule', body.security_group_rule));
  });
};



//calls back with (error) after removing the given security group rule
Neutron.prototype.removeSecurityGroupRule = function(rule_id, cb)
{
  var request_options = this.getRequestOptions('/security-group-rules/' + rule_id, true);
  request_options.metricPath = 'remote-calls.neutron.security-group-rules.remove';
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
// ----------------- Load Balancers ----------------- //
// -------------------------------------------------- //

Neutron.prototype.listLoadBalancers = function(cb){
  var self = this;
  var request_options = this.getRequestOptions('/lbaas/loadbalancers', true);
  request_options.metricPath = 'remote-calls.neutron.lbaas.loadbalancers.list';
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


Neutron.prototype.getLoadBalancer = function(lb_id, cb){
  var self = this;
  var request_options = this.getRequestOptions('/lbaas/loadbalancers/' + lb_id, true);
  request_options.metricPath = 'remote-calls.neutron.lbaas.loadbalancers.get';
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
Neutron.prototype.createLoadBalancer = function(tenant_id, vip_subnet_id, data, cb){
  var self = this;
  var optional_keys = ['name', 'description', 'vip_address', 'admin_state_up', 'flavor', 'provider'];
  var post_data = {loadbalancer: {}};
  var key = '';
  var n = 0;
  var request_options = {};

  //we have 2 required params
  post_data.loadbalancer.vip_subnet_id = vip_subnet_id;
  post_data.loadbalancer.tenant_id = tenant_id;

  //now loop through all the optional ones
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
  request_options.metricPath = 'remote-calls.neutron.lbaas.loadbalancers.create';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'loadbalancer';

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
Neutron.prototype.updateLoadBalancer = function(lb_id, data, cb){
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
  request_options.metricPath = 'remote-calls.neutron.lbaas.loadbalancers.update';
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
Neutron.prototype.removeLoadBalancer = function(lb_id, cb){
  var request_options = this.getRequestOptions('/lbaas/loadbalancers/' + lb_id, true);
  request_options.metricPath = 'remote-calls.neutron.lbaas.loadbalancers.remove';
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

Neutron.prototype.listLBListeners = function(cb){
  var self = this;
  var request_options = this.getRequestOptions('/lbaas/listeners', true);
  request_options.metricPath = 'remote-calls.neutron.lbaas.listeners.list';
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


Neutron.prototype.getLBListener = function(listener_id, cb){
  var self = this;
  var request_options = this.getRequestOptions('/lbaas/listeners/' + listener_id, true);
  request_options.metricPath = 'remote-calls.neutron.lbaas.listeners.get';
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
Neutron.prototype.createLBListener = function(tenant_id, loadbalancer_id, description, protocol, data, cb){
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
  request_options.metricPath = 'remote-calls.neutron.lbaas.listeners.create';
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
Neutron.prototype.updateLBListener = function(listener_id, data, cb){
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
  request_options.metricPath = 'remote-calls.neutron.lbaas.listeners.update';
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
Neutron.prototype.removeLBListener = function(listener_id, cb){
  var request_options = this.getRequestOptions('/lbaas/listeners/' + listener_id, true);
  request_options.metricPath = 'remote-calls.neutron.lbaas.listeners.remove';
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

Neutron.prototype.listLBPools = function(cb){
  var self = this;
  var request_options = this.getRequestOptions('/lbaas/pools', true);
  request_options.metricPath = 'remote-calls.neutron.lbaas.pools.list';
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


Neutron.prototype.getLBPool = function(pool_id, cb){
  var self = this;
  var request_options = this.getRequestOptions('/lbaas/pools/' + pool_id, true);
  request_options.metricPath = 'remote-calls.neutron.lbaas.pools.get';
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
Neutron.prototype.createLBPool = function(tenant_id, protocol, lb_algorithm, listener_id, data, cb){
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
  request_options.metricPath = 'remote-calls.neutron.lbaas.pools.create';
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


Neutron.prototype.updateLBPool = function(pool_id, data, cb){
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
  request_options.metricPath = 'remote-calls.neutron.lbaas.pools.update';
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
Neutron.prototype.removeLBPool = function(pool_id, cb){
  var request_options = this.getRequestOptions('/lbaas/pools/' + pool_id, true);
  request_options.metricPath = 'remote-calls.neutron.lbaas.pools.remove';
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

Neutron.prototype.listLBPoolMembers = function(pool_id, cb){
  var self = this;
  var member_array = [];
  var n = 0;
  var request_options = this.getRequestOptions('/lbaas/pools/' + pool_id + '/members', true);
  request_options.metricPath = 'remote-calls.neutron.lbaas.pools.members.list';
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


Neutron.prototype.getLBPoolMember = function(pool_id, member_id, cb){
  var self = this;
  var request_options = this.getRequestOptions('/lbaas/pools/' + pool_id + '/members/' + member_id, true);
  request_options.metricPath = 'remote-calls.neutron.lbaas.pools.members.get';
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
Neutron.prototype.createLBPoolMember = function(pool_id, tenant_id, address, protocol_port, data, cb){
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
  request_options.metricPath = 'remote-calls.neutron.lbaas.pools.members.create';
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


Neutron.prototype.updateLBPoolMember = function(pool_id, member_id, data, cb){
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
  request_options.metricPath = 'remote-calls.neutron.lbaas.pools.members.update';
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
Neutron.prototype.removeLBPoolMember = function(pool_id, member_id, cb){
  var request_options = this.getRequestOptions('/lbaas/pools/' + pool_id +'/members/' + member_id, true);
  request_options.metricPath = 'remote-calls.neutron.lbaas.pools.members.remove';
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
// ----------------- LBHealthMonitors ----------------- //
// -------------------------------------------------- //


Neutron.prototype.listLBHealthMonitors = function(cb){
  var self = this;
  var request_options = this.getRequestOptions('/lbaas/healthmonitors', true);
  request_options.metricPath = 'remote-calls.neutron.lbaas.healthmonitors.list';
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


Neutron.prototype.getLBHealthMonitor = function(health_monitor_id, cb){
  var self = this;
  var request_options = this.getRequestOptions('/lbaas/healthmonitors/' + health_monitor_id, true);
  request_options.metricPath = 'remote-calls.neutron.lbaas.healthmonitors.get';
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
Neutron.prototype.createLBHealthMonitor = function(tenant_id, type, delay, timeout, max_retries, pool_id, data, cb){
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
  request_options.metricPath = 'remote-calls.neutron.lbaas.healthmonitors.create';
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


Neutron.prototype.updateLBHealthMonitor = function(health_monitor_id, data, cb){
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
  request_options.metricPath = 'remote-calls.neutron.lbaas.healthmonitors.update';
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
Neutron.prototype.removeLBHealthMonitor = function(health_monitor_id, cb){
  var request_options = this.getRequestOptions('/lbaas/healthmonitors/' + health_monitor_id, true);
  request_options.metricPath = 'remote-calls.neutron.lbaas.healthmonitors.remove';
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
Neutron.prototype.getLBStats = function(lb_id, cb){
  var self = this;
  var request_options = this.getRequestOptions('/lbaas/loadbalancers/' + lb_id + '/stats', true);
  request_options.metricPath = 'remote-calls.neutron.lbaas.loadbalancers.stats.get';
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

module.exports = Neutron;
