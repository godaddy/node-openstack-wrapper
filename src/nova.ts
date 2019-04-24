import { IMetricLogger } from './os-request';
import * as Request from './os-request';
import { default_timeout } from './utils';

interface IServer {
	// todo
	status: 'PAUSED' | 'SUSPENDED' | 'PAUSED';
}

interface IFlavor {
	// todo
	todo: unknown;
}

interface INetwork {
	// todo
	todo: unknown;
}

interface IFloatIpPool {
	// todo
	name: string;
}

interface IAvailabilityZoneInfo {
	// todo
	zoneName: string;
}

interface IKeyPair {
	keypair: {
		name: string;
	};
}

interface IQuotaSet {
	// todo
	todo: unknown;
}

interface ITenantUsage {
	// todo
	todo: unknown;
}

export default class Nova {
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

	// ----------------
	// Server methods
	// ----------------
	// NOTE: options is an optional hash that lets you specify filters on the listing call ie: {limit: 1}
	public async listServers(options: {}) {
		// now on with the show
		const request_options = this.getRequestOptions('/servers/detail', true, 'remote-calls.nova.servers.list', 'servers', true);

		// todo
		const body = await this.request.get<{
			servers: IServer[];
		}>({
			...request_options,
			qs: options
		});
		return body.servers;
	}

	public async getServer(id: string) {
		const request_options = this.getRequestOptions('/servers/' + id, true, 'remote-calls.nova.servers.get', 'server', true);
		request_options.metricPath = 'remote-calls.nova.servers.get';
		request_options.validateStatus = true;
		request_options.requireBodyObject = 'server';

		const body = await this.request.get<{
			server: IServer;
		}>(request_options);

		return body.server;
	}

	public async createServer(data: unknown) {
		const request_options = this.getRequestOptions('/servers', data, 'remote-calls.nova.servers.create', '', true);
		// Commenting out so that we can handle returns of 'servers' for multiple creates
		// request_options.requireBodyObject = 'server';

		const body = await this.request.post<{
			server: IServer;
		}>(request_options);

		return body.server;
	}

	public renameServer(id: string, name: string) {
		const data = { server: { name } };
		const request_options = this.getRequestOptions('/servers/' + id, data, 'remote-calls.nova.servers.rename', '', true);

		return this.request.put<void>(request_options);
	}

	public resizeServer(id: string, flavor: string) {
		const data = { resize: { flavorRef: flavor } };
		const request_options = this.getRequestOptions('/servers/' + id + '/action', data, 'remote-calls.nova.servers.resize', '', true);

		return this.request.post<void>(request_options);
	}

	public confirmResizeServer(id: string) {
		const data = { confirmResize: null };
		const request_options = this.getRequestOptions('/servers/' + id + '/action', data, 'remote-calls.nova.servers.resize-confirm', '', true);

		return this.request.post<void>(request_options);
	}

	public revertResizeServer(id: string) {
		const data = { revertResize: null };
		const request_options = this.getRequestOptions('/servers/' + id + '/action', data, 'remote-calls.nova.servers.resize-revert', '', true);

		return this.request.post<void>(request_options);
	}

	public removeServer(id: string) {
		const request_options = this.getRequestOptions('/servers/' + id, true, 'remote-calls.nova.servers.remove', '', true);
		request_options.metricPath = 'remote-calls.nova.servers.remove';
		request_options.validateStatus = true;

		return this.request.del<void>(request_options);
	}

	public rebootServer(id: string) {
		const data = { reboot: { type: 'SOFT' } };
		const request_options = this.getRequestOptions('/servers/' + id + '/action', data, 'remote-calls.nova.servers.reboot', '', true);

		return this.request.post<void>(request_options);
	}

	public forceRebootServer(id: string) {
		const data = { reboot: { type: 'HARD' } };
		const request_options = this.getRequestOptions('/servers/' + id + '/action', data, 'remote-calls.nova.servers.reboot-force', '', true);
		return this.request.post<void>(request_options);
	}

	public stopServer(id: string) {
		const data = { 'os-stop': null };
		const request_options = this.getRequestOptions('/servers/' + id + '/action', data, 'remote-calls.nova.servers.stop', '', true);

		return this.request.post<void>(request_options);
	}

	public startServer(id: string) {
		const data = { 'os-start': null };
		const request_options = this.getRequestOptions('/servers/' + id + '/action', data, 'remote-calls.nova.servers.start', '');

		return this.request.post<void>(request_options);
	}

	public pauseServer(id: string) {
		const data = { pause: null };
		const request_options = this.getRequestOptions('/servers/' + id + '/action', data, 'remote-calls.nova.servers.pause', '');

		return this.request.post<void>(request_options);
	}

