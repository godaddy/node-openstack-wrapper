import { IMetricLogger } from './os-request';
import * as Request from './os-request';
import { assign, default_timeout, IUnknowObject } from './utils';

interface INetwork {
	// todo
	todo: unknown;
}

interface ISubnet {
	// todo
	todo: unknown;
}

interface IRouter {
	// todo
	todo: unknown;
}

interface IFloatingIp {
	// todo
	todo: unknown;
}

interface IFilter {
	// todo
	todo: unknown;
}

interface IPort {
	// todo
	todo: unknown;
}

interface ISecurityGroup {
	// todo
	todo: unknown;
}

interface ISecurityGroupRule {
	// todo
	todo: unknown;
}

interface ILoadBalancer {
	// todo
	todo: unknown;
}

interface IListener {
	name: string;
	description: string;
	admin_state_up: string;
	connection_limit: string;
	default_tls_container_ref: string;
	sni_container_refs: string;
}

interface IPool {
	// todo
	todo: unknown;
}

interface IPoolMember {
	// todo
	todo: unknown;
}

interface IHealthMonitor {
	// todo
	todo: unknown;
}

interface IStat {
	// todo
	todo: unknown;
}

export default class Neutron {
	private url: string;
	private token: string;
	private timeout = default_timeout;
	private request_id = '';
	private user_name = '';
	private logger = null as unknown as IMetricLogger;
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

	// gets a list of all networks for the given project/tenant
	// calls back with cb(error, network_array)
	public async listNetworks() {
		const request_options = this.getRequestOptions('/networks', true, 'remote-calls.neutron.networks.list', 'networks');
		// request_options.debug = true;

		const body = await this.request.get<{
			networks: INetwork[];
		}>(request_options);

		// can't tell at this point if an empty result would come back with a blank array or just no ports at all so...
		if (body.networks && body.networks.length) {
			return body.networks;
		} else {
			// leave an empty array as the result and log an issue.... that might not be an issue... or might be...
			console.error('No networks found for this project - returning blank array');
			return [];
		}
	}

	// gets a network by id (within the current project/tenant)
	// calls back with cb(error, network_obj)
	public async getNetwork(network_id: string) {
		const request_options = this.getRequestOptions('/networks/' + network_id, true, 'remote-calls.neutron.networks.get', 'network');

		const body = await this.request.get<{
			network: INetwork;
		}>(request_options);
		return body.network;
	}

	// gets a list of all networks for the given project/tenant
	// calls back with cb(error, network_array)
	public async listSubnets() {
		const request_options = this.getRequestOptions('/subnets', true, 'remote-calls.neutron.subnets.list', 'subnets');

		const body = await this.request.get<{
			subnets: ISubnet[];
		}>(request_options);

		// can't tell at this point if an empty result would come back with a blank array or just no ports at all so...
		if (body.subnets && body.subnets.length) {
			return body.subnets;
		} else {
			// leave an empty array as the result and log an issue.... that might not be an issue... or might be...
			console.error('No subnets found for this project - returning blank array');
			return [];
		}
	}

	// gets a subnet by id (within the current project/tenant)
	// calls back with cb(error, subnet_obj)
	public async getSubnet(subnet_id: string) {
		const request_options = this.getRequestOptions('/subnets/' + subnet_id, true, 'remote-calls.neutron.subnets.get', 'subnet');

		const body = await this.request.get<{
			subnet: ISubnet;
		}>(request_options);
		return body.subnet;
	}

	// gets a list of all routers for the given project/tenant
	// calls back with cb(error, router_array)
	public async listRouters() {
		const request_options = this.getRequestOptions('/routers', true, 'remote-calls.neutron.routers.list', 'routers');

		const body = await this.request.get<{
			routers: IRouter[];
		}>(request_options);
		if (body.routers && body.routers.length) {
			return body.routers;
		} else {
			// leave an empty array as the result and log an issue.... that might not be an issue... or might be...
			console.error('No routers found for this project - returning blank array');
			return [];
		}
	}

