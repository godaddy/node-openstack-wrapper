import { IMetricLogger } from './os-request';
import * as Request from './os-request';
import { default_timeout } from './utils';

// Class to handle all Heat methdology
// NOTE: This class was created after v2.1.10
// and so mangling is no longer supported or required to be programmed in below

interface IStack {
	// todo
	todo: unknown;
}

export default class Heat {
	private url: string;
	private token: string;
	private timeout = default_timeout;
	private request_id = '';
	private user_name = '';
	private logger = null as unknown as IMetricLogger;
	private request = Request;
	constructor(endpoint_url: string, auth_token: string) {
		// endpoint_url should come from the keystone projectInfo call - also yank all the trailing slashes in case folks get clever
		this.url = endpoint_url.replace(/\/$/, '');

		// auth_token should be the scoped token from the projectInfo call
		this.token = auth_token;
	}

	public setRequest(request: typeof Request) {
		this.request = request;
	}

	// setters for individual obj/call usage
	// just set these prior to doing things and your good to go until you want to change it
	public setTimeout(new_timeout: number) {
		this.timeout = new_timeout;
	}

	public setRequestID(request_id: string) {
		this.request_id = request_id;
	}

	public setUserName(user_name: string) {
		this.user_name = user_name;
	}

	public setLogger(logger: IMetricLogger) {
		this.logger = logger;
	}

	// gets a list of all stacks for the given project/tenant
	// calls back with cb(error, stack_array)
	// the options object can be a blank obj {} or used to specify filters using key/values, e.g.:
	// {
	//    id: string,
	//    status: string,
	//    name: string,
	//    action: string,
	//    tenant: string,
	//    username: string,
	//    owner_id: string
	// }
	public async listStacks(options: unknown) {
		const request_options = this.getRequestOptions('/stacks', true, 'remote-calls.heat.stacks.list');

		const body = await this.request.get<{
			stacks: IStack[];
		}>({
			...request_options,
			qs: options,
			requireBodyObject: 'stacks'
		});
		return body.stacks;
	}

	// show output of a stack for the given key name
	// calls back with cb(error, output_object)
	public async showStackOutput(name: string, id: string, outputKey: string) {
		const request_options = this.getRequestOptions('/stacks/' + escape(name) + '/' + escape(id) + '/outputs/' + escape(outputKey), true, 'remote-calls.heat.stack.showStackOutput');

		const body = await this.request.get<{
			output: string;
		}>(request_options);

		return body.output;
	}

	// creates a stack with the given name
	// calls back with cb(error, stack_object)
	// options:
	// {
	//   disable_rollback: boolean,
	//   environment: object,
	//   files: object,
	//   parameters: object,
	//   tags: string,
	//   template: object,
	//   template_url: string,
	//   timeout_mins: number
	// }
	// note: either template or template_url must be defined
	// todo @param name is not used
	public async createStack(options: {
		disable_rollback: boolean;
		environment: unknown;
		files: unknown;
		parameters: unknown;
		tags: string;
		template: unknown;
		template_url: string;
		timeout_mins: number;
	}) {
		const request_options = this.getRequestOptions('/stacks', options, 'remote-calls.heat.stacks.create');

		const body = await this.request.post<{
			stack: string;
		}>({
			...request_options,
			requireBodyObject: 'stack'
		});

		return body.stack;
	}

	// updates the stack with the given name and id, using HTTP PATCH
	// calls back with cb(error, stack_object)
	// options:
	// {
	//   clear_parameters: array,
	//   disable_rollback: boolean,
	//   environment: object,
	//   environment_files: object,
	//   files: object,
	//   parameters: object,
	//   tags: string,
	//   template: object,
	//   template_url: string,
	//   timeout_mins: number,
	//   converge: boolean
	// }
	// note: either template or template_url must be defined
	public updateStack(name: string, id: string, options: unknown) {
		const request_options = this.getRequestOptions('/stacks/' + escape(name) + '/' + escape(id), options, 'remote-calls.heat.stacks.update');

		return this.request.patch<void>(request_options);
	}

	// deletes the stack with the given name and id
	public deleteStack(name: string, id: string) {
		const request_options = this.getRequestOptions('/stacks/' + escape(name) + '/' + escape(id), true, 'remote-calls.heat.stack.delete');

		return this.request.del<void>(request_options);
	}

	// returns an formatted options object - just makes the code below a little less repetitious
	// path should begin with a "/"
	// json_value should be almost certainly be true if you don't have an actual object you want to send over
	private getRequestOptions(path: string, json_value: unknown, metricPath: string) {
		const return_object = {
			headers: { 'X-Auth-Token': this.token } as { [key: string]: string; },
			json: json_value,
			metricLogger: this.logger,
			metricPath,
			metricRequestID: this.request_id,
			metricUserName: this.user_name,
			timeout: this.timeout,
			uri: this.url + path,
			validateStatus: true
		};
		return return_object;
	}
}