	public suspendServer(id: string) {
		const data = { suspend: null };
		const request_options = this.getRequestOptions('/servers/' + id + '/action', data, 'remote-calls.nova.servers.suspend', '');

		return this.request.post<void>(request_options);
	}

	public async resumeServer(id: string) {
		const server = await this.getServer(id);

		if (server.status !== 'PAUSED' && server.status !== 'SUSPENDED') {
			throw new Error('Cannot resume server.  Server is not in a paused or suspected state.');
		}

		const data = server.status === 'PAUSED' ? { unpause: null } : { resume: null };
		const request_options = this.getRequestOptions('/servers/' + escape(id) + '/action', data, 'remote-calls.nova.servers.resume', '', true);

		return this.request.post<void>(request_options);
	}

	public async getServerConsoleURL(type: 'spice-html5' | 'novnc', id: string) {
		let data = {};

		if (type === 'spice-html5') {
			data = { 'os-getSPICEConsole': { type } };
		} else {
			if (type === undefined || !type) {
				type = 'novnc';
			}
			data = { 'os-getVNCConsole': { type } };
		}
		const request_options = this.getRequestOptions('/servers/' + escape(id) + '/action', data, 'remote-calls.nova.servers.console-urls.get', 'console.url', true);

		const body = await this.request.post<{
			console: {
				url: string;
			};
		}>(request_options);

		return body.console.url;
	}

	// gets [length] lines form the log? of an instance
	public async getServerLog(id: string, length: number) {
		if (length === undefined || !length) {
			length = 35;
		}

		const data = { 'os-getConsoleOutput': { length } };
		const request_options = this.getRequestOptions('/servers/' + escape(id) + '/action', data, 'remote-calls.nova.servers.logs.get', 'output', true);

		const body = await this.request.post<{ output: string; }>(request_options);

		return body.output;
	}

	// creates an image from the current disk of an instance
	// takes the id of an instance as well as any meta-data to be added to the image
	// calls back with(error, new_image_info)
	public async createServerImage(id: string, {
		name,
		metadata
	}: {
		name?: string;
		metadata?: object;
	}) {
		const request_options = this.getRequestOptions('/servers/' + escape(id) + '/action', { createImage: { name, metadata } }, 'remote-calls.nova.servers.images.create', '', true);
		// commenting out to support later versions of nova that dont return
		// request_options.requireBodyObject = 'output';

		const { body, res } = await this.request.request<{
			image_id: string;
		}>({
			...request_options,
			method: 'POST'
		});
		let image_id = '';
		// else if nova 2.45+ the image id is in the body, else its in the header (in theory)

		if (body && body.image_id) {
			// nova 2.45+
			image_id = body.image_id;
		} else {
			// old skool
			const url = res.headers.location;
			image_id = url!.match(/.*\/images\/(.*)/)![1];
		}

		// removing ServerImage mangling as we are updating this method with a diffrent format in 2.2+
		// going to try and output as close to what recent nova does regardless of version of nova used
		return { image_id };
	}

	public setServerMetadata(id: string, data: unknown) {
		const request_options = this.getRequestOptions('/servers/' + escape(id) + '/metadata', { metadata: data }, 'remote-calls.nova.servers.metadata.update', '', true);

		return this.request.put<void>(request_options);
	}

	// ----------------
	// Flavor
	// ----------------
	public async listFlavors() {
		const request_options = this.getRequestOptions('/flavors/detail', true, 'remote-calls.nova.flavors.list', 'flavors', true);

		const body = await this.request.get<{
			flavors: IFlavor[];
		}>(request_options);

		return body.flavors;
	}

	public async getFlavor(id: string) {
		const request_options = this.getRequestOptions('/flavors/' + escape(id), true, 'remote-calls.nova.flavors.get', 'flavor', true);

		const body = await this.request.get<{
			flavor: IFlavor;
		}>(request_options);

		return body.flavor;
	}

	// ----------------
	// Project Network
	// ----------------
	public async listProjectNetworks() {
		const request_options = this.getRequestOptions('/os-tenant-networks', true, 'remote-calls.nova.os-tenant-networks.list', 'networks', true);

		const body = await this.request.get<{
			networks: INetwork[];
		}>(request_options);

		return body.networks;
	}

	// ----------------
	// Floating IP
	// ----------------
	public async listFloatingIps() {
		const request_options = this.getRequestOptions('/os-floating-ips', true, 'remote-calls.nova.floating-ips.list', 'floating_ips', true);

		const body = await this.request.get<{
			floating_ips: string[];
		}>(request_options);

		return body.floating_ips;
	}


