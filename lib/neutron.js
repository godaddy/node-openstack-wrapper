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



//will be used in the future to update the specified user group
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

  
  
//will be used in the future to remove the specified user group
Neutron.prototype.removeSecurityGroup = function(group_id, cb){
  var request_options = this.getRequestOptions('/security-groups/' + group_id, true);
  request_options.logPath = 'api-calls.neutron.security-group-remove';

  this.request.del(request_options, function(error, response, body){
    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Neutron.removeSecurityGroup', error, response, body));
      return;
    }

    //I don't think we really care about the result in this case  - just that we arent sending back an error
    cb(null, this.mangleObject('SecurityGroup', body));
  });
};




//this whole group should be used sometime in the near future so no removing!
Neutron.prototype.listSecurityRules = function(cb){
  var request_options = this.getRequestOptions('/security-group-rules', true);
  request_options.logPath = 'api-calls.neutron.security-rule-list';

  this.request.get(request_options, function(error, response, body){
    var rules_array = [];
    var n = 0;
    
    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Neutron.listSecurityRule', error, response, body));
      return;
    }
    
    if(body.security_group_rules && body.security_group_rules.length)
    {
      for(n = 0; n < body.security_group_rules.length; n++)
      {
        rules_array[n] = this.mangleObject('SecurityRule', body.security_group_rules[n]);
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



Neutron.prototype.getSecurityRule = function(rule_id, cb){
  var request_options = this.getRequestOptions('/security-group-rules/' + rule_id, true);
  request_options.logPath = 'api-calls.neutron.security-rule-get';

  this.request.get(request_options, function(error, response, body){
    if(osutils.isError(error, response) || !body.security_group_rule)
    {
      cb(osutils.getError('Neutron.getSecurityRule', error, response, body));
      return;
    }

    cb(null, this.mangleObject('SecurityRule', body.security_group_rule));
  });
};



//can group_id really be optional?
Neutron.prototype.createSecurityRule = function(group_id, data, cb){
  var post_data = {security_group: {}};
  if(group_id !== undefined)
  {
    post_data.security_group.security_group_id = group_id;
  }
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
  request_options.logPath = 'api-calls.neutron.security-rule-create';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isError(error, response) || !body.security_group_rule)
    {
      cb(osutils.getError('Neutron.createSecurityRule', error, response, body));
      return;
    }

    cb(null, this.mangleObject('SecurityRule', body.security_group_rule));
  });
};



Neutron.prototype.removeSecurityRule = function(rule_id, cb)
{
  var request_options = this.getRequestOptions('security-group-rules/' + rule_id, true);
  request_options.logPath = 'api-calls.neutron.security-rule-remove';

  this.request.del(request_options, function(error, response, body){
    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Neutron.removeSecurityRule', error, response, body));
      return;
    }

    //not sure what the body will be here but might as well return and munge it
    cb(null, this.mangleObject('SecurityRule', body));
  });
};


module.exports = Neutron;