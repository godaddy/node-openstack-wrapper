var osutils = require('./os-utils');


//constructor - should be the only export
function Neutron(endpoint_url, auth_token, call_timeout)
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
  
  //default the timeout in case one isn't set
  if(typeof call_timeout == 'undefined')
  {
    this.timeout = 9000;
  }
  this.timeout = call_timeout;
}



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
  var return_object = {
    uri: this.url + path,
    headers:{'X-Auth-Token': this.token},
    json: json_value,
    timeout: this.timeout
  };

  return return_object;
};



Neutron.prototype.listSecurityGroups = function(tenant_id, cb){
  //NOTE: the ?tenant_id= thing is undocumented
  //it forces us to get back permissions only to the given project (as opposed ot the whole company)
  var request_options = this.getRequestOptions('/security-groups' + '?tenant_id=' + escape(tenant_id), true);
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
        groups_array[n] = this.mangleObject('SecurityGroup', body.security_groups[n]);
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
  var request_options = this.getRequestOptions('/security-groups/' + group_id, true);
  request_options.logPath = 'api-calls.neutron.security-group-get';

  this.request.get(request_options, function(error, response, body){
    if(osutils.isError(error, response) || !body.security_group)
    {
      cb(osutils.getError('Neutron.getSecurityGroup', error, response, body));
      return;
    }

    cb(null, this.mangleObject("SecurityGroup", body.security_group));
  });
};



//will be used in the future to create new security groups
Neutron.prototype.createSecurityGroup = function(group_name, group_description, cb){
  var post_data = {security_group: {name: group_name, description: group_description}};
  var request_options = this.getRequestOptions('/security-groups', post_data);
  request_options.logPath = 'api-calls.neutron.security-group-create';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isError(error, response) || !body.security_group)
    {
      cb(osutils.getError('Neutron.createSecurityGroup', error, response, body));
      return;
    }

    cb(null, this.mangleObject("SecurityGroup", body.security_group));
  });
};



//calls back with (error, security_group) after updating the name and or description of a security group
//NOTE:  shouldn't we be supporting more changes like port, direction, etc...??
Neutron.prototype.updateSecurityGroup = function(group_id, data, cb){
  var put_data = {security_group: {}};
  if(data.name !== undefined)
  {
    put_data.security_group.name = data.name;
  }
  if(data.description !== undefined)
  {
    put_data.security_group.description = data.description;
  }
  var request_options = this.getRequestOptions('/security-groups/' + group_id, put_data);
  request_options.logPath = 'api-calls.neutron.security-group-update';

  this.request.put(request_options, function(error, response, body){
    if(osutils.isError(error, response) || !body.security_group)
    {
      cb(osutils.getError('Neutron.updateSecurityGroup', error, response, body));
      return;
    }

    cb(null, this.mangleObject('SecurityGroup', body.security_group));
  });
};

  
  
//calls back with (error) after attempting to remove the given security group
Neutron.prototype.removeSecurityGroup = function(group_id, cb){
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
  var request_options = this.getRequestOptions('/security-group-rules', true);
  request_options.logPath = 'api-calls.neutron.security-group-rule-list';

  this.request.get(request_options, function(error, response, body){
    var rules_array = [];
    var n = 0;
    
    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Neutron.listSecurityGropRules', error, response, body));
      return;
    }
    
    //not sure at this point if a blank rule set comes back as an empty array or what so....
    if(body.security_group_rules && body.security_group_rules.length)
    {
      for(n = 0; n < body.security_group_rules.length; n++)
      {
        rules_array[n] = this.mangleObject('SecurityGroupRule', body.security_group_rules[n]);
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
  var request_options = this.getRequestOptions('/security-group-rules/' + rule_id, true);
  request_options.logPath = 'api-calls.neutron.security-group-rule-get';

  this.request.get(request_options, function(error, response, body){
    if(osutils.isError(error, response) || !body.security_group_rule)
    {
      cb(osutils.getError('Neutron.getSecurityGroupRule', error, response, body));
      return;
    }

    cb(null, this.mangleObject('SecurityGroupRule', body.security_group_rule));
  });
};



//Calls back cb(error, rule) with a newly created rule from the given group, data
//NOTE: the docs say that direction is not optional but was coded this way before so leaving it for now
Neutron.prototype.createSecurityGroupRule = function(group_id, data, cb){
  var post_data = {security_group: {}};
  post_data.security_group.security_group_id = group_id;
  if(data.direction !== undefined)
  {
    post_data.security_group.direction = data.direction;
  }
  if(data.ether_type !== undefined)
  {
    data.security_group.ethertype = data.ether_type;
  }
  if(data.ip_protocol !== undefined)
  {
    data.security_group.protocol = data.ip_protocol;
  }
  if(data.from_port !== undefined)
  {
    data.security_group.port_range_min = data.from_port;
  }
  if(data.to_port !== undefined)
  {
    data.security_group.port_range_max = data.to_port;
  }
  if(data.cidr !== undefined)
  {
    data.security_group.remote_ip_prefix = data.cidr;
  }
  if(data.group_id !== undefined)
  {
    data.security_group.remote_group_id = data.group_id;
  }
  var request_options = this.getRequestOptions('/security-group-rules', post_data);
  request_options.logPath = 'api-calls.neutron.security-group-rule-create';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isError(error, response) || !body.security_group_rule)
    {
      cb(osutils.getError('Neutron.createSecurityGroupRule', error, response, body));
      return;
    }

    cb(null, this.mangleObject('SecurityGroupRule', body.security_group_rule));
  });
};



//apparently we don't have code to update a rule at this time?



//calls back with (error) after removing the given security group rule
Neutron.prototype.removeSecurityGroupRule = function(rule_id, cb)
{
  var request_options = this.getRequestOptions('security-group-rules/' + rule_id, true);
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