	public async getFloatingIp(id: string) {
		const request_options = this.getRequestOptions('/os-floating-ips/' + escape(id), true, 'remote-calls.nova.floating-ips.get', 'floating_ip', true);

		const body = await this.request.get<{
			floating_ip: string;
		}>(request_options);

		return body.floating_ip;
	}

	// allocates assigns an ip
	// calls cb with the info on the created ip
	public async createFloatingIp(data: {
		pool: unknown;
	}) {
		const post_data = data.pool !== undefined ? { pool: data.pool } : true;
		const request_options = this.getRequestOptions('/os-floating-ips', post_data, 'remote-calls.nova.floating-ips.allocate', 'floating_ip', true);

		const body = await this.request.post<{
			floating_ip: string;
		}>(request_options);

		return body.floating_ip;
	}

	// removes the floating ip from the pool and dissasociates and generally hates all things
	// calls back with cb(error)
	public removeFloatingIp(id: string) {
		const request_options = this.getRequestOptions('/os-floating-ips/' + escape(id), true, 'remote-calls.nova.floating-ips.remove', '', true);

		return this.request.del<void>(request_options);
	}

	// associates a given : string a given ip address (nova only supports the ip_address not the ip_id)
	// calls back with cb(error) as nova doesn't provide a result beyond a 204
	public associateFloatingIp(instance_id: string, ip_address: string) {
		const data = { addFloatingIp: { address: ip_address } };
		const request_options = this.getRequestOptions('/servers/' + escape(instance_id) + '/action', data, 'remote-calls.nova.floating-ips.associate', '', true);

		return this.request.post<void>(request_options);
	}

	// disassociates a given instance with a given ip address (nova only supports the ip_address not the ip_id)
	// calls back with cb(error) as nova doesn't provide a result beyond a 204
	public disassociateFloatingIp(instance_id: string, ip_address: string) {
		const data = { removeFloatingIp: { address: ip_address } };
		const request_options = this.getRequestOptions('/servers/' + escape(instance_id) + '/action', data, 'remote-calls.nova.floating-ips.disassociate', '', true);

		return this.request.post<void>(request_options);
	}

	// ----------------
	// Floating IP Pool
	// ----------------
	public async listFloatingIpPools() {
		const request_options = this.getRequestOptions('/os-floating-ip-pools', true, 'remote-calls.nova.ip-pool-list', 'floating_ip_pools', true);

		const body = await this.request.get<{
			floating_ip_pools: IFloatIpPool[];	// todo
		}>(request_options);

		return body.floating_ip_pools;
	}

	// since theres apparently no getIpPool info method in the nova api...
	// NOTE: the return from ip_pools is weird and doesn' thave an id but its a better term.  id == name in reality
	public async getFloatingIpPool(id: string) {
		const pools = await this.listFloatingIpPools();

		for (let i = 0; i < pools.length; i++) {
			if (pools[i].name === id) {
				return pools[i];
			}
		}

		throw new Error('No pool with specified id found');
	}

	// ----------------
	// Availability Zone
	// ----------------
	public async listAvailabilityZones() {
		const request_options = this.getRequestOptions('/os-availability-zone', true, 'remote-calls.nova.os-availability-zones.list', 'availabilityZoneInfo', true);

		const body = await this.request.get<{
			availabilityZoneInfo: IAvailabilityZoneInfo[];
		}>(request_options);

		return body.availabilityZoneInfo;
	}

	// and since there is no method to get zone info in the nova api...
	// NOTE: the return from listAvailabilityZones is weird and doesn' thave an id but its a better term.  id == name in reality
	public async getAvailabilityZone(id: string) {
		const zones = await this.listAvailabilityZones();
		for (let i = 0; i < zones.length; i++) {
			if (zones[i].zoneName === id) {
				return zones[i];
			}
		}
		throw new Error('No zone with specified id found');

	}

	// ---------------
	// (SSH) Key Pairs
	// ---------------
	public async listKeyPairs() {
		const request_options = this.getRequestOptions('/os-keypairs', true, 'remote-calls.nova.key-pairs.list', 'keypairs', true);

		const body = await this.request.get<{
			keypairs: IKeyPair[];
		}>(request_options);

		return body.keypairs.map((keypair) => {
			return keypair.keypair;
		});
	}

	public async getKeyPair(id: string) {
		const request_options = this.getRequestOptions('/os-keypairs/' + id, true, 'remote-calls.nova.key-pairs.get', 'keypair', true);

		const body = await this.request.get<{
			keypair: unknown;	// todo
		}>(request_options);

		return body.keypair;
	}

