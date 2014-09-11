var util = require('util');

function OpenStackError() {
  throw new Error('This class is only for extending, do not create one directly.');
};

util.inherits(OpenStackError, Error);

module.exports.OpenStackError = OpenStackError;

function defineError(code, message, status)
{
  var customError = function(detail) {
    Error.captureStackTrace(this, arguments.callee);
    this.code = code;
    this.message = message;
    this.status = status;
    this.detail = detail;
  }

  util.inherits(customError, OpenStackError);
  module.exports[code] = customError;
}

defineError('BadRequestError',      'Bad Request',                 400);
defineError('InvalidStateError',    'Invalid State',               400);
defineError('NotLoggedInError',     'Not logged in',               401);
defineError('ForbiddenError',       'Forbidden',                   403);
defineError('NotFoundError',        'Not Found',                   404);
defineError('BadMethodError',       'Bad Method',                  405);
defineError('LimitExceededError',   'Limit Exceeded',              413);
defineError('BadMediaError',        'Unsupported Media Type',      415);
defineError('ValidationError',      'Validation Error',            422);

defineError('GenericError',         'Generic Error',               500);
defineError('NotImplementedError',  'Not Implemented',             501);
defineError('UnavailableError',     'Unavailable',                 503);

