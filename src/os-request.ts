// just a wrapper for the request object with some extra metrics stuff thrown on top
import Request from 'request';

// given a deep object and a nested property string 'a.b.c.d' send back the value with a default of defaultValue
// basically lets avoid (if x && x.a && x.a.b && x.a.b.c)
function _getNestedPropValue<T>(obj: { [key: string]: unknown }, nestedProperty: string, defaultValue: T) {
	return nestedProperty.split('.').reduce((accum, currentProperty, index, arr) => {
		// check if it exists, if not, return the default value (aka accum)
		if (obj && typeof obj[currentProperty] !== 'undefined' && obj[currentProperty] !== null) {
			// last one, return its value
			if (index === arr.length - 1) {
				return obj[currentProperty] as T;
			} else {
				obj = obj[currentProperty] as { [key: string]: unknown };
				return accum;
			}
		} else {
			return accum;
		}
	}, defaultValue);
}

export interface IDetail {
	remoteMethod: string; remoteURI: string;
	remoteStatusCode: number;
	remoteMessage: string;
	remoteCode: string;
	remoteDetail: string;
	responseTime: number;
}

interface IError extends Error {
	code: string;
	detail: IDetail;
}

interface IRequestOptions {
	requireBodyObject?: string;
	method?: string;
	uri: string;
	host?: string;
	path?: string;
	port?: number;
}

interface IBody {
	message?: string;
	code?: string;
	detail?: string;
	[key: string]: unknown | Error;
}

// given all the pieces of a remote request and the knowledge that an error occured
// this function returns a proper error object but with some extra props
// to use just pass in as much of this stuff as you have
// normally just used in gdrequest but can be used elswhere when raw request is needed (hence in util)
// return error is in following format:
// it will also return a true error object in the following format
// {
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
// }
function _getRequestError(error: IError, response: Request.Response, body: IBody, request_options: IRequestOptions, response_time: number) {
	let return_error = null as unknown as IError;
	let message = '';
	const code = 'REMOTEERROR';
	const detail = {} as IDetail;
	let remote_method = '';
	let remote_uri = '';
	let remote_status_code = 0;
	let remote_message = '';
	let remote_code = '';
	let remote_detail = '';
	let key = '';


	// first the message and code for the actual error - should reflect what went wrong
	// not what the remote api sent as a message/code (thats remote message and remote code)
	if (error && error.message) {
		message = error.message;
	} else if (response && response.statusCode && (response.statusCode <= 199 || response.statusCode >= 300)) {
		message = 'Invalid status (' + response.statusCode + ') from remote call';
	} else if (request_options && request_options.requireBodyObject && _getNestedPropValue(body, request_options.requireBodyObject, 'nope-nope-nope') === 'nope-nope-nope') {
		message = 'Invalid format (' + request_options.requireBodyObject + ') missing from remote call';
	} else {
		message = 'Unknown error making remote call';
	}


	// get the remote method from the data we have
	if (response && response.request && response.request.method) {
		remote_method = response.request.method;
	} else if (request_options && request_options.method) {
		remote_method = request_options.method;
	} else {
		remote_method = 'indeterminable';
	}


	// get the uri if possible
	if (response && response.request && response.request.uri && response.request.uri.href) {
		remote_uri = response.request.uri.href;
	} else if (request_options && request_options.uri) {
		remote_uri = request_options.uri;
	} else if (request_options && (request_options.host || request_options.path)) {
		// its fine if one or more of these is blank/undefined - doing our best here is all
		remote_uri = request_options.host + ':' + request_options.port + request_options.path;
	} else {
		remote_uri = 'indeterminable';
	}


	// now the status that came from the response
	if (response && response.statusCode) {
		remote_status_code = response.statusCode;
	}

	// now for the remote message - get whatever you can from wherever you can
	if (body && body.message) {
		remote_message = body.message;
	} else if (body) {
		for (key in body) {
			// body.key check takes care of null which can't be hasOwnProperty'd apparently
			if (body.hasOwnProperty(key) && body[key] && (body[key] as IError).hasOwnProperty('message')) {
				remote_message = (body[key] as IError).message;
			}
		}
	}
	// and as a last resort
	if (body && !remote_message) {
		// toss a little of the body on there - limit this so we don't spew mountains of html to the logs
		remote_message = JSON.stringify(body).substring(0, 150);
	}
	// else its just blank as theres no remote body at all


	// look for an error code returned from the remote api
	if (body && body.code) {
		remote_code = body.code;
	} else if (body) {
		for (key in body) {
			// body.key check takes care of null which can't be hasOwnProperty'd apparently
			if (body.hasOwnProperty(key) && body[key] && (body[key] as {}).hasOwnProperty('code')) {
				remote_code = (body[key] as { code: string }).code;
			}
		}
	}
	// else it can just be blank


	// get remote details
	if (body && body.detail) {
		remote_detail = body.detail;
	} else if (body) {
		for (key in body) {
			// body.key check takes care of null which can't be hasOwnProperty'd apparently
			if (body.hasOwnProperty(key) && body[key] && (body[key] as {}).hasOwnProperty('detail')) {
				remote_detail = (body[key] as { detail: string }).detail;
			}
		}
	}
	// else it can just be blank


	// now we can craft the detail prop for the error
	detail.remoteMethod = remote_method;
	detail.remoteURI = remote_uri;
	detail.remoteStatusCode = remote_status_code;
	detail.remoteMessage = remote_message;
	detail.remoteCode = remote_code;
	detail.remoteDetail = remote_detail;
	if (response_time) {
		detail.responseTime = response_time;
	} else {
		detail.responseTime = 0;
	}


	// now that we have all the things - construct the error (or use existing error) and return it
	if (error) {
		return_error = error;
		return_error.message = message;// could have changed
	} else {
		return_error = new Error(message) as IError;
	}
	return_error.code = code;
	return_error.detail = detail;

	// console.log('returning error', return_error);
	return return_error;
}