	// gets a specific router by id
	// calls back with cb(error, router_obj)
	public async getRouter(router_id: string) {
		const request_options = this.getRequestOptions('/routers/' + router_id, true, 'remote-calls.neutron.routers.get', 'router');

		const body = await this.request.get<{
			router: IRouter;
		}>(request_options);
		return body.router;
	}

	// ------------------------FLOATING IPS------------------------------
	// Creates(allocates) a new floating ip from a given ip pool(floating_network_id)
	// calls back with cb(error, obj)
	public async createFloatingIp(floating_network_id: string) {
		const request_options = this.getRequestOptions('/floatingips', { floatingip: { floating_network_id } }, 'remote-calls.neutron.floating-ips.create', 'floatingip');

		const body = await this.request.post<{
			floatingip: IFloatingIp;
		}>(request_options);
		return body.floatingip;
	}

	// gets a list of all floating ip's for the given project/tenant
	// calls back with cb(error, ip_array)
	// takes optional object that contains any filters to apply to request
	// i.e.
	// {
	//  filters:
	//  {
	//    'device_id': 'abcdef123567'
	//  }
	// }
	public async listFloatingIps(options: {
		filters: IFilter[];
	}) {
		const request_options = this.getRequestOptions('/floatingips', true, 'remote-calls.neutron.floating-ips.list', 'floatingips');
		// get the actual args passed in as this function can be overloaded

		const body = await this.request.get<{
			floatingips: IFloatingIp[];
		}>({
			...request_options,
			qs: options.filters
		});

		// can't tell at this point if an empty result would come back with a blank array or just no ports at all so...
		if (body.floatingips && body.floatingips.length) {
			return body.floatingips;
		} else {
			// leave an empty array as the result and log an issue.... that might not be an issue... or might be...
			console.error('No floating ips found for given project - returning blank array');
			return [];
		}
	}

	// gets a specific floating ip by id
	// calls back with cb(error, ip_obj)
	public async  getFloatingIp(ip_id: string) {
		const request_options = this.getRequestOptions('/floatingips/' + ip_id, true, 'remote-calls.neutron.floating-ips.get', 'floatingip');

		const body = await this.request.get<{
			floatingip: IFloatingIp;
		}>(request_options);
		return body.floatingip;
	}

	// updates the port_id on a floating ip (its the only thing we can update)
	// calls back with cb(error, ip_obj)
	public async updateFloatingIp(ip_id: string, port_id: string) {
		// and now we can get the full request options object add the log path and make the request
		const request_options = this.getRequestOptions('/floatingips/' + ip_id, { floatingip: { port_id } }, 'remote-calls.neutron.floating-ips.update', 'floatingip');

		const body = await this.request.put<{
			floatingip: IFloatingIp;
		}>(request_options);
		return body.floatingip;
	}

	// removes a floating ip by id
	// calls back with cb(error)
	public removeFloatingIp(ip_id: string) {
		// and now we can get the full request options object add the log path and make the request
		const request_options = this.getRequestOptions('/floatingips/' + ip_id, undefined, 'remote-calls.neutron.floating-ips.remove', '');

		return this.request.del<void>(request_options);
	}

	// calls back with (error, ports) for the tenant/project of the current token
	// takes optional object that contains any filters to apply to request
	// i.e.
	// {
	//  filters:
	//  {
	//    'device_id': 'abcdef123567'
	//  }
	// }
	public async listPorts(options: {
		filters: IFilter[];
	}) {
		const request_options = this.getRequestOptions('/ports', true, 'remote-calls.neutron.ports.list', 'ports');
		// get the actual args passed in as this function can be overloaded

		const body = await this.request.get<{
			ports: IPort[];
		}>({
			...request_options,
			qs: options.filters
		});
		// can't tell at this point if an empty result would come back with a blank array or just no ports at all so...
		if (body.ports && body.ports.length) {
			return body.ports;
		} else {
			// leave an empty array as the result and log an issue.... that might not be an issue... or might be...
			console.error('No Ports group found for given project - returning blank array');
			return [];
		}
	}

