var urllib = require('url');
var util = require('util');
var mungeResponse = require('./mungeResponse');
var errors = require('./os-errors');
var osutils = require('./os-utils');


//constructor - should be the only export
function Nova(endpoint_url, auth_token, call_timeout)
{
  //we need to overwrite this for unit testing and it allows us to use a custom request object that includes graphite logging
  this.request = require('request');
  
  //auth_token should be the scoped token from the projectInfo call
  this.token =  auth_token;
  
  //endpoint_url should come from the keystone projectInfo call - also yank all the trailing slashes in case folks get clever
  this.url = endpoint_url.replace(/\/$/, "");
  
  //default the timeout in case one isn't set
  if(typeof call_timeout == 'undefined')
  {
    this.timeout = 9000;
  }
  this.timeout = call_timeout;
}



//lets us override the existing request lib for this instance (useful for a bunch of things)
Nova.prototype.setRequest = function(request_lib)
{
  this.request = request_lib;
};



//returns an formatted options object - just makes the code below a little less repetitious
//path should begin with a "/"
//json_value should be almost certainly be true if you don't have an actual object you want to send over
Nova.prototype.getRequestOptions = function(path, json_value)
{
  var return_object = {
    uri: this.url + path,
    headers:{'X-Auth-Token': this.token},
    json: json_value,
    timeout: this.timeout
  };

  return return_object;
};



// ----------------
// Instance methods
// ----------------
Nova.prototype.listInstances = function(cb)
{
  var request_options = this.getRequestOptions('/servers/detail', true);
  request_options.logPath = 'api-calls.nova.instances-list';

  this.request.get(request_options, function(error, response, body){
    var instance_array = [];
    if(osutils.isError(error, response) || !body.servers)
    {
      cb(osutils.getError('Nova.instance.list', error, response, body));
      return;
    }
    //else we are good - even a blank array should be fine below

    for(var n = 0; n < body.servers.length; n++)
    {
      instance_array.push(mungeResponse(body.servers[n]));
    }

    cb(null, instance_array);
  });
};



Nova.prototype.getInstance = function(id, cb)
{
  var request_options = this.getRequestOptions('/servers/' + id, true);
  request_options.logPath = 'api-calls.nova.instances-get';

  this.request.get(request_options, function(error, response, body){
    if(osutils.isError(error, response) || !body.server)
    {
      cb(osutils.getError('Nova.getInstance', error, response, body));
      return;
    }

    cb(null, mungeResponse(body.server));
  });
};



Nova.prototype.createInstance = function(data, cb)
{
  var request_options = this.getRequestOptions('/servers', data);
  request_options.logPath = 'api-calls.nova.instances-create';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isError(error, response) || !body.server)
    {
      cb(osutils.getError('Nova.instance.create', error, response, body));
      return;
    }

    cb(null, mungeResponse(body.server));
  });
};



Nova.prototype.renameInstance = function(id, name, cb)
{
  var data = {server:{'name': name}};
  var request_options = this.getRequestOptions('/servers/' + id, data);
  request_options.logPath = 'api-calls.nova.instances-rename';

  this.request.put(request_options, function(error, response, body){
    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Nova.instance.rename', error, response, body));
      return;
    }

    //should send back a 202 w/o a body so send back true
    cb(null, true);
  });
};



Nova.prototype.resizeInstance = function(id, flavor, cb)
{
  var data = {resize: {flavorRef: flavor}};
  var request_options = this.getRequestOptions('/servers/' + id + '/action', data);
  request_options.logPath = 'api-calls.nova.instances-resize';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Nova.instance.resize', error, response, body));
      return;
    }

    //should send back a 202 w/o a body so send back true
    cb(null, true);
  });
};



Nova.prototype.confirmResizeInstance = function(id,  cb)
{
  var data = {confirmResize: null};
  var request_options = this.getRequestOptions('/servers/' + id + '/action', data);
  request_options.logPath = 'api-calls.nova.instances-resize-confirm';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Nova.instance.resizeConfirm', error, response, body));
      return;
    }

    //should send back a 202 w/o a body so send back true
    cb(null, true);
  });
};



