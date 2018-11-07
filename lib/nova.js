var util = require('util');
var osutils = require('./os-utils');
var Request = require('./os-request');


//constructor - should be the only export
function Nova(endpoint_url, auth_token)
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
Nova.prototype.setTimeout = function(new_timeout)
{
  this.timeout = new_timeout;
};

Nova.prototype.setRequestID = function(request_id)
{
  this.request_id = request_id;
};

Nova.prototype.setUserName = function(user_name)
{
  this.user_name = user_name;
};

Nova.prototype.setLogger = function(logger)
{
  this.logger = logger;
};

//this should only be used for dependency injection
Nova.prototype.setRequest = function(request_lib)
{
  this.request = request_lib;
}

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
    timeout: this.timeout,
    metricRequestID: this.request_id,
    metricUserName: this.user_name,
    metricLogger: this.logger
  };

  return return_object;
};



// ----------------
// Server methods
// ----------------
//NOTE: options is an optional hash that lets you specify filters on the listing call ie: {limit: 1}
Nova.prototype.listServers = function(options, cb)
{
  //first a little param tweaking to actually make options optional (at least until we require node8 and can just default options to {}
  var args = osutils.getArgsWithCallback(this.listServers.length, arguments);
  options = args[0] || {};
  cb = args[1];
  
  //now on with the show
  var self = this;
  var request_options = this.getRequestOptions('/servers/detail', true);
  request_options.metricPath = 'remote-calls.nova.servers.list';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'servers';
  request_options.qs = options;

  this.request.get(request_options, function(error, response, body){
    var servers_array = [];
    var n = 0;

    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    for(n = 0; n < body.servers.length; n++)
    {
      servers_array[n] = self.mangleObject('Server', body.servers[n]);
    }
    
    cb(null, servers_array);
  });
};



Nova.prototype.getServer = function(id, cb)
{
  var self = this;
  var request_options = this.getRequestOptions('/servers/' + id, true);
  request_options.metricPath = 'remote-calls.nova.servers.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'server';

  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, self.mangleObject('Server', body.server));
  });
};



Nova.prototype.createServer = function(data, cb)
{
  var self = this;
  var request_options = this.getRequestOptions('/servers', data);
  request_options.metricPath = 'remote-calls.nova.servers.create';
  request_options.validateStatus = true;
  //Commenting out so that we can handle returns of 'servers' for multiple creates
  //request_options.requireBodyObject = 'server';

  this.request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else

    cb(null, self.mangleObject('Server', body.server));
  });
};



Nova.prototype.renameServer = function(id, name, cb)
{
  var data = {server:{'name': name}};
  var request_options = this.getRequestOptions('/servers/' + id, data);
  request_options.metricPath = 'remote-calls.nova.servers.rename';
  request_options.validateStatus = true;

  this.request.put(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb();
  });
};



Nova.prototype.resizeServer = function(id, flavor, cb)
{
  var data = {resize: {flavorRef: flavor}};
  var request_options = this.getRequestOptions('/servers/' + id + '/action', data);
  request_options.metricPath = 'remote-calls.nova.servers.resize';
  request_options.validateStatus = true;

  this.request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb();
  });
};



Nova.prototype.confirmResizeServer = function(id,  cb)
{
  var data = {confirmResize: null};
  var request_options = this.getRequestOptions('/servers/' + id + '/action', data);
  request_options.metricPath = 'remote-calls.nova.servers.resize-confirm';
  request_options.validateStatus = true;

  this.request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb();
  });
};



Nova.prototype.revertResizeServer = function(id, cb)
{
  var data = {revertResize: null};
  var request_options = this.getRequestOptions('/servers/' + id + '/action', data);
  request_options.metricPath = 'remote-calls.nova.servers.resize-revert';
  request_options.validateStatus = true;

  this.request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb();
  });
};



Nova.prototype.removeServer = function(id, cb)
{
  var request_options = this.getRequestOptions('/servers/' + id, true);
  request_options.metricPath = 'remote-calls.nova.servers.remove';
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



Nova.prototype.rebootServer = function(id, cb)
{
  var data = {reboot: {type: "SOFT"}};
  var request_options = this.getRequestOptions('/servers/' + id + '/action', data);
  request_options.metricPath = 'remote-calls.nova.servers.reboot';
  request_options.validateStatus = true; 

  this.request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb();
  });
};