	// gets the port with the specified id
	public async getPort(port_id: string) {
		const request_options = this.getRequestOptions('/ports/' + port_id, true, 'remote-calls.neutron.ports.get', 'port');

		const body = await this.request.get<{
			port: IPort;
		}>(request_options);

		return body.port;
	}

	// updates the data on a specified port then calls back with (error, port)
	// NOTE: the network_id is not optional according to the docs but I think it is...
	public async updatePort(port_id: string, data: IUnknowObject) {
		const optional_keys = ['status', 'name', 'admin_state_up', 'tenant_id', 'mac_address', 'fixed_ips', 'security_groups', 'network_id', 'allowed_address_pairs'];
		const put_data = { port: {} };
		// we may have 1 required param
		// put_data.port.network_id = network_id;

		// now loop through all the optional ones
		assign(put_data.port, optional_keys, data);

		// and now we can get the full request options object add the log path and make the request
		const request_options = this.getRequestOptions('/ports/' + port_id, put_data, 'remote-calls.neutron.ports.update', 'port');

		const body = await this.request.put<{ port: IPort; }>(request_options);
		return body.port;
	}

	// calls back with (error, security_groups) for the given tenant/project
	// NOTE: the ?tenant_id= thing is undocumented
	// it forces us to get back permissions only to the given project (as opposed ot the whole company)
	public async listSecurityGroups(project_id: string) {
		const request_options = this.getRequestOptions('/security-groups' + '?tenant_id=' + escape(project_id), true, 'remote-calls.neutron.security-groups.list', 'security_groups');

		const body = await this.request.get<{
			security_groups: ISecurityGroup[];
		}>(request_options);
		// can't tell at this point if an empty result would come back with a blank array or just no security_groups value at all so...
		if (body.security_groups.length) {
			return body.security_groups;
		} else {
			// leave an empty array as the result and log an issue.... that might not be an issue... or might be...
			console.error('No Security group found for given project - returning blank array');
			return [];
		}
	}

	public async getSecurityGroup(group_id: string) {
		const request_options = this.getRequestOptions('/security-groups/' + group_id, true, 'remote-calls.neutron.security-groups.get', 'security_group');

		const body = await this.request.get<{
			security_group: ISecurityGroup;
		}>(request_options);

		return body.security_group;
	}

	// Creates a new security group and calls back with cb(error, result)
	// NOTE: specifying tenant_id is an undocumented feature that allows you to set it to a different tenant than the token
	// we use this for creating groups via a service acct
	public async createSecurityGroup(group_name: string, data: IUnknowObject) {
		const optional_keys = ['description', 'tenant_id'];
		const post_data = { security_group: { name: group_name } };

		assign(post_data.security_group, optional_keys, data);

		const request_options = this.getRequestOptions('/security-groups', post_data, 'remote-calls.neutron.security-groups.create', 'security_group');

		const body = await this.request.post<{
			security_group: ISecurityGroup;
		}>(request_options);

		return body.security_group;
	}

	// calls back with (error, security_group) after updating the name and or description of a security group
	public async updateSecurityGroup(group_id: string, data: IUnknowObject) {
		const optional_keys = ['name', 'description'];
		const put_data = { security_group: {} };
		assign(put_data.security_group, optional_keys, data);

		const request_options = this.getRequestOptions('/security-groups/' + group_id, put_data, 'remote-calls.neutron.security-groups.update', 'security_group');

		const body = await this.request.put<{
			security_group: ISecurityGroup;
		}>(request_options);

		return body.security_group;
	}

	// calls back with (error) after attempting to remove the given security group
	public removeSecurityGroup(group_id: string) {
		const request_options = this.getRequestOptions('/security-groups/' + group_id, true, 'remote-calls.neutron.security-groups.remove', '');

		return this.request.del<void>(request_options);
	}