Nova.prototype.revertResizeInstance = function(id, cb)
{
  var data = {revertResize: null};
  var request_options = this.getRequestOptions('/servers/' + id + '/action', data);
  request_options.logPath = 'api-calls.nova.instances-resize-revert';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Nova.instance.resizeRever', error, response, body));
      return;
    }

    //should send back a 202 w/o a body so send back true
    cb(null, true);
  });
};



Nova.prototype.removeInstance = function(id, cb)
{
  var request_options = this.getRequestOptions('/servers/' + id, true);
  request_options.logPath = 'api-calls.nova.instances-remove';

  this.request.del(request_options, function(error, response, body){
    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Nova.instance.remove', error, response, body));
      return;
    }

    //should send back a 202 w/o a body so send back true
    cb(null, true);
  });
};



Nova.prototype.rebootInstance = function(id, cb)
{
  var data = {reboot: {type: "SOFT"}};
  var request_options = this.getRequestOptions('/servers/' + id + '/action', data);
  request_options.logPath = 'api-calls.nova.instances-reboot';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Nova.instance.reboot', error, response, body));
      return;
    }

    //should send back a 202 w/o a body so send back true
    cb(null, true);
  });
};



Nova.prototype.forceRebootInstance = function(id, cb)
{
  var data = {reboot: {type: "HARD"}};
  var request_options = this.getRequestOptions('/servers/' + id + '/action', data);
  request_options.logPath = 'api-calls.nova.instances-reboot-force';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Nova.instance.forceReboot', error, response, body));
      return;
    }

    //should send back a 202 w/o a body so send back true
    cb(null, true);
  });
};



Nova.prototype.stopInstance = function(id, cb)
{
  var data = {"os-stop" : null};
  var request_options = this.getRequestOptions('/servers/' + id + '/action', data);
  request_options.logPath = 'api-calls.nova.instances-stop';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Nova.instance.stop', error, response, body));
      return;
    }

    //should send back a 202 w/o a body so send back true
    cb(null, true);
  });
};



Nova.prototype.startInstance = function(id, cb)
{
  var data = {'os-start': null};
  var request_options = this.getRequestOptions('/servers/' + id + '/action', data);
  request_options.logPath = 'api-calls.nova.instances-start';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Nova.instance.start', error, response, body));
      return;
    }

    //should send back a 202 w/o a body so send back true
    cb(null, true);
  });
};



Nova.prototype.pauseInstance = function(id, cb)
{
  var data = {pause: null};
  var request_options = this.getRequestOptions('/servers/' + id + '/action', data);
  request_options.logPath = 'api-calls.nova.instances-pause';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Nova.instance.pause', error, response, body));
      return;
    }

    //should send back a 202 w/o a body so send back true
    cb(null, true);
  });
};



Nova.prototype.suspendInstance = function(id, cb)
{
  var data = {suspend: null};
  var request_options = this.getRequestOptions('/servers/' + id + '/action', data);
  request_options.logPath = 'api-calls.nova.instances-suspend';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Nova.instance.suspend', error, response, body));
      return;
    }

    //should send back a 202 w/o a body so send back true
    cb(null, true);
  });
};



Nova.prototype.resumeInstance = function(id, cb)
{
  var self = this;
  
  this.getInstance(id, function(err, server){
    var data = {};
    var request_options = {};

    if(err)
    {
      cb(err);
      return;
    }

    if(server.status != 'PAUSED' && server.status != 'SUSPENDED')
    {
      cb(new errors.InvalidStateError());
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
    request_options.logPath = 'api-calls.nova.instances-resume';

    self.request.post(request_options, function(error, response, body){
      if(osutils.isError(error, response))
      {
        cb(osutils.getError('Nova.instance.resume', error, response, body));
        return;
      }

      //should send back a 202 w/o a body so send back true
      cb(null, true);
    });
  });
};



Nova.prototype.getInstanceConsoleUrl = function(type, id, cb)
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
  request_options.logPath = 'api-calls.nova.instances-console-url';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isError(error, response) || !body.console || !body.console.url)
    {
      cb(osutils.getError('Nova.instance.consoleURL', error, response, body));
      return;
    }

    cb(null, body.console.url);
  });
};