Nova.prototype.forceRebootServer = function(id, cb)
{
  var data = {reboot: {type: "HARD"}};
  var request_options = this.getRequestOptions('/servers/' + id + '/action', data);
  request_options.metricPath = 'remote-calls.nova.servers.reboot-force';
  request_options.validateStatus = true;

  this.request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb();
  });
};



Nova.prototype.stopServer = function(id, cb)
{
  var data = {"os-stop" : null};
  var request_options = this.getRequestOptions('/servers/' + id + '/action', data);
  request_options.metricPath = 'remote-calls.nova.servers.stop';
  request_options.validateStatus = true;

  this.request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    
    cb();
  });
};



Nova.prototype.startServer = function(id, cb)
{
  var data = {'os-start': null};
  var request_options = this.getRequestOptions('/servers/' + id + '/action', data);
  request_options.metricPath = 'remote-calls.nova.servers.start';

  this.request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb();
  });
};



Nova.prototype.pauseServer = function(id, cb)
{
  var data = {pause: null};
  var request_options = this.getRequestOptions('/servers/' + id + '/action', data);
  request_options.metricPath = 'remote-calls.nova.servers.pause';

  this.request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb();
  });
};



Nova.prototype.suspendServer = function(id, cb)
{
  var data = {suspend: null};
  var request_options = this.getRequestOptions('/servers/' + id + '/action', data);
  request_options.metricPath = 'remote-calls.nova.servers.suspend';

  this.request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
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
      cb(new Error('Cannot resume server.  Server is not in a paused or suspected state.'));
      return;
    }
    //else
    
    if(server.status == 'PAUSED')
    {
      data = {unpause: null};
    }
    else //SUSPENDED
    {
      data = {resume: null};
    }
    request_options = self.getRequestOptions('/servers/' + escape(id) + '/action', data);
    request_options.metricPath = 'remote-calls.nova.servers.resume';
    request_options.validateStatus = true;

    self.request.post(request_options, function(error, response, body){
      if(error)
      {
        cb(error);
        return;
      }
      //else
      
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
  request_options.metricPath = 'remote-calls.nova.servers.console-urls.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'console.url';

  this.request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else

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
  request_options.metricPath = 'remote-calls.nova.servers.logs.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'output';

  this.request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
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
  request_options.metricPath = 'remote-calls.nova.servers.images.create';
  request_options.validateStatus = true;
  //commenting out to support later versions of nova that dont return 
  //request_options.requireBodyObject = 'output';
  
  this.request.post(request_options, function(error, response, body){
    var url = '';
    var image_id = '';

    if(error)
    {
      cb(error);
      return;
    }
    //else if nova 2.45+ the image id is in the body, else its in the header (in theory)

    if(body && body.image_id)
    {
      //nova 2.45+
      image_id = body.image_id;
    }
    else
    {
      //old skool
      url = response.headers.location;
      image_id = url.match(/.*\/images\/(.*)/)[1];
    }
    
    //removing ServerImage mangling as we are updating this method with a diffrent format in 2.2+
    //going to try and output as close to what recent nova does regardless of version of nova used
    cb(null, {'image_id': image_id});
  });
};



Nova.prototype.setServerMetadata = function(id, data, cb)
{
  var self = this;
  var request_options = this.getRequestOptions('/servers/' + escape(id) + '/metadata', {metadata: data});
  request_options.metricPath = 'remote-calls.nova.servers.metadata.update';
  request_options.validateStatus = true;

  this.request.put(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
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
  request_options.metricPath = 'remote-calls.nova.flavors.list';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'flavors';

  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
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
  request_options.metricPath = 'remote-calls.nova.flavors.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'flavor';

  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else

    cb(null, self.mangleObject('Flavor', body.flavor));
  });
};