	// Calls back cb(error, security_rules) with a list of security rules for this tenant (which seems kida weird)
	public async listSecurityGroupRules() {
		const request_options = this.getRequestOptions('/security-group-rules', true, 'remote-calls.neutron.security-group-rules.list', 'security_group_rules');

		const body = await this.request.get<{
			security_group_rules: ISecurityGroupRule[];
		}>(request_options);
		return body.security_group_rules;
	}

	public async getSecurityGroupRule(rule_id: string) {
		const request_options = this.getRequestOptions('/security-group-rules/' + rule_id, true, 'remote-calls.neutron.security-group-rules.get', 'security_group_rule');

		const body = await this.request.get<{
			security_group_rule: ISecurityGroupRule;
		}>(request_options);

		return body.security_group_rule;
	}

	// Calls back cb(error, rule) with a newly created rule from the given group, data
	// note: the docs say the direction is optional but lets imagine its not...
	// also we need a freakin un-mangler!
	public async createSecurityGroupRule(group_id: string, direction: string, data: IUnknowObject) {
		const optional_keys = ['tenant_id', 'ethertype', 'protocol', 'port_range_min', 'port_range_max', 'remote_ip_prefix', 'remote_group_id'];
		const post_data = {
			security_group_rule: {
				direction,
				security_group_id: group_id
			}
		};
		assign(post_data.security_group_rule, optional_keys, data);

		// and now we can get the full request options object add the log path and make the request
		const request_options = this.getRequestOptions('/security-group-rules', post_data, 'remote-calls.neutron.security-group-rules.create', 'security_group_rule');

		const body = await this.request.post<{
			security_group_rule: ISecurityGroupRule;
		}>(request_options);

		return body.security_group_rule;
	}

	// calls back with (error) after removing the given security group rule
	public removeSecurityGroupRule(rule_id: string) {
		const request_options = this.getRequestOptions('/security-group-rules/' + rule_id, true, 'remote-calls.neutron.security-group-rules.remove', '');

		return this.request.del<void>(request_options);
	}


	// -------------------------------------------------- //
	// ----------------- Load Balancers ----------------- //
	// -------------------------------------------------- //

	public async listLoadBalancers() {
		const request_options = this.getRequestOptions('/lbaas/loadbalancers', true, 'remote-calls.neutron.lbaas.loadbalancers.list', 'loadbalancers');

		const body = await this.request.get<{
			loadbalancers: ILoadBalancer[];
		}>(request_options);

		return body.loadbalancers;
	}

	public async getLoadBalancer(lb_id: string) {
		const request_options = this.getRequestOptions('/lbaas/loadbalancers/' + lb_id, true, 'remote-calls.neutron.lbaas.loadbalancers.get', 'loadbalancer');

		const body = await this.request.get<{
			loadbalancer: ILoadBalancer;
		}>(request_options);
		return body.loadbalancer;
	}

	// Calls back cb(error, rule) with a newly created resource from the given params
	// also we need a freakin un-mangler!
	public async createLoadBalancer(tenant_id: string, vip_subnet_id: string, data: IUnknowObject) {
		const optional_keys = ['name', 'description', 'vip_address', 'admin_state_up', 'flavor', 'provider'];
		const post_data = {
			loadbalancer: {
				tenant_id,
				vip_subnet_id
			}
		};

		assign(post_data.loadbalancer, optional_keys, data);

		// and now we can get the full request options object add the log path and make the request
		const request_options = this.getRequestOptions('/lbaas/loadbalancers', post_data, 'remote-calls.neutron.lbaas.loadbalancers.create', 'loadbalancer');

		const body = await this.request.post<{ loadbalancer: ILoadBalancer; }>(request_options);
		return body.loadbalancer;
	}