//gets [length] lines form the log? of an instance
Nova.prototype.getInstanceLog = function(id, length, cb)
{
  var data = {};
  var request_options = {};

  if(length === undefined || !length)
  {
    length = 35;
  }

  data = {'os-getConsoleOutput': {'length': length}};
  request_options = this.getRequestOptions('/servers/' + escape(id) + '/action', data);
  request_options.logPath = 'api-calls.nova.instances-console-output';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isError(error, response) || typeof body.output == 'undefined')
    {
      cb(osutils.getError('Nova.instance.log', error, response, body));
      return;
    }

    cb(null, body.output);
  });
};


//creates an image from the current disk of an instance
//takes the id of an instance as well as any meta-data to be added to the image
//calls back with(error, new_image_info)
Nova.prototype.createImage = function(id, data, cb)
{
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
  request_options.logPath = 'api-calls.nova.instances-create-image';

  this.request.post(request_options, function(error, response, body){
    var url = '';
    var image_id = '';
    
    if(osutils.isError(error, response) || !body.output)
    {
      cb(osutils.getError('Nova.instance.createImage', error, response, body));
      return;
    }

    //its useful to also send back the id of the image that was just created - we can get that from the response location apparently?
    url = response.headers.location;
    image_id = url.match(/.*\/images\/(.*)/)[1];
    body.output.ImageId = image_id;
    
    cb(null, body.output);
  });
};



Nova.prototype.setInstanceMetadata = function(id, data, cb)
{
  var request_options = this.getRequestOptions('/servers/' + escape(id) + '/metadata', {metadata: data});
  request_options.logPath = 'api-calls.nova.instances-set-metadata';

  this.request.put(request_options, function(error, response, body){
    if(osutils.isError(error, response))
    {
      //not sure why but this function previously returned the result along w/the error unlike the other functions
      cb(osutils.getError('Nova.instance.setMetadata', error, response, body), body);
      return;
    }

    cb(null, mungeResponse(body));
  });
};



// ----------------
// Flavor
// ----------------
Nova.prototype.listFlavors = function(cb)
{
  var flavors_array = [];
  var request_options = this.getRequestOptions('/flavors/detail', true);
  request_options.logPath = 'api-calls.nova.flavors-list';

  this.request.get(request_options, function(error, response, body){
    if(osutils.isError(error, response) || !body.flavors)
    {
      cb(osutils.getError('Nova.flavor.list', error, response, body));
      return;
    }
    //else we need to arrayify munge the response(s)

    for(var n = 0; n < body.flavors.length; n++)
    {
      flavors_array[n] = mungeResponse(body.flavors[n])
    }

    cb(null, flavors_array);
  });
};



Nova.prototype.getFlavor = function(id, cb)
{
  var request_options = this.getRequestOptions('/flavors/' + escape(id), true);
  request_options.logPath = 'api-calls.nova.flavors-get';

  this.request.get(request_options, function(error, response, body){
    if(osutils.isError(error, response) || !body.flavor)
    {
      cb(osutils.getError('Nova.flavor.get', error, response, body));
      return;
    }

    cb(null, mungeResponse(body.flavor));
  });
};



// ----------------
// Floating IP
// ----------------
Nova.prototype.listFloatingIps = function(cb)
{
  var ip_array = [];
  var request_options = this.getRequestOptions('/os-floating-ips', true);
  request_options.logPath = 'api-calls.nova.floating-ips-list';

  this.request.get(request_options, function(error, response, body){
    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Nova.floatingip.list', error, response, body));
      return;
    }

    if(body.floating_ips && body.floating_ips.length)
    {
      for(var i = 0 ; i < body.floating_ips.length; i++)
      {
        ip_array.push(mungeResponse(body.floating_ips[i]));
      }
    }

    cb(null, ip_array);
  });
};



Nova.prototype.getFloatingIp = function(id, cb)
{
  var request_options = this.getRequestOptions('/os-floating-ips/' + escape(id), true);
  request_options.logPath = 'api-calls.nova.floating-ips-get';

  this.request.get(request_options, function(error, response, body){
    if(osutils.isError(error, response) || !body.floating_ip)
    {
      cb(osutils.getError('Nova.floatingip.get', error, response, body));
      return;
    }

    cb(null, mungeResponse(body.floating_ip));
  });
};



