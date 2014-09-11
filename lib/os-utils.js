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
    return_error = errors.BadRequestError(body.badRequest.message);
  }
  else if(body.unauthorized)
  {
    return_error = errors.NotLoggedInError(body.unauthorized.message);
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



module.exports = {
  isError: isError,
  getError: getError
}
