var OSUtils = require('./os-utils');
var Request = require('./os-request');


//constructor - should be the only export
function Heat(endpoint_url, auth_token)
{
  //set this way purely to facilitate unit test dependency injetion
  this.request = Request;

  //this is an optional lib that we override to normalfy the openstack responses - leave as is for no munging
  this.mangler = require('./mangler');
  this.mangleObject = this.mangler.mangleObject;

  //endpoint_url should come from the keystone projectInfo call - also yank all the trailing slashes in case folks get clever
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
Heat.prototype.setTimeout = function(new_timeout)
{
  this.timeout = new_timeout;
};

Heat.prototype.setRequestID = function(request_id)
{
  this.request_id = request_id;
};

Heat.prototype.setUserName = function(user_name)
{
  this.user_name = user_name;
};

Heat.prototype.setLogger = function(logger)
{
  this.logger = logger;
};

//this should only be used for dependency injection
Heat.prototype.setRequest = function(request_lib)
{
  this.request = request_lib;
}

//lets us mangle/sanitize/make sane the various responses from openstack
//any replacement must simply support a static mangleObject that supports the following types [ie mangleObject(type, object)]
//Image
Heat.prototype.setMangler = function(mangle_lib)
{
  this.mangler = mangle_lib;
  this.mangleObject = this.mangler.mangleObject;
}



//returns an formatted options object - just makes the code below a little less repetitious
//path should begin with a "/"
//json_value should be almost certainly be true if you don't have an actual object you want to send over
Heat.prototype.getRequestOptions = function(path, json_value, extra_headers)
{
  var return_object = {
    uri: this.url + path,
    headers:{'X-Auth-Token': this.token},
    json: json_value,
    timeout: this.timeout,
    metricRequestID: this.request_id,
    metricUserName: this.user_name,
    metricLogger: this.logger
  };

  //add the extra header info if it exists
  if(typeof extra_headers != 'undefined')
  {
    for(var key in extra_headers)
    {
      if(extra_headers.hasOwnProperty(key))
      {
        return_object.headers[key] = extra_headers[key];
      }
    }
  }

  return return_object;
};



//gets a list of all stacks for the given project/tenant
//calls back with cb(error, stack_array)
// the options object can be used to specify filters, e.g.:
//{
//    id: string,
//    status: string,
//    name: string,
//    action: string,
//    tenant: string,
//    username: string,
//    owner_id: string
//}
Heat.prototype.listStacks = function(options, cb)
{
  var self = this;
  var args = OSUtils.getArgsWithCallback(this.listStacks.length, arguments);
  options = args[0] || {};
  cb = args[1];

  var request_options = this.getRequestOptions('/stacks', true);
  request_options.qs = options;
  request_options.metricPath = 'remote-calls.heat.stacks.list';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'stacks';

  this.request.get(request_options, function(error, response, body){
    var stacks_array = [];
    var n = 0;

    if(error)
    {
      cb(error);
      return;
    }
    //else

    for (n = 0; n < body.stacks.length; n++)
    {
      stacks_array[n] = self.mangleObject('Stack', body.stacks[n]);
    }

    cb(null, stacks_array);
  });
}



//creates a stack with the given name
//calls back with cb(error, stack_object)
// options:
// {
//   disable_rollback: boolean,
//   environment: object,
//   files: object,
//   parameters: object,
//   tags: string,
//   template: object,
//   template_url: string,
//   timeout_mins: number
//}
//note: either template or template_url must be defined
Heat.prototype.createStack = function(name, options, cb)
{
  var self = this;
  var args = OSUtils.getArgsWithCallback(this.createStack.length, arguments);
  name = args[0];
  if (typeof name != 'string') {
      throw new Error('heat.createStack: requires `name` (string) parameter');
  }
  options = args[1] || {};
  if ((typeof options.template != 'object') &&
      (typeof options.template_url != 'string')) {
      throw new Error('heat.createStack: requires either `options.template` (object) or `options.template_url` (string) parameter');
  }
  cb = args[2];

  options.stack_name = name;
  var request_options = this.getRequestOptions('/stacks', options);
  request_options.metricPath = 'remote-calls.heat.stacks.create';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'stack';

  this.request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else

    cb(null, self.mangleObject('Stack', body.stack));
  });
}



//updates the stack with the given name and id, using HTTP PATCH
//calls back with cb(error, stack_object)
// options:
// {
//   clear_parameters: array,
//   disable_rollback: boolean,
//   environment: object,
//   environment_files: object,
//   files: object,
//   parameters: object,
//   tags: string,
//   template: object,
//   template_url: string,
//   timeout_mins: number,
//   converge: boolean
//}
//note: either template or template_url must be defined
Heat.prototype.updateStack = function(name, id, options, cb)
{
  var args = OSUtils.getArgsWithCallback(this.updateStack.length, arguments);
  name = args[0];
  if (typeof name != 'string') {
      throw new Error('heat.updateStack: requires `name` (string) parameter');
  }
  id = args[1];
  if (typeof id != 'string') {
      throw new Error('heat.updateStack: requires `id` (string) parameter');
  }
  options = args[2] || {};
  cb = args[3];

  var self = this;
  var request_options = this.getRequestOptions('/stacks/' + escape(name) + '/' + escape(id), options);
  request_options.metricPath = 'remote-calls.heat.stacks.update';
  request_options.validateStatus = true;

  this.request.patch(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else

    cb();
  });
}



//deletes the stack with the given name and id
Heat.prototype.deleteStack = function(name, id, cb)
{
  if (typeof name != 'string') {
      throw new Error('heat.deleteStack: requires `name` (string) parameter');
  }
  if (typeof id != 'string') {
      throw new Error('heat.deleteStack: requires `id`  (string) parameter');
  }

  var request_options = this.getRequestOptions('/stacks/' + escape(name) + '/' + escape(id), true);
  request_options.metricPath = 'remote-calls.heat.stack.delete';
  request_options.validateStatus = true;

  //are we not giving this a cb for some reason sometimes???
  function noop()
  {
    //this does absolutely nothing - and thats just the way we like it!
  }
  if(!cb)
  {
    cb = noop;
  }

  this.request.del(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else

    cb();
  });
}


module.exports = Heat;
