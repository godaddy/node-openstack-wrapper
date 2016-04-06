var urllib = require('url');
var util = require('util');
//var errors = require('./os-errors');
var osutils = require('./os-utils');


//constructor - should be the only export
function Nova(endpoint_url, auth_token)
{
  //we need to overwrite this for unit testing and it allows us to use a custom request object that includes graphite logging
  this.request = require('request');

  //this is an optional lib that we override to normalfy the openstack responses - leave as is for no munging
  this.mangler = require('./mangler');
  this.mangleObject = this.mangler.mangleObject;

  //auth_token should be the scoped token from the projectInfo call
  this.token =  auth_token;

  //endpoint_url should come from the keystone projectInfo call - also yank all the trailing slashes in case folks get clever
  this.url = endpoint_url.replace(/\/$/, "");

  //default the timeout to false - this forces the static value to be used
  this.timeout = false;
}



//allows for simple global timeouts if desired
Nova.timeout = 9000;



//allows for instance timeouts if desired (see getRequestOptions)
Nova.prototype.setTimeout = function(request_timeout)
{
  this.timeout = request_timeout;
};


//lets us override the existing request lib for this instance (useful for a bunch of things)
Nova.prototype.setRequest = function(request_lib)
{
  this.request = request_lib;
};



//lets us mangle/sanitize/make sane the various responses from openstack
//any replacement must simply support a static mangleObject that supports the following types [ie mangleObject(type, object)]
//Server, MetaData, Flavor, ServerImage, FloatingIp, IpPool, KeyPair, QuotaSet
Nova.prototype.setMangler = function(mangle_lib)
{
  this.mangler = mangle_lib;
  this.mangleObject = this.mangler.mangleObject;
}



//returns an formatted options object - just makes the code below a little less repetitious
//path should begin with a "/"
//json_value should be almost certainly be true if you don't have an actual object you want to send over
Nova.prototype.getRequestOptions = function(path, json_value)
{
  //start w/the instance timeout
  var request_timeout = this.timeout;
  if(!request_timeout)
  {
    //override with the static value if no instance value was given
    request_timeout = Nova.timeout;
  }
  var return_object = {
    uri: this.url + path,
    headers:{'X-Auth-Token': this.token},
    json: json_value,
    timeout: request_timeout
  };

  return return_object;
};



// ----------------
// Server methods
// ----------------
Nova.prototype.listServers = function(cb)
{
  var self = this;
  var request_options = this.getRequestOptions('/servers/detail', true);
  request_options.logPath = 'api-calls.nova.servers-list';

  this.request.get(request_options, function(error, response, body){
    var servers_array = [];
    var n = 0;

    if(osutils.isRequestError(error, response) || !body.servers)
    {
      cb(osutils.getRequestError(error, response, body));
    }
    else
    {
      for(n = 0; n < body.servers.length; n++)
      {
        servers_array[n] = self.mangleObject('Server', body.servers[n]);
      }

      cb(null, servers_array);
    }
  });
};



Nova.prototype.getServer = function(id, cb)
{
  var self = this;
  var request_options = this.getRequestOptions('/servers/' + id, true);
  request_options.logPath = 'api-calls.nova.servers-get';

  this.request.get(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response) || !body.server)
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    cb(null, self.mangleObject('Server', body.server));
  });
};



Nova.prototype.createServer = function(data, cb)
{
  var self = this;
  var request_options = this.getRequestOptions('/servers', data);
  request_options.logPath = 'api-calls.nova.servers-create';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response) || !body.server)
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    cb(null, self.mangleObject('Server', body.server));
  });
};



Nova.prototype.renameServer = function(id, name, cb)
{
  var data = {server:{'name': name}};
  var request_options = this.getRequestOptions('/servers/' + id, data);
  request_options.logPath = 'api-calls.nova.servers-rename';

  this.request.put(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response))
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    cb();
  });
};



