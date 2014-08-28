var util = require('gd-util');

var subObjectIds = ['flavor','image'];
var rename = {
  // Values can be:
  // A string: rename the field
  // false: drop the field
  // A function: Give the field to the function and merge in the object it returns

  // General
  'self': false,
  'schema': false,

   // Server
  'hostId': 'host_id',
  'OS-EXT-AZ:availability_zone': 'zone_id',
  'OS-SRV-USG:launched_at': 'launched',
  'OS-SRV-USG:terminated_at': 'terminated',
  'OS-EXT-STS:power_state': 'power_state',
  'OS-EXT-STS:task_state': 'task_state',
  'OS-EXT-STS:vm_state': 'vm_state',
  'OS-EXT-IPS:type': 'type',
  'OS-EXT-IPS-MAC:mac_addr': 'mac_addr',
  'os-extended-volumes:volumes_attached': 'volumes',
  'addresses': mungeAddresses,
  'security_groups': mungeGroups,
  'metadata': 'meta_data',

  // Security Group
  'security_group_rules': 'rules',
  'protocol': 'ip_protocol',
  'ethertype': 'ether_type',

  // Image
  'created_at': 'created',
  'updated_at': 'updated',
  'image_type': 'type',
  'container_format': 'format',
  'min_ram': 'min_ram_mb',
  'min_disk': 'min_root_gb',
  'size': 'size_bytes',
  'instance_uuid': 'instance_id',
  'cyberark':     booleanifyAndRename.bind(null,'has_cyber_ark'),
  'logingroups':  booleanifyAndRename.bind(null,'has_login_groups'),
  'sudogroups':   booleanifyAndRename.bind(null,'has_sudo_groups'),
  'cloudinit':    booleanifyAndRename.bind(null,'has_cloud_init'),
  'bitnami':      booleanifyAndRename.bind(null,'has_bitnami'),


  // Flavor
  'ram': 'ram_mb',
  'swap': 'swap_mb',
  'disk': 'root_gb',
  'OS-FLV-EXT-DATA:ephemeral': 'ephemeral_gb',

  // SSH Key
  'public_key': parsePublicKey,

  // Floating IP
  'pool': 'pool_id',
};

var truthy = ['true','t','yes','y','1'];
function booleanify(value) {
  var cmp = (value+"").toLowerCase();
  return truthy.indexOf(cmp) >= 0;
}

function booleanifyAndRename(name,value) {
  var ret = {};
  ret[name] = booleanify(value);
  return ret;
}

function mungeAddresses(value, objKey, fullObj) {
  var keys = Object.keys(value);
  var key,addresses,address;
  for ( var i = 0; i < keys.length ; i++) 
  {
    key = keys[i];
    addresses = value[key];
    for ( var j = 0 ; j < addresses.length; j++ )
    {
      address = addresses[j];
      address.ip = address.addr;
      delete address.addr;
    }
  }

  return {addresses: value};
}

function mungeGroups(value, objKey, fullObj) {
  var out = [];
  if ( value && util.isArray(value) && value.length )
  {
    for ( var i = 0 ; i < value.length ; i++ )
    {
      out.push(value[i].name);
    }
  }

  return {security_groups: out};
}

function parsePublicKey(str, objKey, fullObj) {
  var match, type,  key, comment;

  var firstWord = parseInt(str.substr(0,str.indexOf(' ')),10);
  if ( isNaN(firstWord) )
  {
    // Newer keys, rsa2, dsa, ecdsa
    match = str.match(/^\s*([^ ]+)\s+([^ ]+)\s*(.*)\s*$/);
    key = match[2];
    comment = match[3];
    switch ( match[1].toLowerCase() ) {
      case 'ssh-rsa':             type = 'RSA';   break;
      case 'ecdsa-sha2-nistp256': type = 'ECDSA'; break;
      case 'ssh-dss':             type = 'DSA';   break;
      default: type = match[1];
    }
  }
  else
  {
    // Old keys, rsa1
    match = str.match(/^\s*(\d+\s+\d+\s+\d+)\s*(.*)\s*$/);
    key = match[1];
    comment = match[2];
    type = 'RSA1';
  }
  
  // @TODO have a better way of remapping name->id for just Keys than this... renamd above applies to all objects of any type.
  fullObj.id = fullObj.name;
  delete fullObj.name;

  return {
    type: type,
    comment: comment,
    public_key: str
  }
}

var renameKeys = Object.keys(rename);

module.exports = function mungeResponse(obj)
{
  if ( util.isArray(obj) )
  {
    for ( var i = 0 , len = obj.length ; i < len ; i++ )
    {
      obj[i] = mungeResponse(obj[i]);
    }
  }
  else if ( typeof obj == 'object' && obj !== null )
  {
    delete obj['links'];

    var keys = Object.keys(obj);
    var k,v;
    for ( var i = 0, len = keys.length ; i < len ; i++ )
    {
      k = keys[i];
      v = obj[k];

      if ( typeof v == 'object'  && obj !== null )
        obj[k] = mungeResponse(v);

      if ( subObjectIds.indexOf(k) >= 0 && v && v.id )
      {
        obj[k+'_id'] = v.id;
        delete obj[k];
      }
      else if ( renameKeys.indexOf(k) >= 0 )
      {
        delete obj[k];
        if ( rename[k] === false )
          continue;
        if ( typeof rename[k] === 'string' )
          obj[ rename[k] ] = v;
        else if ( typeof rename[k] == 'function' )
          util.mergeInPlace(obj, rename[k](v,k,obj));
        else
          throw new Error("I don't know what to do with rename["+k+"] = " + rename[k]);

      }
    }
  }

  return obj;
}