// ----------------
// Project Network
// ----------------
Nova.prototype.listProjectNetworks = function(cb)
{ 
  var projectNetworks_array = [];
  var request_options = this.getRequestOptions('/os-tenant-networks', true);
  request_options.metricPath = 'remote-calls.nova.os-tenant-networks.list';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'networks';
  
  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    
    //No mangling needed as this is a new method/obj-type
    //Input and output mangling should be handled outside of the lib going forward
    projectNetworks_array = body.networks;
    
    //theres no self, prev, or next pagiation stuff so just return the array
    cb(null, projectNetworks_array);
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
  request_options.metricPath = 'remote-calls.nova.floating-ips.list';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'floating_ips';

  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else

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
  request_options.metricPath = 'remote-calls.nova.floating-ips.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'floating_ip';

  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
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
  request_options.metricPath = 'remote-calls.nova.floating-ips.allocate';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'floating_ip';

  this.request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, self.mangleObject('NovaFloatingIp', body.floating_ip));
  });
};



//removes the floating ip from the pool and dissasociates and generally hates all things
//calls back with cb(error)
Nova.prototype.removeFloatingIp = function(id, cb)
{
  var self = this;
  var request_options = this.getRequestOptions('/os-floating-ips/' + escape(id), true);
  request_options.metricPath = 'remote-calls.nova.floating-ips.remove';
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



//associates a given instance with a given ip address (nova only supports the ip_address not the ip_id)
//calls back with cb(error) as nova doesn't provide a result beyond a 204
Nova.prototype.associateFloatingIp = function(instance_id, ip_address, cb)
{
  var self = this;
  var data = {addFloatingIp: {'address': ip_address}};
  var request_options = this.getRequestOptions('/servers/' + escape(instance_id) + '/action', data);
  request_options.metricPath = 'remote-calls.nova.floating-ips.associate';  
  request_options.validateStatus = true;

  this.request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb();
  });
};



//disassociates a given instance with a given ip address (nova only supports the ip_address not the ip_id)
//calls back with cb(error) as nova doesn't provide a result beyond a 204
Nova.prototype.disassociateFloatingIp = function(instance_id, ip_address, cb)
{
  var self = this;
  var data = {removeFloatingIp: {'address': ip_address}};
  var request_options = this.getRequestOptions('/servers/' + escape(instance_id) + '/action', data);
  request_options.metricPath = 'remote-calls.nova.floating-ips.disassociate';
  request_options.validateStatus = true;

  this.request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb();
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
  request_options.metricPath = 'remote-calls.nova.ip-pool-list';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'floating_ip_pools';

  this.request.get(request_options, function(error, response, body){
    var pools_array = [];
    var n = 0;

    if(error)
    {
      cb(error);
      return;
    }
    //else

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
  this.listFloatingIpPools(function(error, pools){
    var pool = null;
    
    if(error)
    {
      cb(error);
      return;
    }
    //else

    for(var i = 0; i < pools.length; i++)
    {
      if(!pool && pools[i].name == id)
      {
        pool = pools[i];
      }
    }

    if(!pool)
    {
      cb(new Error('No pool with specified id found'));
      return;
    }
    //else
    
    cb(null, pool);
  });
};



// ----------------
// Availability Zone
// ----------------
Nova.prototype.listAvailabilityZones = function(cb){
  var self = this;
  var request_options = this.getRequestOptions('/os-availability-zone', true);
  request_options.metricPath = 'remote-calls.nova.os-availability-zones.list';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'availabilityZoneInfo';

  this.request.get(request_options, function(error, response, body){
    var zones_array = [];
    var zone = {};
    var n = 0;

    if(error)
    {
      cb(error);
      return;
    }
    //else
    
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
  this.listAvailabilityZones(function(error, zones){
    var zone = null;
    
    if(error)
    {
      cb(error);
      return;
    }
    //else

    for(var i = 0; i < zones.length; i++)
    {
      if(!zone && zones[i].zoneName== id)
      {
        zone = zones[i];
      }
    }

    if(!zone)
    {
      cb(new Error('No zone with specified id found'));
    }
    //else
    
    cb(null, zone);
  });
}



// ---------------
// (SSH) Key Pairs
// ---------------
Nova.prototype.listKeyPairs = function(cb){
  var self = this;
  var request_options = this.getRequestOptions('/os-keypairs', true);
  request_options.metricPath = 'remote-calls.nova.key-pairs.list';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'keypairs';

  this.request.get(request_options, function(error, response, body){
    var kp_array = [];
    var n = 0;
    
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
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
  request_options.metricPath = 'remote-calls.nova.key-pairs.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'keypair';

  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
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
  request_options.metricPath = 'remote-calls.nova.key-pairs.create';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'keypair';

  this.request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, self.mangleObject('KeyPair', body.keypair));
  });
};



Nova.prototype.removeKeyPair = function(id, cb)
{
  var request_options = this.getRequestOptions('/os-keypairs/' + id, true);
  request_options.metricPath = 'remote-calls.nova.key-pairs.remove';
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



// ---------------
// Quota/Usage
// ---------------
Nova.prototype.getQuotaSet = function(project_id, cb){
  var self = this;
  var request_options = this.getRequestOptions('/os-quota-sets/' + escape(project_id), true);
  request_options.metricPath = 'remote-calls.nova.quota-sets.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'quota_set';

  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, self.mangleObject('QuotaSet', body.quota_set));
  });
};


//updates the quota for a given project_id
//data should be an object with all of the things you want to update
//supported values are cores, ram, instances, floating_ip, and anything else in the docs
//calls back with cb(error, quota_set) where quota_set is an object with all the updated params
//*****NOTE: the token required for this call is usually the one scoped to the admin (usually 'openstack') project
//even though the call is not usually on that specific project_id
Nova.prototype.setQuotaSet = function(project_id, data, cb)
{
  var self = this;
  var request_options = this.getRequestOptions('/os-quota-sets/' + escape(project_id), {quota_set: data});
  request_options.metricPath = 'remote-calls.nova.quota-sets.update';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'quota_set';
  
  this.request.put(request_options, function(error, response, body){  
    if(error)
    {
      cb(error);
      return;
    }
    //else

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
  request_options.metricPath = 'remote-calls.nova.tenant-usage.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'tenant_usage';

  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, self.mangleObject('TenantUsage', body.tenant_usage));
  });
};