Nova.prototype.resizeServer = function(id, flavor, cb)
{
  var data = {resize: {flavorRef: flavor}};
  var request_options = this.getRequestOptions('/servers/' + id + '/action', data);
  request_options.logPath = 'api-calls.nova.servers-resize';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response))
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    cb();
  });
};



Nova.prototype.confirmResizeServer = function(id,  cb)
{
  var data = {confirmResize: null};
  var request_options = this.getRequestOptions('/servers/' + id + '/action', data);
  request_options.logPath = 'api-calls.nova.servers-resize-confirm';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response))
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    cb();
  });
};



Nova.prototype.revertResizeServer = function(id, cb)
{
  var data = {revertResize: null};
  var request_options = this.getRequestOptions('/servers/' + id + '/action', data);
  request_options.logPath = 'api-calls.nova.servers-resize-revert';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response))
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    cb();
  });
};



Nova.prototype.removeServer = function(id, cb)
{
  var request_options = this.getRequestOptions('/servers/' + id, true);
  request_options.logPath = 'api-calls.nova.servers-remove';

  this.request.del(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response))
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    cb();
  });
};



Nova.prototype.rebootServer = function(id, cb)
{
  var data = {reboot: {type: "SOFT"}};
  var request_options = this.getRequestOptions('/servers/' + id + '/action', data);
  request_options.logPath = 'api-calls.nova.servers-reboot';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response))
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    cb();
  });
};



Nova.prototype.forceRebootServer = function(id, cb)
{
  var data = {reboot: {type: "HARD"}};
  var request_options = this.getRequestOptions('/servers/' + id + '/action', data);
  request_options.logPath = 'api-calls.nova.servers-reboot-force';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response))
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    cb();
  });
};



Nova.prototype.stopServer = function(id, cb)
{
  var data = {"os-stop" : null};
  var request_options = this.getRequestOptions('/servers/' + id + '/action', data);
  request_options.logPath = 'api-calls.nova.servers-stop';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response))
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    cb();
  });
};



Nova.prototype.startServer = function(id, cb)
{
  var data = {'os-start': null};
  var request_options = this.getRequestOptions('/servers/' + id + '/action', data);
  request_options.logPath = 'api-calls.nova.servers-start';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response))
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    cb();
  });
};



Nova.prototype.pauseServer = function(id, cb)
{
  var data = {pause: null};
  var request_options = this.getRequestOptions('/servers/' + id + '/action', data);
  request_options.logPath = 'api-calls.nova.servers-pause';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response))
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    cb();
  });
};



Nova.prototype.suspendServer = function(id, cb)
{
  var data = {suspend: null};
  var request_options = this.getRequestOptions('/servers/' + id + '/action', data);
  request_options.logPath = 'api-calls.nova.servers-suspend';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response))
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    cb();
  });
};



Nova.prototype.resumeServer = function(id, cb)
{
  var self = this;

  this.getServer(id, function(err, server){
    var data = {};
    var request_options = {};
    var custom_error = null;

    if(err)
    {
      cb(err);
      return;
    }

    if(server.status != 'PAUSED' && server.status != 'SUSPENDED')
    {
      custom_error = new Error('Cannot resume. Server is not in a paused or suspended state.');
      custom_error.status = 400;
      cb(custom_error);
      return;
    }

    if(server.status == 'PAUSED')
    {
      data = {unpause: null};
    }
    else //SUSPENDED
    {
      data = {resume: null};
    }
    request_options = self.getRequestOptions('/servers/' + escape(id) + '/action', data);
    request_options.logPath = 'api-calls.nova.servers-resume';

    self.request.post(request_options, function(error, response, body){
      if(osutils.isRequestError(error, response))
      {
        cb(osutils.getRequestError(error, response, body));
        return;
      }

      cb();
    });
  });
};