	// calls back with (error, lb) after updating the lb params
	public async updateLoadBalancer(lb_id: string, data: IUnknowObject) {
		const optional_keys = ['name', 'description', 'admin_state_up'];
		const put_data = { loadbalancer: {} };
		assign(put_data.loadbalancer, optional_keys, data);

		const request_options = this.getRequestOptions('/lbaas/loadbalancers/' + lb_id, put_data, 'remote-calls.neutron.lbaas.loadbalancers.update', 'loadbalancer');

		const body = await this.request.put<{
			loadbalancer: ILoadBalancer;
		}>(request_options);

		return body.loadbalancer;
	}

	// calls back with (error) after attempting to remove the given lb
	public removeLoadBalancer(lb_id: string) {
		const request_options = this.getRequestOptions('/lbaas/loadbalancers/' + lb_id, true, 'remote-calls.neutron.lbaas.loadbalancers.remove', '');
		request_options.metricPath = 'remote-calls.neutron.lbaas.loadbalancers.remove';
		request_options.validateStatus = true;

		return this.request.del<void>(request_options);
	}

	// -------------------------------------------------- //
	// ------------------- Load Balancer Listeners -------------------- //
	// -------------------------------------------------- //

	public async listLBListeners() {
		const request_options = this.getRequestOptions('/lbaas/listeners', true, 'remote-calls.neutron.lbaas.listeners.list', 'listeners');

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
		const request_options = this.getRequestOptions('/lbaas/listeners/' + listener_id, true, 'remote-calls.neutron.lbaas.listeners.get', 'listener');

		const body = await this.request.get<{
			listener: IListener;
		}>(request_options);

		return body.listener;
	}

	// Calls back cb(error, rule) with a newly created listener from the given params
	public async createLBListener(tenant_id: string, loadbalancer_id: string, description: string, protocol: string, data: IUnknowObject) {
		const optional_keys = ['protocol_port', 'default_tls_container_ref', 'sni_container_refs', 'admin_state_up', 'name', 'connection_limit'];
		const post_data = {
			listener: {
				description,
				loadbalancer_id,
				protocol,
				tenant_id
			}
		};

		assign(post_data.listener, optional_keys, data);

		// and now we can get the full request options object add the log path and make the request
		const request_options = this.getRequestOptions('/lbaas/listeners', post_data, 'remote-calls.neutron.lbaas.listeners.create', 'listener');

		const body = await this.request.post<{
			listener: IListener;
		}>(request_options);

		return body.listener;
	}

	// calls back with (error, listener) after updating the listener
	public async updateLBListener(listener_id: string, data: IUnknowObject) {
		const optional_keys = ['name', 'description', 'admin_state_up', 'connection_limit', 'default_tls_container_ref', 'sni_container_refs'];
		const put_data = { listener: {} as IUnknowObject };

		assign(put_data.listener, optional_keys, data);

		const request_options = this.getRequestOptions('/lbaas/listeners/' + listener_id, put_data, 'remote-calls.neutron.lbaas.listeners.update', 'listener');

		const body = await this.request.put<{
			listener: IListener;
		}>(request_options);

		return body.listener;
	}

	// calls back with (error) after attempting to remove the given resource
	public removeLBListener(listener_id: string) {
		const request_options = this.getRequestOptions('/lbaas/listeners/' + listener_id, true, 'remote-calls.neutron.lbaas.listeners.remove', '');

		return this.request.del<void>(request_options);
	}


	// -------------------------------------------------- //
	// -------------------- LBPools --------------------- //
	// -------------------------------------------------- //

	public async listLBPools() {
		const request_options = this.getRequestOptions('/lbaas/pools', true, 'remote-calls.neutron.lbaas.pools.list', 'pools');

		const body = await this.request.get<{
			pools: IPool[];
		}>(request_options);

		return body.pools;
	}


