//This is a helper lib/obj that contains some unility functions used throughout the various components


//getArgsWithCallback is to be used in overloaded functions to allow you to easily assign
//function variables when you don't know how many are actually passed in. Takes as input 
//the highest number of arguments the function expects and the actual arguments used.
//the return value will be an array whose last element is the last element in the passed in 
//arguments and whose length equals the passed in expected length based on the function signature
//I.E.:
//  getArgsWithCallback(2, ["param1"])
//  will return [null, "param1"]
 function getArgsWithCallback(expected_length, arg_obj) {
  var return_args = [];
  var i = 0;
  var cb = null;
  var arg_array = Array.prototype.slice.call(arg_obj);

  if(Array.isArray(arg_array))
  {
    cb = arg_array.pop();

    for(i=0; i < expected_length - 1; i++)
    {
      if(arg_array[i] == undefined)
      {
        arg_array[i] = null;
      }

      return_args[i] = arg_array[i];
    }

    return_args[expected_length - 1] = cb;

  }

  return return_args;
}


module.exports = {
  getArgsWithCallback: getArgsWithCallback
}