Nova.prototype.getServerConsoleURL = function(type, id, cb)
{
  var data = {};
  var request_options = {};

  if(type == 'spice-html5')
  {
    data = {'os-getSPICEConsole' :{'type' : type}};
  }
  else
  {
    if(type === undefined || !type)
    {
      type = 'novnc';
    }
    data = {'os-getVNCConsole': {'type': type}};
  }
  request_options = this.getRequestOptions('/servers/' + escape(id) + '/action', data);
  request_options.logPath = 'api-calls.nova.servers-console-url';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response) || !body.console || !body.console.url)
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    cb(null, body.console.url);
  });
};



//gets [length] lines form the log? of an instance
Nova.prototype.getServerLog = function(id, length, cb)
{
  var data = {};
  var request_options = {};

  if(length === undefined || !length)
  {
    length = 35;
  }

  data = {'os-getConsoleOutput': {'length': length}};
  request_options = this.getRequestOptions('/servers/' + escape(id) + '/action', data);
  request_options.logPath = 'api-calls.nova.servers-get-log';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response) || typeof body.output == 'undefined')
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    cb(null, body.output);
  });
};



//creates an image from the current disk of an instance
//takes the id of an instance as well as any meta-data to be added to the image
//calls back with(error, new_image_info)
Nova.prototype.createServerImage = function(id, data, cb)
{
  var self = this;
  var name = '';
  var metadata = {};
  var request_options = {};

  if(data.name)
  {
    name = data.name
  }
  if(data.metadata)
  {
    metadata = data.metadata;
  }

  data = {createImage: {'name': name, 'metadata': metadata}};
  request_options = this.getRequestOptions('/servers/' + escape(id) + '/action', data);
  request_options.logPath = 'api-calls.nova.servers-create-image';

  this.request.post(request_options, function(error, response, body){
    var url = '';
    var image_id = '';

    if(osutils.isRequestError(error, response) || !body.output)
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    //its useful to also send back the id of the image that was just created - we can get that from the response location apparently?
    url = response.headers.location;
    image_id = url.match(/.*\/images\/(.*)/)[1];
    body.output.ImageId = image_id;

    cb(null, self.mangleObject('ServerImage', body.output));
  });
};



Nova.prototype.setServerMetadata = function(id, data, cb)
{
  var self = this;
  var request_options = this.getRequestOptions('/servers/' + escape(id) + '/metadata', {metadata: data});
  request_options.logPath = 'api-calls.nova.servers-set-metadata';

  this.request.put(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response))
    {
      //not sure why but this function previously returned the result along w/the error unlike the other functions
      cb(osutils.getRequestError(error, response, body), body);
      return;
    }

    cb(null, self.mangleObject('MetaData', body));
  });
};



// ----------------
// Flavor
// ----------------
Nova.prototype.listFlavors = function(cb)
{
  var self = this;
  var flavors_array = [];
  var request_options = this.getRequestOptions('/flavors/detail', true);
  request_options.logPath = 'api-calls.nova.flavors-list';

  this.request.get(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response) || !body.flavors)
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }
    //else we need to arrayify mangle the response(s)

    for(var n = 0; n < body.flavors.length; n++)
    {
      flavors_array[n] = self.mangleObject('Flavor', body.flavors[n]);
    }

    //theres no self, prev, or next pagiation stuff so just return the array
    cb(null, flavors_array);
  });
};



Nova.prototype.getFlavor = function(id, cb)
{
  var self = this;
  var request_options = this.getRequestOptions('/flavors/' + escape(id), true);
  request_options.logPath = 'api-calls.nova.flavors-get';

  this.request.get(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response) || !body.flavor)
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    cb(null, self.mangleObject('Flavor', body.flavor));
  });
};