//allocates then (if an instance id is specified in data) assigns an ip
//calls cb with the info on the created ip including the instance_id if it was assigned
Nova.prototype.createFloatingIp = function(data, cb)
{
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
    if(osutils.isError(error, response) || !body.floating_ip)
    {
      cb(osutils.getError('Nova.floatingip.create', error, response, body));
      return;
    }
    ip_object = mungeResponse(body.floating_ip);
    
    cb(null, ip_object)
  });
};



Nova.prototype.removeFloatingIp = function(id, cb)
{
  var request_options = this.getRequestOptions('/os-floating-ips/' + escape(id), true);
  request_options.logPath = 'api-calls.nova.floating-ips-remove';

  this.request.del(request_options, function(error, response, body){
    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Nova.floatingip.remove', error, response, body));
      return;
    }

    cb(null, mungeResponse(body));
  });
};



Nova.prototype.associateFloatingIp = function(instance_id, address, cb)
{
  var data = {addFloatingIp: {'address': address}};
  var request_options = this.getRequestOptions('/servers/' + escape(instance_id) + '/action', data);
  request_options.logPath = 'api-calls.nova.floating-ips-associate';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Nova.floatingip.associate', error, response, body));
      return;
    }
    
    cb(null, mungeResponse(body));
  });
};



Nova.prototype.disassociateFloatingIp = function(instance_id, address, cb)
{
  var data = {removeFloatingIp: {'address': address}};
  var request_options = this.getRequestOptions('/servers/' + escape(instance_id) + '/action', data);
  request_options.logPath = 'api-calls.nova.floating-ips-disassociate';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Nova.floatingip.disassociate', error, response, body));
      return;
    }

    cb(null, mungeResponse(body));
  });
};




// ----------------
// Floating IP Pool
// ----------------
Nova.prototype.listIpPools = function(cb)
{
  var return_array = [];
  var request_options = this.getRequestOptions('/os-floating-ip-pools', true);
  request_options.logPath = 'api-calls.nova.ip-pool-list';

  this.request.get(request_options, function(error, response, body){
    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Nova.ippool.list', error, response, body));
      return;
    }

    if(body.floating_ip_pools)
    {
      return_array = body.floating_ip_pools;
    }
    //we apparently need to munge the data a little to get it into the standard format
    for(var n = 0; n<return_array.length; n++)
    {
      return_array[n].id = return_array[n].name;
      delete return_array[n].name;
    }

    cb(null, return_array);
  });
};



//since theres apparently no getIpPool info method in the nova api...
Nova.prototype.getIpPool = function(id, cb)
{
  this.listIpPools(function(err, pools){
    if(err)
    {
      cb(err);
      return;
    }
    
    for(var i = 0; i < pools.length; i++)
    {
      if(pools[i].id == id)
      {
        cb(null, pools[i]);
        return;
      }
    }
    
    var error = new errors.NotFoundError(); 
    cb(error);
  });
};



// ----------------
// Zone
// ----------------
Nova.prototype.listZones = function(cb){
  var return_array = [];
  var zone = {};
  var request_options = this.getRequestOptions('/os-availability-zone', true);
  request_options.logPath = 'api-calls.nova.zone-list';

  this.request.get(request_options, function(error, response, body){
    if(osutils.isError(error, response) || util.isArray(body.availabilityZoneInfo) == false)
    {
      cb(osutils.getError('Nova.zone.list', error, response, body));
      return;
    }
    
    //we are going to normalize the response a bit and include an id
    for(var n = 0; n < body.availabilityZoneInfo.length; n++)
    {
      zone = body.availabilityZoneInfo[n];
      return_array[n] = {id: zone.zoneName, name: zone.zoneName, available: zone.zoneState.available};
    }

    cb(null, return_array);
  });
};



//and since there is no method to get zone info in the nova api...
Nova.prototype.getZone = function(id, cb){
  var error = {};

  this.listZones(function(err, zones){
    if(err)
    {
      cb(err);
      return;
    }

    for(var i = 0; i < zones.length; i++)
    {
      if(zones[i].id == id)
      {
        cb(null, zones[i]);
        return;
      }
    }

    var error = new errors.NotFoundError();
    cb(error);
  });
}



