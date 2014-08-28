//this default mangler object does nothing at all - just returns what you give it
//feel free to mangle at your own desire to help improve openstacks sort of randmized response types
function mangleObject(obj_type, obj)
{
  return obj;
}


module.exports = {
  mangleObject: mangleObject
}
