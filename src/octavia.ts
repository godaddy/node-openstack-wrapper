import { IDetail, IMetricLogger } from './os-request';
import * as Request from './os-request';
import { assign, default_timeout, IUnknowObject } from './utils';

interface ILoadbalancer {
	// todo
	todo: unknown;
}

interface IListener {
	// todo
	todo: unknown;
}

interface IPool {
	// todo
	todo: unknown;
}

interface IPoolMember {
	// todo
	todo: unknown;
}

interface IStat {
	// todo
	todo: unknown;
}

interface IHealthMonitor {
	// todo
	todo: unknown;
}

export default class Octavia {
	private retries = 5;
	private url: string;
	private token: string;
	private timeout = default_timeout;
	private request_id = '';
	private user_name = '';
	private logger = null as unknown as IMetricLogger;
	private retry_delay = 2000;
	private request = Request;
	constructor(endpoint_url: string, auth_token: string) {
		// Keystone v3 is the only supported version at this point - add the url and yank all trailing slashes
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

	public setRetries(retries: number) {
		this.retries = retries;
	}

	public setRetryDelay(retry_delay: number) {
		this.retry_delay = retry_delay;
	}

	public async listLoadBalancers() {
		const request_options = this.getRequestOptions('/lbaas/loadbalancers', true, 'remote-calls.octavia.lbaas.loadbalancers.list', 'loadbalancers');

		const body = await this.request.get<{
			loadbalancers: ILoadbalancer[];
		}>(request_options);
		// Not sure at this point if a blank resource comes back as an empty array or what so....
		return body.loadbalancers;
	}

	public async getLoadBalancer(lb_id: string) {
		const request_options = this.getRequestOptions('/lbaas/loadbalancers/' + lb_id, true, 'remote-calls.octavia.lbaas.loadbalancers.get', 'loadbalancer');

		const body = await this.request.get<{
			loadbalancer: ILoadbalancer;
		}>(request_options);

		return body.loadbalancer;
	}

	// Calls back cb(error, rule) with a newly created resource from the given params
	// todo @param project_id is not used
	public async createLoadBalancer(data: IUnknowObject) {
		const optional_keys = ['name', 'description', 'vip_address', 'vip_network_id', 'vip_port_id', 'admin_state_up', 'flavor', 'provider'];
		const post_data = { loadbalancer: {} };
		assign(post_data.loadbalancer, optional_keys, data);

		// and now we can get the full request options object add the log path and make the request
		const request_options = this.getRequestOptions('/lbaas/loadbalancers', post_data, 'remote-calls.octavia.lbaas.loadbalancers.create', 'loadbalancer');
		// request_options.debug = true;

		const body = await this.request.post<{
			loadbalancer: ILoadbalancer;
		}>(request_options);

		return body.loadbalancer;
	}

	// calls back with (error, lb) after updating the lb params
	public async updateLoadBalancer(lb_id: string, data: IUnknowObject) {
		const optional_keys = ['name', 'description', 'admin_state_up'];
		const put_data = { loadbalancer: {} };
		assign(put_data.loadbalancer, optional_keys, data);
		const request_options = this.getRequestOptions('/lbaas/loadbalancers/' + lb_id, put_data, 'remote-calls.octavia.lbaas.loadbalancers.update', 'loadbalancer');

		const body = await this.request.put<{
			loadbalancer: ILoadbalancer;
		}>(request_options);
		return body.loadbalancer;
	}

	// calls back with (error) after attempting to remove the given lb
	public removeLoadBalancer(lb_id: string) {
		const request_options = this.getRequestOptions('/lbaas/loadbalancers/' + lb_id, true, 'remote-calls.octavia.lbaas.loadbalancers.remove', '');

		return this.request.del<void>(request_options);
	}

	// -------------------------------------------------- //
	// ------------------- Load Balancer Listeners -------------------- //
	// -------------------------------------------------- //

	public async listLBListeners() {
		const request_options = this.getRequestOptions('/lbaas/listeners', true, 'remote-calls.octavia.lbaas.listeners.list', 'listeners');

		const body = await this.request.get<{
			listeners: IListener[];
		}>(request_options);
		// Not sure at this point if a blank listener comes back as an empty array or what so....
		if (body.listeners && body.listeners.length) {
			return body.listeners;
		} else {
			return [];
		}
	}

	public async getLBListener(listener_id: string) {
		const request_options = this.getRequestOptions('/lbaas/listeners/' + listener_id, true, 'remote-calls.octavia.lbaas.listeners.get', 'listener');

		const body = await this.request.get<{
			listener: IListener;
		}>(request_options);
		return body.listener;
	}

	// Creates a load balancer listener
	// calls back with cb(error, listener)
	public createLBListener(loadbalancer_id: string, protocol: string, data: IUnknowObject) {
		const optional_keys = ['default_pool', 'default_pool_id', 'insert_headers', 'l7policies', 'description', 'protocol_port', 'default_tls_container_ref', 'sni_container_refs', 'admin_state_up', 'name', 'connection_limit'];
		const post_data = {
			listener: {
				loadbalancer_id,
				protocol
			}
		};
		assign(post_data.listener, optional_keys, data);

		// and now we can get the full request options object add the log path and make the request
		const request_options = this.getRequestOptions('/lbaas/listeners', post_data, 'remote-calls.octavia.lbaas.listeners.create', 'listener');

		return this.retry(async () => {
			const body = await this.request.post<{
				listener: IListener;
			}>(request_options);
			return body.listener;
		});
	}

	// calls back with (error, listener) after updating the listener
	public updateLBListener(listener_id: string, data: IUnknowObject) {
		const optional_keys = ['default_pool_id', 'insert_headers', 'name', 'description', 'admin_state_up', 'connection_limit', 'default_tls_container_ref', 'sni_container_refs'];
		const put_data = { listener: {} };
		assign(put_data.listener, optional_keys, data);

		const request_options = this.getRequestOptions('/lbaas/listeners/' + listener_id, put_data, 'remote-calls.octavia.lbaas.listeners.update', 'listener');

		return this.retry(async () => {
			const body = await this.request.put<{
				listener: IListener;
			}>(request_options);
			return body.listener;
		});
	}

	// calls back with (error) after attempting to remove the given resource
	public removeLBListener(listener_id: string) {
		const request_options = this.getRequestOptions('/lbaas/listeners/' + listener_id, true, 'remote-calls.octavia.lbaas.listeners.remove', '');
		return this.retry(() => {
			return this.request.del<void>(request_options);
		});
	}

	// -------------------------------------------------- //
	// -------------------- LBPools --------------------- //
	// -------------------------------------------------- //

	public async listLBPools() {
		const request_options = this.getRequestOptions('/lbaas/pools', true, 'remote-calls.octavia.lbaas.pools.list', 'pools');

		const body = await this.request.get<{
			pools: IPool[];
		}>(request_options);

		return body.pools;
	}

	public async getLBPool(pool_id: string) {
		const request_options = this.getRequestOptions('/lbaas/pools/' + pool_id, true, 'remote-calls.octavia.lbaas.pools.get', 'pool');

		const body = await this.request.get<{
			pool: IPool;
		}>(request_options);
		return body.pool;
	}

	// Calls back cb(error, rule) with a newly created resource from the given params
	public createLBPool(protocol: string, lb_algorithm: string, data: IUnknowObject) {
		const optional_keys = ['loadbalancer_id', 'listener_id', 'admin_state_up', 'name', 'description', 'session_persistence'];
		const post_data = {
			pool: {
				lb_algorithm,
				protocol
			}
		};
		assign(post_data.pool, optional_keys, data);

		// and now we can get the full request options object add the log path and make the request
		const request_options = this.getRequestOptions('/lbaas/pools', post_data, 'remote-calls.octavia.lbaas.pools.create', 'pool');

		return this.retry(async () => {
			const body = await this.request.post<{
				pool: IPool;
			}>(request_options);

			return body.pool;
		});
	}

	public updateLBPool(pool_id: string, data: IUnknowObject) {
		const optional_keys = ['name', 'description', 'admin_state_up', 'lb_algorithm', 'session_persistence'];
		const put_data = { pool: {} };
		assign(put_data.pool, optional_keys, data);

		const request_options = this.getRequestOptions('/lbaas/pools/' + pool_id, put_data, 'remote-calls.octavia.lbaas.pools.update', 'pool');

		return this.retry(async () => {
			const body = await this.request.put<{
				pool: IPool;
			}>(request_options);

			return body.pool;
		});
	}

	// calls back with (error) after attempting to remove the given resource
	public removeLBPool(pool_id: string) {
		const request_options = this.getRequestOptions('/lbaas/pools/' + pool_id, true, 'remote-calls.octavia.lbaas.pools.remove', '');

		return this.retry(() => {
			return this.request.del<void>(request_options);
		});
	}

	// -------------------------------------------------- //
	// -------------------- LBPoolMembers --------------------- //
	// -------------------------------------------------- //

	public async listLBPoolMembers(pool_id: string) {
		const request_options = this.getRequestOptions('/lbaas/pools/' + pool_id + '/members', true, 'remote-calls.octavia.lbaas.pools.members.list', 'members');

		const body = await this.request.get<{
			members: IPoolMember[];
		}>(request_options);
		return body.members;
	}

	public async getLBPoolMember(pool_id: string, member_id: string) {
		const request_options = this.getRequestOptions('/lbaas/pools/' + pool_id + '/members/' + member_id, true, 'remote-calls.octavia.lbaas.pools.members.get', 'member');

		const body = await this.request.get<{
			member: IPoolMember;
		}>(request_options);
		return body.member;
	}

	// Creates a member on a given pool
	// calls back with cb(error, member_obj)
	public createLBPoolMember(pool_id: string, address: string, protocol_port: number, data: IUnknowObject) {
		const optional_keys = ['name', 'monitor_port', 'monitor_address', 'admin_state_up', 'weight', 'subnet_id'];
		const post_data = {
			member: {
				address,
				protocol_port
			}
		};
		assign(post_data.member, optional_keys, data);

		// and now we can get the full request options object add the log path and make the request
		const request_options = this.getRequestOptions('/lbaas/pools/' + pool_id + '/members', post_data, 'remote-calls.octavia.lbaas.pools.members.create', 'member');
		return this.retry(async () => {
			const body = await this.request.post<{
				member: IPoolMember;
			}>(request_options);
			return body.member;
		});
	}

	public updateLBPoolMember(pool_id: string, member_id: string, data: IUnknowObject) {
		const optional_keys = ['name', 'monitor_port', 'monitor_address', 'weight', 'admin_state_up'];
		const put_data = { member: {} };
		assign(put_data.member, optional_keys, data);

		const request_options = this.getRequestOptions('/lbaas/pools/' + pool_id + '/members/' + member_id, put_data, 'remote-calls.octavia.lbaas.pools.members.update', 'member');
		return this.retry(async () => {
			const body = await this.request.put<{
				member: IPoolMember;
			}>(request_options);

			return body.member;
		});
	}

	// calls back with (error) after attempting to remove the given resource
	public removeLBPoolMember(pool_id: string, member_id: string) {
		const request_options = this.getRequestOptions('/lbaas/pools/' + pool_id + '/members/' + member_id, true, 'remote-calls.octavia.lbaas.pools.members.remove', '');
		// request_options.debug = true;

		return this.retry(() => {
			return this.request.del<void>(request_options);
		});
	}

	// -------------------------------------------------- //
	// ----------------- Health Monitors ---------------- //
	// -------------------------------------------------- //
	public async listLBHealthMonitors() {
		const request_options = this.getRequestOptions('/lbaas/healthmonitors', true, 'remote-calls.octavia.lbaas.healthmonitors.list', 'healthmonitors');

		const body = await this.request.get<{
			healthmonitors: IHealthMonitor[];
		}>(request_options);

		if (body.healthmonitors && body.healthmonitors.length) {
			return body.healthmonitors;
		} else {
			return [];
		}
	}

	public async getLBHealthMonitor(health_monitor_id: string) {
		const request_options = this.getRequestOptions('/lbaas/healthmonitors/' + health_monitor_id, true, 'remote-calls.octavia.lbaas.healthmonitors.get', 'healthmonitor');

		const body = await this.request.get<{
			healthmonitor: IHealthMonitor;
		}>(request_options);

		return body.healthmonitor;
	}

	// Creates a healthcheck for a given pool
	// calls back with cb(error, health_monitor_obj)
	public createLBHealthMonitor(pool_id: string, type: string, delay: number, timeout: number, max_retries: number, data: IUnknowObject) {
		const optional_keys = ['name', 'max_retries_down', 'http_method', 'url_path', 'expected_codes', 'admin_state_up'];
		const post_data = {
			healthmonitor: {
				delay,
				max_retries,
				pool_id,
				timeout,
				type
			}
		};

		assign(post_data.healthmonitor, optional_keys, data);

		// and now we can get the full request options object add the log path and make the request
		const request_options = this.getRequestOptions('/lbaas/healthmonitors', post_data, 'remote-calls.octavia.lbaas.healthmonitors.create', 'healthmonitor');

		return this.retry(async () => {
			const body = await this.request.post<{
				healthmonitor: IHealthMonitor;
			}>(request_options);
			return body.healthmonitor;
		});
	}

	public updateLBHealthMonitor(health_monitor_id: string, data: IUnknowObject) {
		const optional_keys = ['delay', 'timeout', 'max_retries', 'max_retries_down', 'http_method', 'url_path', 'expected_codes', 'admin_state_up'];
		const put_data = { healthmonitor: {} };
		assign(put_data.healthmonitor, optional_keys, data);

		const request_options = this.getRequestOptions('/lbaas/healthmonitors/' + health_monitor_id, put_data, 'remote-calls.octavia.lbaas.healthmonitors.update', 'healthmonitor');

		return this.retry(async () => {
			const body = await this.request.put<{
				healthmonitor: IHealthMonitor;
			}>(request_options);

			return body.healthmonitor;
		});
	}

	// calls back with (error) after attempting to remove the given resource
	public removeLBHealthMonitor(health_monitor_id: string) {
		const request_options = this.getRequestOptions('/lbaas/healthmonitors/' + health_monitor_id, true, 'remote-calls.octavia.lbaas.healthmonitors.remove', '');

		return this.retry(async () => {
			return this.request.del<void>(request_options);
		});
	}

	// -------------------------------------------------- //
	// ---------------------- Stats --------------------- //
	// -------------------------------------------------- //
	// NOTE: This is just here for experimentation - not really supporting/supported yet
	// Leaving it here though as it may be of use to those who do have it available
	public async getLBStats(lb_id: string) {
		const request_options = this.getRequestOptions('/lbaas/loadbalancers/' + lb_id + '/stats', true, 'remote-calls.octavia.lbaas.loadbalancers.stats.get', 'stats');

		const body = await this.request.get<{
			stats: IStat[];
		}>(request_options);
		return body.stats;
	}

	// returns an formatted options object - just makes the code below a little less repetitious
	// path should begin with a "/"
	// json_value should be almost certainly be true if you don't have an actual object you want to send over
	private getRequestOptions(path: string, json_value: unknown, metricPath: string, requireBodyObject: string) {
		// start w/the instance timeout
		let request_timeout = this.timeout;
		if (!request_timeout) {
			// override with the static value if no instance value was given
			request_timeout = default_timeout;
		}
		const return_object = {
			headers: { 'X-Auth-Token': this.token },
			json: json_value,
			metricLogger: this.logger,
			metricPath,
			metricRequestID: this.request_id,
			metricUserName: this.user_name,
			requireBodyObject,
			timeout: request_timeout,
			uri: this.url + path,
			validateStatus: true
		};

		return return_object;
	}

	private retry<T>(fun: () => T | Promise<T>) {
		return execute(fun, this.retries, 0, this.retry_delay);
	}
}

async function execute<T>(fun: () => T | Promise<T>, max: number, count: number, timeout: number): Promise<T> {
	try {
		return await fun();
	} catch (error) {
		if ((error as IDetail).remoteStatusCode === 409 && count <= max) {
			return await new Promise((res) => {
				setTimeout(() => {
					res(execute(fun, max, ++count, timeout));
				}, timeout);
			});
		} else {
			throw error;
		}
	}
}

