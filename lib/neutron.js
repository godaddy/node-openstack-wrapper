var osutils = require('./os-utils');


//constructor - should be the only export
function Neutron(endpoint_url, auth_token)
{
  //we need to overwrite this for unit testing and it allows us to use a custom request object that includes graphite logging
  this.request = require('request');

  //this is an optional lib that we override to normalfy the openstack responses - leave as is for no munging
  this.mangler = require('./mangler');
  this.mangleObject = this.mangler.mangleObject;

  //endpoint_url should come from the keystone projectInfo call - also yank all the trailing slashes in case folks get clever
  this.url = endpoint_url.replace(/\/$/, "");

  //auth_token should be the scoped token from the projectInfo call
  this.token = auth_token;

  //default the timeout to false - this forces the static value to be used
  this.timeout = false;
}


//allows for simple global timeouts if desired
Neutron.timeout = 9000;


//allows for instance timeouts if desired (see getRequestOptions)
Neutron.prototype.setTimeout = function(request_timeout)
{
  this.timeout = request_timeout;
};



//lets us override the existing request lib for this instance (useful for a bunch of things)
Neutron.prototype.setRequest = function(request_lib)
{
  this.request = request_lib;
};



//lets us mangle/sanitize/make sane the various responses from openstack
//any replacement must simply support a static mangleObject that supports the following types [ie mangleObject(type, object)]
//SecurityGroup, SecurityRule
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
    timeout: request_timeout
  };

  return return_object;
};



//calls back with (error, ports) for the tenant/project of the current token
Neutron.prototype.listPorts = function(cb){
  var self = this;
  var ports_array = [];
  var n = 0;
  var request_options = this.getRequestOptions('/ports', true);
  request_options.logPath = 'api-calls.neutron.port-list';

  this.request.get(request_options, function(error, response, body){
    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Neutron.listPorts', error, response, body));
      return;
    }
    
    //can't tell at this point if an empty result would come back with a blank array or just no ports at all so...
    if(body.ports && body.ports.length)
    {
      for(n = 0; n < body.ports.length; n++)
      {
        ports_array[n] = self.mangleObject('Port', body.ports[n]);
      }
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



//updates the data on a specified port then calls back with (error, port)
//NOTE: the network_id is not optional according to the docs but I think it is...
Neutron.prototype.updatePort = function(port_id, data, cb){
  var self = this;
  var optional_keys = ['status', 'name', 'admin_state_up', 'tenant_id', 'mac_address', 'fixed_ips', 'security_groups', 'network_id'];
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
  request_options.logPath = 'api-calls.neutron.port-update';
  
  this.request.put(request_options, function(error, response, body){
    if(osutils.isError(error, response) || !body.port)
    {    
      cb(osutils.getError('Neutron.updatePort', error, response, body));
      return;
    }

    cb(null, self.mangleObject('Port', body.port));
  });
};



//calls back with (error, security_groups) for the given tenant/project
//NOTE: the ?tenant_id= thing is undocumented
//it forces us to get back permissions only to the given project (as opposed ot the whole company)
Neutron.prototype.listSecurityGroups = function(project_id, cb){
  var self = this;
  var request_options = this.getRequestOptions('/security-groups' + '?tenant_id=' + escape(project_id), true);
  request_options.logPath = 'api-calls.neutron.security-group-list';

  this.request.get(request_options, function(error, response, body){
    var groups_array = [];
    var n = 0;

    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Neutron.listSecurityGroups', error, response, body));
      return;
    }

    //can't tell at this point if an empty result would come back with a blank array or just no security_groups value at all so...
    if(body.security_groups && body.security_groups.length)
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
  request_options.logPath = 'api-calls.neutron.security-group-get';

  this.request.get(request_options, function(error, response, body){
    if(osutils.isError(error, response) || !body.security_group)
    {
      cb(osutils.getError('Neutron.getSecurityGroup', error, response, body));
      return;
    }

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
  request_options.logPath = 'api-calls.neutron.security-group-create';
  
  this.request.post(request_options, function(error, response, body){
    if(osutils.isError(error, response) || !body.security_group)
    {
      cb(osutils.getError('Neutron.createSecurityGroup', error, response, body));
      return;
    }

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
  request_options.logPath = 'api-calls.neutron.security-group-update';

  this.request.put(request_options, function(error, response, body){
    if(osutils.isError(error, response) || !body.security_group)
    {
      cb(osutils.getError('Neutron.updateSecurityGroup', error, response, body));
      return;
    }

    cb(null, self.mangleObject('SecurityGroup', body.security_group));
  });
};



//calls back with (error) after attempting to remove the given security group
Neutron.prototype.removeSecurityGroup = function(group_id, cb){
  var self = this;
  var request_options = this.getRequestOptions('/security-groups/' + group_id, true);
  request_options.logPath = 'api-calls.neutron.security-group-remove';

  this.request.del(request_options, function(error, response, body){
    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Neutron.removeSecurityGroup', error, response, body));
      return;
    }

    //pretty sure body is undefined here but we don't need it anyway so..
    cb();
  });
};




//Calls back cb(error, security_rules) with a list of security rules for this tenant (which seems kida weird)
Neutron.prototype.listSecurityGroupRules = function(cb){
  var self = this;
  var request_options = this.getRequestOptions('/security-group-rules', true);
  request_options.logPath = 'api-calls.neutron.security-group-rule-list';

  this.request.get(request_options, function(error, response, body){
    var rules_array = [];
    var n = 0;

    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Neutron.listSecurityGroupRules', error, response, body));
      return;
    }

    //not sure at this point if a blank rule set comes back as an empty array or what so....
    if(body.security_group_rules && body.security_group_rules.length)
    {
      for(n = 0; n < body.security_group_rules.length; n++)
      {
        rules_array[n] = self.mangleObject('SecurityGroupRule', body.security_group_rules[n]);
      }
    }
    else
    {
      //leave an empty array as the result but go ahead and log just in case this is unintended.. er somethin
      console.error('No Security Rules found for given project - returning blank array');
    }

    cb(null, rules_array);
  });
};



Neutron.prototype.getSecurityGroupRule = function(rule_id, cb){
  var self = this;
  var request_options = this.getRequestOptions('/security-group-rules/' + rule_id, true);
  request_options.logPath = 'api-calls.neutron.security-group-rule-get';

  this.request.get(request_options, function(error, response, body){
    if(osutils.isError(error, response) || !body.security_group_rule)
    {
      cb(osutils.getError('Neutron.getSecurityGroupRule', error, response, body));
      return;
    }

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
  request_options.logPath = 'api-calls.neutron.security-group-rule-create';
  
  this.request.post(request_options, function(error, response, body){
    if(osutils.isError(error, response) || !body.security_group_rule)
    {    
      cb(osutils.getError('Neutron.createSecurityGroupRule', error, response, body));
      return;
    }

    cb(null, self.mangleObject('SecurityGroupRule', body.security_group_rule));
  });
};



//calls back with (error) after removing the given security group rule
Neutron.prototype.removeSecurityGroupRule = function(rule_id, cb)
{
  var request_options = this.getRequestOptions('/security-group-rules/' + rule_id, true);
  request_options.logPath = 'api-calls.neutron.security-group-rule-remove';
  
  this.request.del(request_options, function(error, response, body){
    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Neutron.removeSecurityGroupRule', error, response, body));
      return;
    }

    //pretty sure body is undefined here but we don't need it anyway so..
    cb();
  });
};


module.exports = Neutron;