// ----------------
// Floating IP
// ----------------
Nova.prototype.listFloatingIps = function(cb)
{
  var self = this;
  var ip_array = [];
  var request_options = this.getRequestOptions('/os-floating-ips', true);
  request_options.logPath = 'api-calls.nova.floating-ips-list';

  this.request.get(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response))
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    if(body.floating_ips && body.floating_ips.length)
    {
      for(var i = 0 ; i < body.floating_ips.length; i++)
      {
        ip_array.push(self.mangleObject('NovaFloatingIp', body.floating_ips[i]));
      }
    }

    cb(null, ip_array);
  });
};



Nova.prototype.getFloatingIp = function(id, cb)
{
  var self = this;
  var request_options = this.getRequestOptions('/os-floating-ips/' + escape(id), true);
  request_options.logPath = 'api-calls.nova.floating-ips-get';

  this.request.get(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response) || !body.floating_ip)
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    cb(null, self.mangleObject('NovaFloatingIp', body.floating_ip));
  });
};



//allocates assigns an ip
//calls cb with the info on the created ip
Nova.prototype.createFloatingIp = function(data, cb)
{
  var self = this;
  var post_data = true;
  if(data.pool !== undefined)
  {
    post_data = {pool: data.pool};
  }
  var request_options = this.getRequestOptions('/os-floating-ips', post_data);
  request_options.logPath = 'api-calls.nova.floating-ips-allocate';

  //first allocate the ip
  this.request.post(request_options, function(error, response, body){
    var ip_object = {};
    if(osutils.isRequestError(error, response) || !body.floating_ip)
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }
    ip_object = self.mangleObject('NovaFloatingIp', body.floating_ip);

    cb(null, ip_object)
  });
};



//removes the floating ip from the pool and dissasociates and generally hates all things
//calls back with cb(error)
Nova.prototype.removeFloatingIp = function(id, cb)
{
  var self = this;
  var request_options = this.getRequestOptions('/os-floating-ips/' + escape(id), true);
  request_options.logPath = 'api-calls.nova.floating-ips-remove';

  this.request.del(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response))
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    cb(null);
  });
};



//associates a given instance with a given ip address (nova only supports the ip_address not the ip_id)
//calls back with cb(error) as nova doesn't provide a result beyond a 204
Nova.prototype.associateFloatingIp = function(instance_id, ip_address, cb)
{
  var self = this;
  var data = {addFloatingIp: {'address': ip_address}};
  var request_options = this.getRequestOptions('/servers/' + escape(instance_id) + '/action', data);
  request_options.logPath = 'api-calls.nova.floating-ips-associate';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response))
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    cb(null);
  });
};


//disassociates a given instance with a given ip address (nova only supports the ip_address not the ip_id)
//calls back with cb(error) as nova doesn't provide a result beyond a 204
Nova.prototype.disassociateFloatingIp = function(instance_id, ip_address, cb)
{
  var self = this;
  var data = {removeFloatingIp: {'address': ip_address}};
  var request_options = this.getRequestOptions('/servers/' + escape(instance_id) + '/action', data);
  request_options.logPath = 'api-calls.nova.floating-ips-disassociate';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response))
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    cb(null);
  });
};



// ----------------
// Floating IP Pool
// ----------------
Nova.prototype.listFloatingIpPools = function(cb)
{
  var self = this;
  var return_array = [];
  var request_options = this.getRequestOptions('/os-floating-ip-pools', true);
  request_options.logPath = 'api-calls.nova.ip-pool-list';

  this.request.get(request_options, function(error, response, body){
    var pools_array = [];
    var n = 0;

    if(osutils.isRequestError(error, response) || !body.floating_ip_pools)
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    for(n = 0; n < body.floating_ip_pools.length; n++)
    {
      pools_array[n] = self.mangleObject('FloatingIpPool', body.floating_ip_pools[n]);
    }

    cb(null, pools_array);
  });
};