export interface IMetricLogger {
	logMetric(options: {
		metricPath: string;
		requestID: string;
		requestURL: string;
		requestVerb: string;
		responseTime: number;
		statusCode: number;
		userName: string;
	}): void;
}

export interface IOptions {
	host?: string;
	path?: string;
	port?: number;
	// url: string | Url;
	// uri: string | Url;
	uri: string;
	debug?: boolean;
	validateStatus?: boolean;
	requireValidStatus?: boolean;
	requireBodyObject?: string;
	timeout?: number;
	metricLogger?: IMetricLogger | null;
	metricUserName?: string;
	metricRequestID?: string;
	metricPath?: string;
	method: string;
	// baseUrl?: string;
	// jar?: CookieJar | boolean;
	// formData?: { [key: string]: any };
	// form?: { [key: string]: any } | string;
	// auth?: AuthOptions;
	// oauth?: OAuthOptions;
	// aws?: AWSOptions;
	// hawk?: HawkOptions;
	qs?: unknown;
	// qsStringifyOptions?: any;
	// qsParseOptions?: any;
	json?: unknown;
	// jsonReviver?: (key: string, value: any) => any;
	// jsonReplacer?: (key: string, value: any) => any;
	// multipart?: RequestPart[] | Multipart;
	// agent?: http.Agent | https.Agent;
	// agentOptions?: http.AgentOptions | https.AgentOptions;
	// agentClass?: any;
	// forever?: any;
	headers?: { [key: string]: string; };
	// body?: any;
	// family?: 4 | 6;
	// followRedirect?: boolean | ((response: http.IncomingMessage) => boolean);
	// followAllRedirects?: boolean;
	// followOriginalHttpMethod?: boolean;
	// maxRedirects?: number;
	// removeRefererHeader?: boolean;
	// encoding?: string | null;
	// pool?: any;
	// localAddress?: string;
	// proxy?: any;
	// tunnel?: boolean;
	// strictSSL?: boolean;
	// rejectUnauthorized?: boolean;
	// time?: boolean;
	// gzip?: boolean;
	// preambleCRLF?: boolean;
	// postambleCRLF?: boolean;
	// withCredentials?: boolean;
	// key?: Buffer;
	// cert?: Buffer;
	// passphrase?: string;
	// ca?: string | Buffer | string[] | Buffer[];
	// har?: HttpArchiveRequest;
	// useQuerystring?: boolean;
}

