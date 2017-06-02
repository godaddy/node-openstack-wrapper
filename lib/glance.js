var Request = require('./os-request');


//constructor - should be the only export
function Glance(endpoint_url, auth_token)
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
Glance.prototype.setTimeout = function(new_timeout)
{
  this.timeout = new_timeout;
};

Glance.prototype.setRequestID = function(request_id)
{
  this.request_id = request_id;
};

Glance.prototype.setUserName = function(user_name)
{
  this.user_name = user_name;
};

Glance.prototype.setLogger = function(logger)
{
  this.logger = logger;
};

//this should only be used for dependency injection
Glance.prototype.setRequest = function(request_lib)
{
  this.request = request_lib;
}

//lets us mangle/sanitize/make sane the various responses from openstack
//any replacement must simply support a static mangleObject that supports the following types [ie mangleObject(type, object)]
//Image
Glance.prototype.setMangler = function(mangle_lib)
{
  this.mangler = mangle_lib;
  this.mangleObject = this.mangler.mangleObject;
}



//returns an formatted options object - just makes the code below a little less repetitious
//path should begin with a "/"
//json_value should be almost certainly be true if you don't have an actual object you want to send over
Glance.prototype.getRequestOptions = function(path, json_value, extra_headers)
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



//makes a callback cb(error, images_array) with a list of all of the available images for a given project/user
//NOTE: harding pagination for now - change at will (just be aware it will break backwards compat so update version accordingly)
Glance.prototype.listImages = function(cb)
{
  var self = this;
  var request_options = this.getRequestOptions('/images?member_status=all&limit=200', true);
  request_options.metricPath = 'remote-calls.glance.images.list'; //if you override the request obj you can use this for logging purposes
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'images';
  
  this.request.get(request_options, function(error, response, body){
    var images_array = [];
    var n = 0;
    
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    for (n = 0; n < body.images.length; n++)
    {
      images_array[n] = self.mangleObject('Image', body.images[n]);
    }

    cb(null, images_array);
  });
}



//gets info on a specific image given the id
//takes an image id ex: '8ab808ed-d2aa-471c-9af0-0d3287061670'
//and callback with 2 params (error, image_info_object)
Glance.prototype.getImage = function(id, cb)
{
  var self = this;
  var request_options = this.getRequestOptions('/images/' + escape(id), true);
  request_options.metricPath = 'remote-calls.glance.images.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'id';

  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, self.mangleObject('Image', body));
  });
}



//This might create a temporary id/placeholder for us to upload new images into
//...or it may bring the end of times through dark titual.... probably 50/50
//callback takes 2 params (error, data) where data seems to include the id of the result of queuing...er posting... er whatever
Glance.prototype.queueImage = function(data, cb)
{
  var self = this;
  var post_data = {};
  var request_options = {};

  //first pull the valid options out of data - I think this is done for security purposes...as opposed to just tossing in 'data'?
  if(data.name)
  {
    post_data.name = data.name;
  }
  if(data.visibility)
  {
    post_data.visibility = data.visibility;
  }
  if(data.tags)
  {
    post_data.tags = data.tags;
  }
  if(data.disk_format)
  {
    post_data.disk_format = data.disk_format;
  }
  if(data.container_format)
  {
    post_data.container_format = data.container_format;
  }

  request_options = this.getRequestOptions('/images', post_data);
  request_options.metricPath = 'remote-calls.glance.images.queue';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'id';

  this.request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, self.mangleObject('Image', body));
  });
}



//uploads a new image to openstack
//takes the new image id(from the queue call above?)
//a stream object... don't really get that one (download result?)
//and a callback w/2 params (error, response) I think response here is the result of the upload call
Glance.prototype.uploadImage = function(id, stream, cb)
{
  var http;
  var upload;
  var url = this.url + '/images/' + escape(id) + '/file';
  var opt = urllib.parse(url); //sadly I didn't get this working with the request object.... yet!
  opt.method = 'PUT';
  opt.headers = {
    'X-Auth-Token': this.token,
    'Content-Type': 'application/octet-stream',
    'Connection'  : 'close'
  };

  if(opt.protocol == 'https:')
  {
    http = require('https');
  }
  else
  {
    http = require('http');
  }

  upload = http.request(opt, function(res){
    var response = '';

    res.on('data', function(chunk){
      response += chunk;
    });

    res.on('end', function(){
      cb(null, response);
    });
  });

  upload.on('error', function(e) {
    cb(e);
  });

  stream.pipe(upload);
}



//calls back with (error, image) after updating the data on an image
//data should be an object with only the deltas to be tweaked - the following are supposed
/*
  data.name
  data.visibility
  data.protected
  data.tags
*/
Glance.prototype.updateImage = function(id, data, cb)
{
  var self = this;
  var request_options = {};
  var patch_data = [];

  if(data.name)
  {
    patch_data.push({'op': 'replace', 'path': '/name', 'value': data.name});
  }
  if(data.visibility)
  {
    patch_data.push({'op': 'replace', 'path': '/visibility', 'value': data.visibility});
  }
  //data.protected is a boolean so the normal if(thing) mechanism won't work - hence typeof
  if(typeof data.protected != 'undefined')
  {
    patch_data.push({'op': 'replace', 'path': '/protected', 'value': !!data.protected});
  }
  if(data.tags)
  {
    patch_data.push({'op': 'replace', 'path': '/tags', 'value': data.tags});
  }

  //we have an additional header here due to the patch command
  request_options = this.getRequestOptions('/images/' + escape(id), patch_data, {'Content-Type': 'application/openstack-images-v2.1-json-patch'});
  request_options.metricPath = 'remote-calls.glance.images.update';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'id';

  this.request.patch(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, self.mangleObject('Image', body));
  });
}



//calls back with (error) after attempting to remove an openstack image
Glance.prototype.removeImage = function(id, cb)
{
  var request_options = this.getRequestOptions('/images/' + escape(id), true);
  request_options.metricPath = 'remote-calls.glance.images.remove';
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


module.exports = Glance;
