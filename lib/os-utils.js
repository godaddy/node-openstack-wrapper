//This is a helper lib/obj that contains some unility functions used throughout the various components
var errors = require('./os-errors');


//checks the error and the response code to see if the result of the response call is an error
function isError(error, response)
{
  var return_boolean = false;
  var status_code = 500;
  if(response && response.statusCode)
  {
    status_code = response.statusCode;
  }

  if(error)
  {
    return_boolean = true;
  }
  else if(status_code <= 199 || status_code >= 300)
  {
    return_boolean = true;
  }

  return return_boolean;
}



//when using the request npm to talk to open stack, the errors returned aren't really standardized in a useful way
//so this returns a proper error object based on that info
//caller is just the calling function for logging purposes
//body should be but doesn't have to be json
function getError(caller, error, response, body)
{
  var return_error = null;
  var status_code = 0;

  if(response && response.statusCode)
  {
    status_code = response.statusCode;
  }
  //log the issue before moving on
  //console.error(caller + ' fail(' + status_code + ')', error);

  if(error)
  {
    return_error = error;
  }
  else if(status_code == 401)
  {
    return_error = new errors.NotLoggedInError(JSON.stringify(body));
  }
  else if(status_code == 404)
  {
    return_error = new errors.NotFoundError(JSON.stringify(body));
    return_error.severity = 'trace';
  }
  else if(status_code == 500)
  {
    return_error = new errors.GenericError(JSON.stringify(body));
  }
  else if(body.badRequest)
  {
    return_error = new errors.BadRequestError(body.badRequest.message);
  }
  else if(body.unauthorized)
  {
    return_error = new errors.NotLoggedInError(body.unauthorized.message);
  }
  else if(body.forbidden)
  {
    return_error = new errors.ForbiddenError(body.forbidden.message);
  }
  else if(body.badMethod)
  {
    return_error = new errors.BadMethodError(body.badMethod.message);
  }
  else if(body.overLimit)
  {
    return_error = new errors.LimitExceededError(body.overLimit.message);
  }
  else if(body.badMediaType)
  {
    return_error = new errors.BadMediaError(body.badMediaType.message);
  }
  else if(body.unprocessableEntity)
  {
    return_error = new errors.ValidationError(body.unprocessableEntity.message);
  }
  else if(body.instanceFault)
  {
    return_error = new errors.GenericError(body.instanceFault.message);
  }
  else if(body.notImplemented)
  {
    return_error = new errors.NotImplementedError(body.notImplemented.message);
  }
  else if(body.serviceUnavailable)
  {
    return_error = new errors.UnavailableError(body.serviceUnavailable.message);
  }
  else if(body.itemNotFound)
  {
    //not sure why we do this?
    return_error = new errors.NotFoundError(body.itemNotFound.message);
    return_error.severity = 'trace';
  }
  else if(typeof body != "object")
  {
    return_error = new errors.GenericError("");
  }
  else
  {
    return_error = new errors.GenericError(JSON.stringify(body));
  }

  return return_error;
}


//checks the error and the response code to see if the result of the response call is an error
function isRequestError(error, response)
{
  var return_boolean = false;
  var status_code = 500;
  if(response && response.statusCode)
  {
    status_code = response.statusCode;
  }

  if(error)
  {
    return_boolean = true;
  }
  else if(status_code <= 199 || status_code >= 300)
  {
    return_boolean = true;
  }

  return return_boolean;
}


//when using the request npm to talk to open stack, the errors returned aren't really standardized in a useful way
//so this returns a proper error object based on that info
//caller is just the calling function for logging purposes
//body should be but doesn't have to be json
function getRequestError(error, response, body)
{
  var return_error = null;
  var status_code = 500;
  var error_code = '';
  var message = '';
  var detail = '';
  var key = '';
  var remote_method = 'unknown';
  var remote_uri = 'unknown';

  if(error)
  {
    //we have an actual error - just go with that
    return error;
  }
  
  //else try to construct a normal error with status, message, and detail
  //first deal with the status code
  if(response && response.statusCode)
  {
    status_code = response.statusCode;
  }
  
  if(response && response.request && response.request.method)
  {
    remote_method = response.request.method;
  }
  
  if(response && response.request && response.request.uri && response.request.uri.href)
  {
    remote_uri = response.request.uri.href;
  }
  
  //first try to get all the things from a normal payload
  if(body && body.message)
  {
    message = 'Remote Error: ' + body.message;
  }
  if(body && body.detail)
  {
    detail = body.detail;
  }
  if(body && body.code)
  {
    //note: this is usually same as status for openstack errors but might as well check for it
    error_code = body.code;
  }
  
  //if message is still blank and there is a body - look for an error burried under a propertie like
  //{badRequest: {message: 'blah'}}
  if(body && message == '')
  {
    for(key in body)
    {
      if(body.hasOwnProperty(key) && body[key].hasOwnProperty('message'))
      {
        message = body[key].message;
        if(body[key].detail)
        {
          detail = body[key].detail;
        }
        if(body[key].code)
        {
          error_code = body[key].code;
        }
      }
    }
  }
  
  //if message is still blank and there is a body - just grab all of that
  if(body && message == '')
  {
    message = JSON.stringify(body);
  }
  
  //if its still blank then just do some kind of default message
  if(message == '')
  {
    message = 'An Error Occured';
  }
  
  //add in the remote details into the details section to debugging
  //might be better as additional properties on the error... for now this is fine though
  detail = 'Remote Method: ' + remote_method + '\nRemote Uri: ' + remote_uri + '\nRemote Details: ' + detail;
  
  
  //now create the error
  return_error = new Error(message);
  return_error.status = status_code;
  return_error.detail = detail;
  if(error_code != '')
  {
    return_error.code = body.code;
  }
  
  //console.log('returning error', return_error);
  return return_error;
}

//utiltiy function to take the arguments provided to a function and 
//break them out based on the existence of a callback as the last arg
//and any number of preceding optional arguments
function getFuncArgsWithCallback() {
  var args = Array.prototype.slice.call(arguments);
  var accum = null;

  return args.reduceRight(function(accum, arg){
    // if accum is null, it means its the first time in loop, create it and arg should be the callback
    if(!accum) {
      accum = {};
      if(typeof arg == 'function')
      {
        accum.callback = arg;
      }
      else
      {
        accum.optionals = [arg];
      }
    }
    else
    {
      accum.optionals = accum.optionals || [];
      //linear time complexity, its understood that this wont be used with enough params to matter
      accum.optionals.unshift(arg);  
    }

    return accum;
   }, accum);
}


module.exports = {
  isError: isError,
  getError: getError,
  isRequestError: isRequestError,
  getRequestError: getRequestError,
  getFuncArgsWithCallback: getFuncArgsWithCallback
}
