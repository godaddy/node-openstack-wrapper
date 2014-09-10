var util = require('util');

function errorBuilder(code, message, status)
{
  var customError = function(detail)
  {
    if(!detail)
    {
      detail = '';
    }

    Error.captureStackTrace(this, arguments.callee);
    this.code = code;
    this.message = message;
    this.status = status;
    this.detail = detail;
  }

  util.inherits(customError, Error);
  return customError;
}


module.exports = {
  GenericError:         errorBuilder('GenericError',         'Generic Error',               500),
  ApiError:             errorBuilder('ApiError',             'API Error',                   500),

  InvalidStateError:    errorBuilder('InvalidStateError',    'Invalid State',               400),
  NotImplementedError:  errorBuilder('NotImplementedError',  'Not Implemented',             501),
  UnavailableError:     errorBuilder('UnavailableError',     'Unavailable',                 503),

  AuthServerError:      errorBuilder('AuthServerError',      'Auth Server Error',           500),
  AuthUnavailableError: errorBuilder('AuthUnavailableError', 'Auth Server Unavailable',     500),
  NotLoggedInError:     errorBuilder('NotLoggedInError',     'Not logged in',               401),
  ForbiddenError:       errorBuilder('ForbiddenError',       'Forbidden',                   403),

  BadRequestError:      errorBuilder('BadRequestError',      'Bad Request',                 400),
  InvalidIdError:       errorBuilder('InvalidIdError',       'Invalid Resource Identifier', 400),
  NotFoundError:        errorBuilder('NotFoundError',        'Not Found',                   404),
  BadMethodError:       errorBuilder('BadMethodError',       'Bad Method',                  405),
  LimitExceededError:   errorBuilder('LimitExceededError',   'Limit Exceeded',              413),
  BadMediaError:        errorBuilder('BadMediaError',        'Unsupported Media Type',      415),
  ValidationError:      errorBuilder('ValidationError',      'Validation Error',            422),
}
