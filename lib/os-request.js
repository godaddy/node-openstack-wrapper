//just a wrapper for the request object with some extra metrics stuff thrown on top
var Request = require('request');


//given a deep object and a nested property string 'a.b.c.d' send back the value with a default of defaultValue
//basically lets avoid (if x && x.a && x.a.b && x.a.b.c)
function _getNestedPropValue(obj, nestedProperty, defaultValue) 
{
  return nestedProperty.split('.').reduce(function(accum, currentProperty, index, arr) {
    // check if it exists, if not, return the default value (aka accum)
    if(obj && typeof obj[currentProperty] !== 'undefined' && obj[currentProperty] !== null)
    {
      // last one, return its value
      if(index === arr.length - 1)
      {
        return obj[currentProperty];
      }
      else
      {
        obj = obj[currentProperty];
        return accum; 
      }
    }
    else
    {
      return accum;
    }
  }, defaultValue);
}



//given all the pieces of a remote request and the knowledge that an error occured
//this function returns a proper error object but with some extra props
//to use just pass in as much of this stuff as you have
//normally just used in gdrequest but can be used elswhere when raw request is needed (hence in util)
//return error is in following format:
//it will also return a true error object in the following format
//{
//  message: 'verbal description of what went wrong',
//  stack: '[message]: stack track shown here',
//  code: 'ALLCAPSCODE',
//  detail:
//  {
//    remoteMethod: 'GET',
//    remoteURI: 'http://odds.are.some.url/index.html',
//    remoteStatusCode: 404
//    remoteMessage: 'verbal message parsed from remote response - should be a string',
//    remoteCode: 'PARSEDFROMRESPONSE'
//    remoteDetail: 'also parsed from remote response - should be a string',
//    responseTime: 2.22
//  }
//}
function _getRequestError(error, response, body, request_options, response_time)
{
  var return_error = null;
  var message = '';
  var code = 'REMOTEERROR';
  var detail = {};
  var remote_method = '';
  var remote_uri = '';
  var remote_status_code = 0;
  var remote_message = '';
  var remote_code = '';
  var remote_detail = '';
  var key = '';

  
  //first the message and code for the actual error - should reflect what went wrong
  //not what the remote api sent as a message/code (thats remote message and remote code)
  if(error && error.message)
  {
    message = error.message;
  }
  else if(response && response.statusCode && (response.statusCode <= 199 || response.statusCode >= 300))
  {
    message = 'Invalid status (' + response.statusCode + ') from remote call';
  }
  else if(request_options && request_options.requireBodyObject && _getNestedPropValue(body, request_options.requireBodyObject, 'nope-nope-nope') == 'nope-nope-nope')
  {
    message = 'Invalid format (' + request_options.requireBodyObject + ') missing from remote call';
  }
  else
  {
    message = 'Unknown error making remote call';
  }
  
  
  //get the remote method from the data we have
  if(response && response.request && response.request.method)
  {
    remote_method = response.request.method;
  }
  else if(request_options && request_options.method)
  {
    remote_method = request_options.method;
  }
  else
  {
    remote_method = 'indeterminable';
  }
  
  
  //get the uri if possible
  if(response && response.request && response.request.uri && response.request.uri.href)
  {
    remote_uri = response.request.uri.href;
  }
  else if(request_options && request_options.uri)
  {
    remote_uri = request_options.uri;
  }
  else if(request_options && (request_options.host || request_options.path))
  {
    //its fine if one or more of these is blank/undefined - doing our best here is all
    remote_uri = request_options.host + ':' + request_options.port + request_options.path;
  }
  else
  {
    remote_uri = 'indeterminable';
  }
  
  
  //now the status that came from the response
  if(response && response.statusCode)
  {
    remote_status_code = response.statusCode;
  }
  
  
  //now for the remote message - get whatever you can from wherever you can
  if(body && body.message)
  {
    remote_message = body.message;
  }
  else if(body)
  {
    for(key in body)
    {
      //body.key check takes care of null which can't be hasOwnProperty'd apparently
      if(body.hasOwnProperty(key) && body[key] && body[key].hasOwnProperty('message'))
      {
        remote_message = body[key].message;
      }
    }
  }
  //and as a last resort
  if(body && !remote_message)
  {
    //toss a little of the body on there - limit this so we don't spew mountains of html to the logs
    remote_message = JSON.stringify(body).substring(0, 150);
  }
  //else its just blank as theres no remote body at all
  
  
  //look for an error code returned from the remote api
  if(body && body.code)
  {
    remote_code = body.code;
  }
  else if(body)
  {
    for(key in body)
    {
      //body.key check takes care of null which can't be hasOwnProperty'd apparently
      if(body.hasOwnProperty(key) && body[key] && body[key].hasOwnProperty('code'))
      {
        remote_code = body[key].code;
      }
    }
  }
  //else it can just be blank
  
  
  //get remote details
  if(body && body.detail)
  {
    remote_detail = body.detail;
  }
  else if(body)
  {
    for(key in body)
    {
      //body.key check takes care of null which can't be hasOwnProperty'd apparently
      if(body.hasOwnProperty(key) && body[key] && body[key].hasOwnProperty('detail'))
      {
        remote_detail = body[key].detail;
      }
    }
  }
  //else it can just be blank


  //now we can craft the detail prop for the error
  detail.remoteMethod = remote_method;
  detail.remoteURI = remote_uri;
  detail.remoteStatusCode = remote_status_code
  detail.remoteMessage = remote_message;
  detail.remoteCode = remote_code;
  detail.remoteDetail = remote_detail;
  if(response_time)
  {
    detail.responseTime = response_time;
  }
  else
  {
    detail.responseTime = 0;
  }
  
  
  //now that we have all the things - construct the error (or use existing error) and return it
  if(error)
  {
    return_error = error;
    return_error.message = message;//could have changed
  }
  else
  {
    return_error = new Error(message);
  }
  return_error.code = code;
  return_error.detail = detail;
  
  //console.log('returning error', return_error);
  return return_error;
}