//since theres apparently no getIpPool info method in the nova api...
//NOTE: the return from ip_pools is weird and doesn' thave an id but its a better term.  id == name in reality
Nova.prototype.getFloatingIpPool = function(id, cb)
{
  this.listFloatingIpPools(function(err, pools){
    if(err)
    {
      cb(err);
      return;
    }

    for(var i = 0; i < pools.length; i++)
    {
      if(pools[i].name == id)
      {
        cb(null, pools[i]);
        return;
      }
    }

    var error = new Error('Not Found')
    error.status = 404;
    cb(error);
  });
};



// ----------------
// Availability Zone
// ----------------
Nova.prototype.listAvailabilityZones = function(cb){
  var self = this;
  var request_options = this.getRequestOptions('/os-availability-zone', true);
  request_options.logPath = 'api-calls.nova.availability-zone-list';

  this.request.get(request_options, function(error, response, body){
    var zones_array = [];
    var zone = {};
    var n = 0;

    if(osutils.isRequestError(error, response) || !body.availabilityZoneInfo || !util.isArray(body.availabilityZoneInfo))
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    //we are going to normalize the response a bit and include an id
    for(n = 0; n < body.availabilityZoneInfo.length; n++)
    {
      zones_array[n] = self.mangleObject('AvailabilityZone', body.availabilityZoneInfo[n]);
    }

    cb(null, zones_array);
  });
};



//and since there is no method to get zone info in the nova api...
//NOTE: the return from listAvailabilityZones is weird and doesn' thave an id but its a better term.  id == name in reality
Nova.prototype.getAvailabilityZone = function(id, cb){
  var error = {};

  this.listAvailabilityZones(function(err, zones){
    if(err)
    {
      cb(err);
      return;
    }

    for(var i = 0; i < zones.length; i++)
    {
      if(zones[i].zoneName== id)
      {
        cb(null, zones[i]);
        return;
      }
    }

    var error = new Error('Not Found');
    error.status = 404;
    cb(error);
  });
}



// ---------------
// (SSH) Key Pairs
// ---------------
Nova.prototype.listKeyPairs = function(cb){
  var self = this;
  var request_options = this.getRequestOptions('/os-keypairs', true);
  request_options.logPath = 'api-calls.nova.key-pairs-list';

  this.request.get(request_options, function(error, response, body){
    var kp_array = [];
    var n = 0;

    if(osutils.isRequestError(error, response) || !body.keypairs || !util.isArray(body.keypairs))
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    for(n = 0; n < body.keypairs.length; n++)
    {
      kp_array[n] = self.mangleObject('KeyPair', body.keypairs[n].keypair);
    }

    cb(null, kp_array);
  });
};



Nova.prototype.getKeyPair = function(id, cb){
  var self = this;
  var request_options = this.getRequestOptions('/os-keypairs/' + id, true);
  request_options.logPath = 'api-calls.nova.key-pairs-get';

  this.request.get(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response) || !body.keypair)
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    cb(null, self.mangleObject('KeyPair', body.keypair));
  });
};



Nova.prototype.createKeyPair = function(name, public_key, cb)
{
  var self = this;
  var data = {};
  var request_options = {};

  data = {keypair: {'name': name}};
  if(public_key)
  {
    data.keypair.public_key = public_key;
  }
  request_options = this.getRequestOptions('/os-keypairs', data);
  request_options.logPath = 'api-calls.nova.key-pairs-create';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response) || !body.keypair)
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    cb(null, self.mangleObject('KeyPair', body.keypair));
  });
};



Nova.prototype.removeKeyPair = function(id, cb)
{
  var request_options = this.getRequestOptions('/os-keypairs/' + id, true);
  request_options.logPath = 'api-calls.nova.key-pairs-remove';

  this.request.del(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response))
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    //ummm... send back nothing?  I wonder what the actual response returns
    cb();
  });
};




// ---------------
// Quota/Usage
// ---------------
Nova.prototype.getQuotaSet = function(project_id, cb){
  var self = this;
  var request_options = this.getRequestOptions('/os-quota-sets/' + escape(project_id), true);
  request_options.logPath = 'api-calls.nova.quota-get';

  this.request.get(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response) || !body.quota_set)
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    cb(null, self.mangleObject('QuotaSet', body.quota_set));
  });
};