// ---------------
// SecurityGroup
// ---------------
Nova.prototype.assignSecurityGroup = function(security_group_name, instance_id, cb){
  var data = {'addSecurityGroup': {'name': security_group_name}};
  var request_options = this.getRequestOptions('/servers/' + escape(instance_id) + '/action', data);
  request_options.metricPath = 'remote-calls.nova.servers.add-security-group';
  request_options.validateStatus = true;

  this.request.post(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb();
  });
};



Nova.prototype.removeSecurityGroup = function(security_group_name, instance_id, cb)
{
  var data = {'removeSecurityGroup': {'name': security_group_name}};
  var request_options = this.getRequestOptions('/servers/' + escape(instance_id) + '/action', data);
  request_options.metricPath = 'remote-calls.nova.servers.remove-security-group';
  request_options.validateStatus = true;

  this.request.post(request_options, function(error, response, body){
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
// Image MetaData (still handled by nova because....) //
// -------------------------------------------------- //
Nova.prototype.getImageMetaData = function(id, cb)
{
  var self = this;
  var request_options = this.getRequestOptions('/images/' + escape(id) + '/metadata', true);
  request_options.metricPath = 'remote-calls.nova.images.metadata.get';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'metadata';

  this.request.get(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, self.mangleObject('MetaData', body.metadata));
  });
};



Nova.prototype.setImageMetaData = function(id, data, cb)
{
  var self = this;
  var request_options = this.getRequestOptions('/images/' + escape(id) + '/metadata', {metadata: data});
  request_options.metricPath = 'remote-calls.nova.images.metadata.update';
  request_options.validateStatus = true;
  request_options.requireBodyObject = 'metadata';

  this.request.put(request_options, function(error, response, body){
    if(error)
    {
      cb(error);
      return;
    }
    //else
    
    cb(null, self.mangleObject('MetaData', body.metadata));
  });
};


module.exports = Nova;