// ---------------
// Key
// ---------------
Nova.prototype.listSSHKeys = function(cb){
  var return_array = [];
  var request_options = this.getRequestOptions('/os-keypairs', true);
  request_options.logPath = 'api-calls.nova.ssh-key-list';

  this.request.get(request_options, function(error, response, body){
    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Nova.sshkey.list', error, response, body));
      return;
    }

    if(body.keypairs && body.keypairs.length)
    {
      for(var n = 0; n < body.keypairs.length; n++)
      {
        return_array[n] = mungeResponse(body.keypairs[n].keypair);
      }
    }

    cb(null, return_array);
  });
};



Nova.prototype.getSSHKey = function(id, cb){
  var request_options = this.getRequestOptions('/os-keypairs/' + id, true);
  request_options.logPath = 'api-calls.nova.ssh-key-get';

  this.request.get(request_options, function(error, response, body){
    if(osutils.isError(error, response) || !body.keypair)
    {
      cb(osutils.getError('Nova.getSSHKey', error, response, body));
      return;
    }
    
    cb(null, mungeResponse(body.keypair));
  });
};



Nova.prototype.createSSHKey = function(name, public_key, cb)
{
  var data = {};
  var request_options = {};

  data = {keypair: {'name': name}};
  if(public_key)
  {
    data.keypair.public_key = public_key;
  }
  request_options = this.getRequestOptions('/os-keypairs', data);
  request_options.logPath = 'api-calls.nova.ssh-key-create';

  this.request.post(request_options, function(error, response, body){
    if(osutils.isError(error, response) || !body.keypair)
    {
      cb(osutils.getError('Nova.createSSHKey', error, response, body));
      return;
    }

    cb(null, mungeResponse(body.keypair));
  });
};



Nova.prototype.removeSSHKey = function(id, cb)
{
  var request_options = this.getRequestOptions('/os-keypairs/' + id, true);
  request_options.logPath = 'api-calls.nova.ssh-key-remove';

  this.request.del(request_options, function(error, response, body){
    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Nova.removeSSHKey', error, response, body));
      return;
    }

    //ummm... send back nothing?  I wonder what the actual response returns
    cb();
  });
};




// ---------------
// Quota/Usage
// ---------------
Nova.prototype.getQuota = function(tenant_id, cb){
  var request_options = this.getRequestOptions('/os-quota-sets/' + escape(tenant_id), true);
  request_options.logPath = 'api-calls.nova.quota-get';

  this.request.get(request_options, function(error, response, body){
    if(osutils.isError(error, response) || !body.quota_set)
    {
      cb(osutils.getError('Nova.quota.list', error, response, body));
      return;
    }

    cb(null, mungeResponse(body.quota_set));
  });
};



Nova.prototype.getUsage = function(tenant_id, cb)
{
  var url =  '/os-simple-tenant-usage/' + escape(tenant_id);
  var start = new Date();
  var end = new Date();
  // OpenStack Icehouse requires sending start & end dates now...
  end.setTime(end.getTime()+86400*2*1000);
  // %Y-%m-%d %H:%M:%S.%f
  url += '?start=' + start.toISOString().replace('T',' ').replace('Z','');
  url += '&end=' + end.toISOString().replace('T',' ').replace('Z','');

  var request_options = this.getRequestOptions(url, true);
  request_options.logPath = 'api-calls.nova.usage-get';

  this.request.get(request_options, function(error, response, body){
    var server;
    var usages = [];
    var return_object = {local_gb: 0, memory_mb: 0, vcpus: 0, instances: 0, flavors: {}};

    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Nova.usage.list', error, response, body));
      return;
    }

    if(body.tenant_usage && body.tenant_usage.server_usages)
    {
      usages = body.tenant_usage.server_usages;
    }

    for(var n = 0; n < usages.length; n++)
    {
      server = usages[n];

      return_object.instances++;
      return_object.local_gb += server.local_gb;
      return_object.memory_mb += server.memory_mb;
      return_object.vcpus += server.vcpus;
      if(!return_object.flavors[server.flavor])
      {
        return_object.flavors[server.flavor] = 1;
      }
      else
      {
        return_object.flavors[server.flavor]++;
      }
    }

    cb(null, return_object);
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
    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Nova.securityGroup.assignNameToInstance', error, response, body));
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
    if(osutils.isError(error, response))
    {
      cb(osutils.getError('Nova.securityGroup.removeNameFromInstance', error, response, body));
      return;
    }

    //should send back a 202 w/o a body so just send back true
    cb(null, true);
  });
};



module.exports = Nova;