//updates the quota for a given project_id
//data should be an object with all of the things you want to update
//supported values are cores, ram, instances, floating_ip, and anything else in the docs
//calls back with cb(error, quota_set) where quota_set is an object with all the updated params
//*****NOTE: the token required for this call is usually the one scoped to the 'openstack'
//even though the call is not usually on that specific project_id
Nova.prototype.setQuotaSet = function(project_id, data, cb)
{
  var self = this;
  var request_options = this.getRequestOptions('/os-quota-sets/' + escape(project_id), {quota_set: data});
  request_options.logPath = 'api-calls.nova.quota-set';

  this.request.put(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response) || !body.quota_set)
    {
      cb(osutils.getRequestError(error, response, body), null);
      return;
    }

    cb(null, self.mangleObject('QuotaSet', body.quota_set));
  });
};



//start_date and end_date should just be any 2 date objects
Nova.prototype.getTenantUsage = function(project_id, start_date_obj, end_date_obj, cb)
{
  var self = this;
  var url =  '/os-simple-tenant-usage/' + escape(project_id);

  // format of dates should be: %Y-%m-%d %H:%M:%S.%f
  url += '?start=' + start_date_obj.toISOString().replace('T',' ').replace('Z','');
  url += '&end=' + end_date_obj.toISOString().replace('T',' ').replace('Z','');

  var request_options = this.getRequestOptions(url, true);
  request_options.logPath = 'api-calls.nova.usage-get';

  this.request.get(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response) || !body.tenant_usage)
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    cb(null, self.mangleObject('TenantUsage', body.tenant_usage));
  });
};



// ---------------
// SecurityGroup
// ---------------
Nova.prototype.assignSecurityGroup = function(security_group_name, instance_id, cb){
  var data = {'addSecurityGroup': {'name': security_group_name}};
  var request_options = this.getRequestOptions('/servers/' + escape(instance_id) + '/action', data);
  request_options.logPath = 'api-calls.nova.security-group-add';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response))
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    //should send back a 202 w/o a body so just send back true
    cb(null, true);
  });
};



Nova.prototype.removeSecurityGroup = function(security_group_name, instance_id, cb)
{
  var data = {'removeSecurityGroup': {'name': security_group_name}};
  var request_options = this.getRequestOptions('/servers/' + escape(instance_id) + '/action', data);
  request_options.logPath = 'api-calls.nova.security-group-remove';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response))
    {
      cb(osutils.getRequestError(error, response, body));
      return;
    }

    //should send back a 202 w/o a body so just send back true
    cb(null, true);
  });
};



// -------------------------------------------------- //
// Image MetaData (still handled by nova because....) //
// -------------------------------------------------- //
Nova.prototype.getImageMetaData = function(id, cb)
{
  var self = this;
  var request_options = this.getRequestOptions('/images/' + escape(id) + '/metadata', true);
  request_options.logPath = 'api-calls.nova.images-metadata-get';

  this.request.get(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response) || !body.metadata)
    {
      cb(osutils.getRequestError(error, response, body), null);
      return;
    }

    cb(null, self.mangleObject('MetaData', body.metadata));
  });
};


Nova.prototype.setImageMetaData = function(id, data, cb)
{
  var self = this;
  var request_options = this.getRequestOptions('/images/' + escape(id) + '/metadata', {metadata: data});
  request_options.logPath = 'api-calls.nova.images-metadata-set';

  this.request.put(request_options, function(error, response, body){
    if(osutils.isRequestError(error, response) || !body.metadata)
    {
      cb(osutils.getRequestError(error, response, body), null);
      return;
    }

    cb(null, self.mangleObject('MetaData', body.metadata));
  });
};



module.exports = Nova;