//A 'private' function that does the actual request - here just to prevent me from duplicating code
//to use this class you should use the request or one of the helper functions below
//if a 'logPath' has been specified, a call is sent to the metrics system once the main call is complete to log the time
function _actualRequest(options, callback){
  var process_time = process.hrtime();

  if(options.timeout)
  {
    options.timeout = parseInt(options.timeout);
  }
  else
  {
    options.timeout = 20000;
  }
  
  
  Request(options, function(error, response, body){
    //no matter the result we want to log this remote call
    process_time = process.hrtime(process_time);
    var process_time_in_seconds = process_time[0] + (process_time[1]/1e9);
    var response_time = parseFloat(process_time_in_seconds.toFixed(3));
    var user_name = ''; //originating user - purely for logging
    var request_id = ''; //originating request id - purely for logging
    var metric_path = ''; //metric path to identify the specific call being made
    var status_code = 0;
    
    //first handle debugging
    if(options.debug)
    {
      console.log('request options:', options);
      console.log('response body:', body);
      if(response && response.statusCode)
      {
        console.log('response status: ', response.statusCode);
      }
    }
    
    //get all the things we will need for logging and error checking
    if(response && response.statusCode)
    {
      status_code = response.statusCode;
    }
    
    
    //if a logger was a specified lets use that and dig out some info to log thats usually specified in the options
    //unless a custom logger is specified though nothing will occur here
    if(options.metricLogger)
    {
      if(options.metricUserName)
      {
        user_name = options.metricUserName;
      }
      if(options.metricRequestID)
      {
        request_id = options.metricRequestID;
      }
      if(options.metricPath)
      {
        metric_path = options.metricPath;
      }
      
      options.metricLogger.logMetric({
        metricPath: metric_path,
        requestVerb: options.method,
        requestURL: options.uri,
        statusCode: status_code,
        responseTime: response_time,
        userName: user_name,
        requestID: request_id
      });
    }
    
    
    if(error)
    {
      //we got an error straight off the bat  - add some extras to it and send back an error
      error = _getRequestError(error, response, body, options, response_time)
    }
    else if((options.validateStatus || options.requireValidStatus) && (status_code <= 199 || status_code >= 300))
    {
      //We have a response but not the status the options specified - send back an error
      error = _getRequestError(error, response, body, options, response_time);
    }
    else if(options.requireBodyObject && _getNestedPropValue(body, options.requireBodyObject, 'nope-nope-nope') == 'nope-nope-nope')
    {
      //we have a response but not the format the options specified - send back an error
      error = _getRequestError(error, response, body, options, response_time);
    }    
    
    callback(error, response, body);
  });
};




//All functions should mimic functionality of the npm lib 'Request'
//we are adding 2 additional pieces of functionality based on extra 'options' properties
//1) options.validateStatus will return an error object if status is outside of 2xx range
//2) options.requireBodyObject will return an error object if the body doesn't contain the given json path/object

//addtionally if replacing this lib with a custom version to enable logging you can expect the following
//3 options to always exist  --  options.metricUserName, options.metricRequestID and options.metricPath
var request = {
  get: function(options, callback){
    options.method = 'GET';
    _actualRequest(options, callback);
  },

  post: function(options, callback){
    options.method = 'POST';
    _actualRequest(options, callback);
  },

  patch: function(options, callback){
    options.method = 'PATCH';
    _actualRequest(options, callback);
  },
  
  put: function (options, callback){
    options.method = 'PUT';
    _actualRequest(options, callback);
  },
  
  del: function(options, callback){
    options.method = 'DELETE';
    _actualRequest(options, callback);
  },
  
  request: function(options, callback){
    //make the call with the method already set
    _actualRequest(options, callback);
  }
};


module.exports = request;
