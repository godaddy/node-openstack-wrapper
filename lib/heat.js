//Class to handle all Heat methdology
//NOTE: This class was created after v2.1.10
//and so mangling is no longer supported or required to be programmed in below

var OSUtils = require('./os-utils');
var Request = require('./os-request');



//constructor - should be the only export
function Heat(endpoint_url, auth_token)
{
  //set this way purely to facilitate unit test dependency injetion
  this.request = Request;
 
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
//the options object can be a blank obj {} or used to specify filters using key/values, e.g.:
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
  var request_options = this.getRequestOptions('/stacks', true);
  request_options.qs = options;
  request_options.metricPath = 'remote-calls.heat.stacks.list';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'stacks';
  
  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else just send back the result (no mangling going forward)
    
    cb(null, body.stacks);
  });
}



//show output of a stack for the given key name
//calls back with cb(error, output_object)
Heat.prototype.showStackOutput = function(name, id, outputKey, cb)
{
  var request_options = this.getRequestOptions('/stacks/' + escape(name) + '/' + escape(id) + '/outputs/' + escape(outputKey), true);
  request_options.metricPath = 'remote-calls.heat.stack.showStackOutput';
  request_options.validateStatus = true;
  
  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else just send back the result (no mangling going forward)
    
    cb(null, body.output);
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
    //else just send back the result (no mangling going forward)
    
    cb(null, body.stack);
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
  var request_options = this.getRequestOptions('/stacks/' + escape(name) + '/' + escape(id), options);
  request_options.metricPath = 'remote-calls.heat.stacks.update';
  request_options.validateStatus = true;
  
  this.request.patch(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else just call back w/no error as the result is just a message telling us it worked (when it worked)
    
    cb();
  });
}



//deletes the stack with the given name and id
Heat.prototype.deleteStack = function(name, id, cb)
{
  var request_options = this.getRequestOptions('/stacks/' + escape(name) + '/' + escape(id), true);
  request_options.metricPath = 'remote-calls.heat.stack.delete';
  request_options.validateStatus = true;
  
  this.request.del(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else just call back w/no error
    
    cb();
  });
}


module.exports = Heat;