	public async createKeyPair(name: string, public_key?: string) {
		const data = {
			keypair: {
				name,
				public_key
			}
		};
		const request_options = this.getRequestOptions('/os-keypairs', data, 'remote-calls.nova.key-pairs.create', 'keypair', true);

		const body = await this.request.post<{
			keypair: IKeyPair;
		}>(request_options);

		return body.keypair;
	}

	public removeKeyPair(id: string) {
		const request_options = this.getRequestOptions('/os-keypairs/' + id, true, 'remote-calls.nova.key-pairs.remove', '', true);

		return this.request.del<void>(request_options);
	}

	public async getQuotaSet(project_id: string) {
		const request_options = this.getRequestOptions('/os-quota-sets/' + escape(project_id), true, 'remote-calls.nova.quota-sets.get', 'quota_set', true);

		const body = await this.request.get<{
			quota_set: IQuotaSet;
		}>(request_options);
		return body.quota_set;
	}

	// updates the quota for a given project_id
	// data should be an object with all of the things you want to update
	// supported values are cores, ram, instances, floating_ip, and anything else in the docs
	// calls back with cb(error, quota_set) where quota_set is an object with all the updated params
	// *****NOTE: the token required for this call is usually the one scoped to the admin (usually 'openstack') project
	// even though the call is not usually on that specific project_id
	public async setQuotaSet(project_id: string, data: unknown) {
		const request_options = this.getRequestOptions('/os-quota-sets/' + escape(project_id), { quota_set: data }, 'remote-calls.nova.quota-sets.update', 'quota_set', true);

		const body = await this.request.put<{
			quota_set: IQuotaSet;
		}>(request_options);
		return body.quota_set;
	}

	// start_date and end_date should just be any 2 date objects
	public async getTenantUsage(project_id: string, start_date_obj: Date, end_date_obj: Date) {
		let url = '/os-simple-tenant-usage/' + escape(project_id);

		// format of dates should be: %Y-%m-%d %H:%M:%S.%f
		url += '?start=' + start_date_obj.toISOString().replace('T', ' ').replace('Z', '');
		url += '&end=' + end_date_obj.toISOString().replace('T', ' ').replace('Z', '');

		const request_options = this.getRequestOptions(url, true, 'remote-calls.nova.tenant-usage.get', 'tenant_usage', true);

		const body = await this.request.get<{
			tenant_usage: ITenantUsage;
		}>(request_options);

		return body.tenant_usage;
	}

	// ---------------
	// SecurityGroup
	// ---------------
	public assignSecurityGroup(security_group_name: string, instance_id: string) {
		const data = { addSecurityGroup: { name: security_group_name } };
		const request_options = this.getRequestOptions('/servers/' + escape(instance_id) + '/action', data, 'remote-calls.nova.servers.add-security-group', '', true);

		return this.request.post<void>(request_options);
	}

	public removeSecurityGroup(security_group_name: string, instance_id: string) {
		const data = { removeSecurityGroup: { name: security_group_name } };
		const request_options = this.getRequestOptions('/servers/' + escape(instance_id) + '/action', data, 'remote-calls.nova.servers.remove-security-group', '', true);

		return this.request.post<void>(request_options);
	}

	// -------------------------------------------------- //
	// Image MetaData (still handled by nova because....) //
	// -------------------------------------------------- //
	public async getImageMetaData(id: string) {
		const request_options = this.getRequestOptions('/images/' + escape(id) + '/metadata', true, 'remote-calls.nova.images.metadata.get', 'metadata', true);

		const body = await this.request.get<{
			metadata: unknown;
		}>(request_options);
		return body.metadata;
	}

	public async setImageMetaData(id: string, data: unknown) {
		const request_options = this.getRequestOptions('/images/' + escape(id) + '/metadata', { metadata: data }, 'remote-calls.nova.images.metadata.update', 'metadata', true);

		const body = await this.request.put<{
			metadata: unknown;
		}>(request_options);

		return body.metadata;
	}

	// returns an formatted options object - just makes the code below a little less repetitious
	// path should begin with a "/"
	// json_value should be almost certainly be true if you don't have an actual object you want to send over
	private getRequestOptions(path: string, json_value: unknown, metricPath: string, requireBodyObject: string, validateStatus?: boolean) {
		// start w/the instance timeout
		let request_timeout = this.timeout;
		if (!request_timeout) {
			// override with the static value if no instance value was given
			request_timeout = default_timeout;
		}
		const return_object = {
			headers: { 'X-Auth-Token': this.token } as { [key: string]: string; },
			json: json_value,
			metricLogger: this.logger,
			metricPath,
			metricRequestID: this.request_id,
			metricUserName: this.user_name,
			requireBodyObject,
			timeout: request_timeout,
			uri: this.url + path,
			validateStatus
		};
		return return_object;
	}
}