	public async getLBPool(pool_id: string) {
		const request_options = this.getRequestOptions('/lbaas/pools/' + pool_id, true, 'remote-calls.neutron.lbaas.pools.get', 'pool');

		const body = await this.request.get<{
			pool: IPool;
		}>(request_options);
		return body.pool;
	}

	// Calls back cb(error, rule) with a newly created resource from the given params
	public async createLBPool(tenant_id: string, protocol: string, lb_algorithm: string, listener_id: string, data: IUnknowObject) {
		const optional_keys = ['admin_state_up', 'name', 'description', 'session_persistence'];
		const post_data = {
			pool: {
				lb_algorithm,
				listener_id,
				protocol,
				tenant_id
			}
		};

		assign(post_data.pool, optional_keys, data);

		// and now we can get the full request options object add the log path and make the request
		const request_options = this.getRequestOptions('/lbaas/pools', post_data, 'remote-calls.neutron.lbaas.pools.create', 'pool');

		const body = await this.request.post<{
			pool: IPool;
		}>(request_options);
		return body.pool;
	}

	public async updateLBPool(pool_id: string, data: IUnknowObject) {
		const optional_keys = ['name', 'description', 'admin_state_up', 'lb_algorithm', 'session_persistence'];
		const put_data = { pool: {} as IUnknowObject };

		// loop through all the optional data keys and add them to the post data
		for (let n = 0; n < optional_keys.length; n++) {
			const key = optional_keys[n];
			if (typeof data[key] !== 'undefined') {
				put_data.pool[key] = data[key];
			}
		}

		const request_options = this.getRequestOptions('/lbaas/pools/' + pool_id, put_data, 'remote-calls.neutron.lbaas.pools.update', 'pool');

		const body = await this.request.put<{
			pool: IPool;
		}>(request_options);
		return body.pool;
	}

	// calls back with (error) after attempting to remove the given resource
	public removeLBPool(pool_id: string) {
		const request_options = this.getRequestOptions('/lbaas/pools/' + pool_id, true, 'remote-calls.neutron.lbaas.pools.remove', '');
		return this.request.del<void>(request_options);
	}

	// -------------------------------------------------- //
	// -------------------- LBPoolMembers --------------------- //
	// -------------------------------------------------- //

	public async listLBPoolMembers(pool_id: string) {
		const request_options = this.getRequestOptions('/lbaas/pools/' + pool_id + '/members', true, 'remote-calls.neutron.lbaas.pools.members.list', 'members');

		const body = await this.request.get<{
			members: IPoolMember[];
		}>(request_options);

		return body.members;
	}

	public async getLBPoolMember(pool_id: string, member_id: string) {
		const request_options = this.getRequestOptions('/lbaas/pools/' + pool_id + '/members/' + member_id, true, 'remote-calls.neutron.lbaas.pools.members.get', 'member');

		const body = await this.request.get<{
			member: IPoolMember;
		}>(request_options);

		return body.member;
	}

	// Calls back cb(error, rule) with a newly created resource from the given params
	public async createLBPoolMember(pool_id: string, tenant_id: string, address: string, protocol_port: number, data: IUnknowObject) {
		const optional_keys = ['admin_state_up', 'weight', 'subnet_id'];
		const post_data = {
			member: {
				address,
				protocol_port,
				tenant_id
			}
		};
		assign(post_data, optional_keys, data);

		// and now we can get the full request options object add the log path and make the request
		const request_options = this.getRequestOptions('/lbaas/pools/' + pool_id + '/members', post_data, 'remote-calls.neutron.lbaas.pools.members.create', 'member');

		const body = await this.request.post<{
			member: IPoolMember;
		}>(request_options);

		return body.member;
	}

	public async updateLBPoolMember(pool_id: string, member_id: string, data: IUnknowObject) {
		const optional_keys = ['weight', 'admin_state_up'];
		const put_data = { member: {} };
		assign(put_data.member, optional_keys, data);
		const request_options = this.getRequestOptions('/lbaas/pools/' + pool_id + '/members/' + member_id, put_data, 'remote-calls.neutron.lbaas.pools.members.update', 'member');

		const body = await this.request.put<{
			member: IPoolMember;
		}>(request_options);

		return body.member;
	}