// A 'private' function that does the actual request - here just to prevent me from duplicating code
// to use this class you should use the request or one of the helper functions below
// if a 'logPath' has been specified, a call is sent to the metrics system once the main call is complete to log the time
function _actualRequest<T>(options: IOptions) {
	return new Promise<{
		res: Request.Response;
		body: T;
	}>((res, rej) => {
		let process_time = process.hrtime();

		options.timeout = options.timeout || 20000;

		Request(options, (error: IError, response, body: T) => {
			// no matter the result we want to log this remote call
			process_time = process.hrtime(process_time);
			const process_time_in_seconds = process_time[0] + (process_time[1] / 1e9);
			const response_time = parseFloat(process_time_in_seconds.toFixed(3));
			let user_name = ''; // originating user - purely for logging
			let request_id = ''; // originating request id - purely for logging
			let metric_path = ''; // metric path to identify the specific call being made
			let status_code = 0;

			// first handle debugging
			if (options.debug) {
				console.log('request options:', options);
				console.log('response body:', body);
				if (response && response.statusCode) {
					console.log('response status: ', response.statusCode);
				}
			}

			// get all the things we will need for logging and error checking
			if (response && response.statusCode) {
				status_code = response.statusCode;
			}

			// if a logger was a specified lets use that and dig out some info to log thats usually specified in the options
			// unless a custom logger is specified though nothing will occur here
			if (options.metricLogger) {
				if (options.metricUserName) {
					user_name = options.metricUserName;
				}
				if (options.metricRequestID) {
					request_id = options.metricRequestID;
				}
				if (options.metricPath) {
					metric_path = options.metricPath;
				}

				options.metricLogger.logMetric({
					metricPath: metric_path,
					requestID: request_id,
					requestURL: options.uri,
					requestVerb: options.method,
					responseTime: response_time,
					statusCode: status_code,
					userName: user_name
				});
			}

			if (error) {
				// we got an error straight off the bat  - add some extras to it and send back an error
				error = _getRequestError(error, response, body, options, response_time);
			} else if ((options.validateStatus || options.requireValidStatus) && (status_code <= 199 || status_code >= 300)) {
				// We have a response but not the status the options specified - send back an error
				error = _getRequestError(error, response, body, options, response_time);
			} else if (options.requireBodyObject && _getNestedPropValue(body, options.requireBodyObject, 'nope-nope-nope') === 'nope-nope-nope') {
				// we have a response but not the format the options specified - send back an error
				error = _getRequestError(error, response, body, options, response_time);
			}

			if (!error) {
				res({
					body,
					res: response
				});
			} else {
				rej(error);
			}
		});
	});
}

export type Options = Pick<IOptions, Exclude<keyof IOptions, 'method'>>;

// All functions should mimic functionality of the npm lib 'Request'
// we are adding 2 additional pieces of functionality based on extra 'options' properties
// 1) options.validateStatus will return an error object if status is outside of 2xx range
// 2) options.requireBodyObject will return an error object if the body doesn't contain the given json path/object

// addtionally if replacing this lib with a custom version to enable logging you can expect the following
// 3 options to always exist  --  options.metricUserName, options.metricRequestID and options.metricPath
export async function get<T>(options: Options) {
	const { body } = await _actualRequest<T>({
		...options,
		method: 'GET'
	});
	return body;
}

export async function post<T>(options: Options) {
	const { body } = await _actualRequest<T>({
		...options,
		method: 'POST'
	});
	return body;
}

export async function patch<T>(options: Options) {
	const { body } = await _actualRequest<T>({
		...options,
		method: 'PATCH'
	});
	return body;
}

export async function put<T>(options: Options) {
	const { body } = await _actualRequest<T>({
		...options,
		method: 'PUT'
	});
	return body;
}

export async function del<T>(options: Options) {
	const { body } = await _actualRequest<T>({
		...options,
		method: 'DELETE'
	});
	return body;
}

export function request<T>(options: IOptions) {
	// make the call with the method already set
	return _actualRequest<T>(options);
}