	// calls back with (error) after attempting to remove the given resource
	public removeLBPoolMember(pool_id: string, member_id: string) {
		const request_options = this.getRequestOptions('/lbaas/pools/' + pool_id + '/members/' + member_id, true, 'remote-calls.neutron.lbaas.pools.members.remove', '');

		return this.request.del<void>(request_options);
	}


	// -------------------------------------------------- //
	// ----------------- LBHealthMonitors ----------------- //
	// -------------------------------------------------- //


	public async listLBHealthMonitors() {
		const request_options = this.getRequestOptions('/lbaas/healthmonitors', true, 'remote-calls.neutron.lbaas.healthmonitors.list', 'healthmonitors');

		const body = await this.request.get<{
			healthmonitors: IHealthMonitor[];
		}>(request_options);

		if (body.healthmonitors && body.healthmonitors.length) {
			return body.healthmonitors;
		}
	}

	public async getLBHealthMonitor(health_monitor_id: string) {
		const request_options = this.getRequestOptions('/lbaas/healthmonitors/' + health_monitor_id, true, 'remote-calls.neutron.lbaas.healthmonitors.get', 'healthmonitor');

		const body = await this.request.get<{
			healthmonitor: IHealthMonitor;
		}>(request_options);

		return body.healthmonitor;
	}

	// Calls back cb(error, rule) with a newly created resource from the given params
	public async createLBHealthMonitor(tenant_id: string, type: string, delay: number, timeout: number, max_retries: number, pool_id: string, data: IUnknowObject) {
		const optional_keys = ['http_method', 'url_path', 'expected_codes', 'admin_state_up'];
		const post_data = {
			healthmonitor: {
				delay,
				max_retries,
				pool_id,
				tenant_id,
				timeout,
				type
			}
		};
		assign(post_data.healthmonitor, optional_keys, data);

		// and now we can get the full request options object add the log path and make the request
		const request_options = this.getRequestOptions('/lbaas/healthmonitors', post_data, 'remote-calls.neutron.lbaas.healthmonitors.create', 'healthmonitor');

		const body = await this.request.post<{
			healthmonitor: IHealthMonitor;
		}>(request_options);

		return body.healthmonitor;
	}

	public async updateLBHealthMonitor(health_monitor_id: string, data: IUnknowObject) {
		const optional_keys = ['delay', 'timeout', 'max_retries', 'http_method', 'url_path', 'expected_codes', 'admin_state_up'];
		const put_data = { healthmonitor: {} };
		assign(put_data, optional_keys, data);

		const request_options = this.getRequestOptions('/lbaas/healthmonitors/' + health_monitor_id, put_data, 'remote-calls.neutron.lbaas.healthmonitors.update', 'healthmonitor');

		const body = await this.request.put<{
			healthmonitor: IHealthMonitor;
		}>(request_options);

		return body.healthmonitor;
	}

	// calls back with (error) after attempting to remove the given resource
	public removeLBHealthMonitor(health_monitor_id: string) {
		const request_options = this.getRequestOptions('/lbaas/healthmonitors/' + health_monitor_id, true, 'remote-calls.neutron.lbaas.healthmonitors.remove', '');

		return this.request.del<void>(request_options);
	}

	// -------------------------------------------------- //
	// ---------------------- Stats --------------------- //
	// -------------------------------------------------- //
	// NOTE: May not be available in your openstack installation
	// Leaving it here as it may be of use to those who do have it available
	public async getLBStats(lb_id: string) {
		const request_options = this.getRequestOptions('/lbaas/loadbalancers/' + lb_id + '/stats', true, 'remote-calls.neutron.lbaas.loadbalancers.stats.get', 'stats');

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
		return {
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
	}
}

