import { IMetricLogger } from './os-request';
import * as Request from './os-request';
import { default_timeout } from './utils';

interface IAuthData {
	auth: {
		identity: {
			methods: ['token'];
			token: { id: string; };
		};
		scope: {
			project: {
				id?: string;
				domain?: { id: string; };
				name?: string;
			};
		};
	};
}

interface ILinks {
	self?: string;
	previous?: string;
	next?: string;
}

export interface IProject {
	domain: {
		id: string;
		name: string;
	};
	id: string;
	name: string;
}

export interface IRole {
	id: string;
	name: string;
}

interface IRoleAssignment {
	// todo
	todo: unknown;
}

interface IRegion {
	parent_region_id: string;
	id: string;
	links: ILinks[];
	description: string;
}

interface IEnvironment {
	// todo
	todo: unknown;
}

interface IOwningGroup {
	// todo
	todo: unknown;
}

interface IMeta {
	// todo
	todo: unknown;
}

interface IEndPoint {
	url: string;
	interface: string;
	region: string;
	region_id: string;
	id: string;
}

export interface ICatalog {
	endpoints: IEndPoint[];
	type: string;
	id: string;
	name: string;
}

export interface IUser {
	password_expires_at: string;
	domain: {
		id: string;
		name: string;
	};
	id: string;
	name: string;
}

type ArrayWithLinks<T> = T[] & ILinks;

export default class Keystone {
	private url: string;
	private timeout = default_timeout;
	private request_id = '';
	private user_name = '';
	// logger should default to null - might consider checking for a logMetric function in that obj too?
	private logger = null as unknown as IMetricLogger;
	private request = Request;
	constructor(endpoint_url: string) {

		// Keystone v3 is the only supported version at this point - add the url and yank all trailing slashes
		this.url = endpoint_url.replace(/\/$/, '');
	}

	public setRequest(request: typeof Request) {
		this.request = request;
	}

	// setters for individual obj/call usage
	// just set these prior to doing things and your good to go until you want to change it
	public setTimeout(new_timeout: number) {
		if (new_timeout > 0) {
			this.timeout = new_timeout;
		} else {
			this.timeout = default_timeout;
		}
		return this.timeout;
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

	// authorizes the users against the specified keystone
	// can be called with 3 or 4 params (domain is optional, cb is not)
	// calls back with (error, token) where token is an object containing all the token info
	// NOTE: the actual token value normally comes back in the header - i'm modifying this to token.token for easier consumption
	public async getToken(username: string, password: string, domain = 'Default') {
		const auth_data = {
			auth: {
				identity: {
					methods: ['password'],
					password: { user: { domain: { name: domain }, name: username, password } }
				}
			}
		};
		const request_options = this.getRequestOptions('bogus', '/auth/tokens', auth_data, 'remote-calls.keystone.tokens.get', 'token');
		request_options.headers = {}; // we don't want the normal auth header due to bogus token

		// auth-token will come back in the header for some reason as x-subject-token (used to come back in the body all nice like)
		const { body, res } = await this.request.request<{
			token: {
				token: string
				audit_ids: string[];
				methods: string[];
				expires_at: string;
				user: IUser;
			};
		}>({
			...request_options,
			method: 'POST'
		});

		// tiny hack here to put the actual token string back into the object
		body.token.token = res.headers['x-subject-token'] as string;

		// now we good
		return body.token;
	}

	// make a callback(error, project_authorization) with all of the data on a project and an access token for further calls on it
	// NOTE: this is not the admin function that gets project details - you have to do this so I'm not bothering with that
	public getProjectToken(access_token: string, project_id: string) {
		return this.getProjectTokenForReal({
			auth: {
				identity: {
					methods: ['token'],
					token: { id: access_token }
				},
				scope: {
					project: { id: project_id }
				}
			}
		});
	}

	public getProjectTokenById(access_token: string, project_id: string) {
		return this.getProjectToken(access_token, project_id);
	}

	// make a callback(error, project_authorization) with all of the data on a project and an access token for further calls on it
	// NOTE: this is not the admin function that gets project details - you have to do this so I'm not bothering with that
	public getProjectTokenByName(access_token: string, project_name: string, domain_id = 'default') {
		return this.getProjectTokenForReal({
			auth: {
				identity: {
					methods: ['token'],
					token: { id: access_token }
				},
				scope: {
					project: {
						domain: { id: domain_id },
						name: project_name
					}
				}
			}
		});
	}

	// gets a list of all projects in the system
	// calls back with cb(error, project_array)
	// ***NOTE: admin_access_token is a scoped token from a project you have admin rights on - yes this is weird
	public async listProjects(admin_access_token: string) {
		const request_options = this.getRequestOptions(admin_access_token, '/projects', true, 'remote-calls.keystone.projects.list', 'projects');

		const body = await this.request.get<{
			projects: IProject[];
			links: ILinks;
		}>(request_options);

		const projects_array = [] as ArrayWithLinks<IProject>;

		for (let n = 0; n < body.projects.length; n++) {
			projects_array[n] = body.projects[n];
		}

		// tack these on for easy consupmtion and in case we ever need pagination
		projects_array.self = body.links.self;
		projects_array.previous = body.links.previous;
		projects_array.next = body.links.next;

		return projects_array;
	}

	// gets a list of projects the given token is authorized to have some access to
	// calls back with (error, projects_array) and self, previous, and null are tacked on as properties of the array
	public async listUserProjects(username: string, access_token: string) {
		const request_options = this.getRequestOptions(access_token, '/users/' + username + '/projects', true, 'remote-calls.keystone.projects.list-user', 'projects');

		const body = await this.request.get<{
			projects: IProject[];
			links: ILinks;
		}>(request_options);

		const projects_array = [] as ArrayWithLinks<IProject>;

		for (let n = 0; n < body.projects.length; n++) {
			projects_array[n] = body.projects[n];
		}

		// tack these on for easy consupmtion and in case we ever need pagination
		projects_array.self = body.links.self;
		projects_array.previous = body.links.previous;
		projects_array.next = body.links.next;
		return projects_array;
	}

	// gets the details of a specific project by name
	// calls back with cb(error, project_array)
	// ***NOTE: admin_access_token is a scoped token from a project you have admin rights on - yes this is weird
	// ***NOTE: this will return an error if 2 projects are named the same - not usable unless distinct projects are configured/required.
	public async getProjectByName(admin_access_token: string, project_name: string) {
		const request_options = this.getRequestOptions(admin_access_token, '/projects?name=' + project_name, true, 'remote-calls.keystone.projects.get-by-name', 'projects');

		const body = await this.request.get<{
			projects: IProject[];
		}>(request_options);

		const project_object = {} as IProject;

		if (body.projects.length > 1) {
			// kind of an error... in theory
			throw new Error('Found multiple projects with same name');
		}
		// else

		if (body.projects.length === 0) {
			// not an error but no data either
			return project_object;
		}
		// else

		// we are good
		return body.projects[0];
	}


	// gets a list of roles for the given project (specified by token ...kinda weird)
	// calls back with (error, roles_array) and self, previous, and null are tacked on as properties of the array
	// NOTE: this needs a project token scoped in our system - this may vary depending on how the security is setup
	public async listRoles(project_token: string) {
		const request_options = this.getRequestOptions(project_token, '/roles', true, 'remote-calls.keystone.roles.get', 'roles');

		const body = await this.request.get<{
			roles: IRole[];
			links: ILinks;
		}>(request_options);

		// console.log('roles', body);
		let n = 0;
		const roles_array = [] as ArrayWithLinks<IRole>;

		// else

		for (n = 0; n < body.roles.length; n++) {
			roles_array[n] = body.roles[n];
		}

		// tack these on for easy consupmtion and in case we ever need pagination
		roles_array.self = body.links.self;
		roles_array.previous = body.links.previous;
		roles_array.next = body.links.next;

		return roles_array;
	}

	// make a callback(error, assignments_array) with all of the role assignments for a project
	// NOTE: this is only works if the user is authed as an admin or projectAdmin
	public async listRoleAssignments(project_token: string, project_id: string) {
		const request_options = this.getRequestOptions(project_token, '/role_assignments?scope.project.id=' + project_id, true, 'remote-calls.keystone.role-assigments.list', 'role_assignments');

		const body = await this.request.get<{
			role_assignments: IRoleAssignment[];
			links: ILinks;
		}>(request_options);

		const assignments_array = [] as ArrayWithLinks<IRoleAssignment>;
		let n = 0;

		for (n = 0; n < body.role_assignments.length; n++) {
			assignments_array[n] = body.role_assignments[n];
		}

		// tack these on for easy consupmtion and in case we ever need pagination
		assignments_array.self = body.links.self;
		assignments_array.previous = body.links.previous;
		assignments_array.next = body.links.next;

		return assignments_array;
	}


	// make a callback(error) after adding a specific role assignment to a project (either a user or a group)
	// NOTE: this is only works if the user is authed as an admin or projectAdmin
	public addRoleAssignment(project_token: string, project_id: string, entry_id: string, entry_type: 'group' | 'users', role_id: string) {
		let entry_type_path = 'users';

		if (entry_type === 'group') {
			entry_type_path = 'groups';
		}
		const request_options = this.getRequestOptions(project_token, '/projects/' + project_id + '/' + entry_type_path + '/' + entry_id + '/roles/' + role_id, true, 'remote-calls.keystone.role-assignments.add');


		// the body comes back as undefined instead of containing the new role assingment - lame
		return this.request.put(request_options);
	}


	// make a callback(error) after removing a specific role assignments on a project(either a user or a group)
	// NOTE: this is only works if the user is authed as an admin or projectAdmin
	public removeRoleAssignment(project_token: string, project_id: string, entry_id: string, entry_type: string, role_id: string) {
		let entry_type_path = 'users';

		if (entry_type === 'group') {
			entry_type_path = 'groups';
		}

		const request_options = this.getRequestOptions(project_token, '/projects/' + project_id + '/' + entry_type_path + '/' + entry_id + '/roles/' + role_id, true, 'remote-calls.keystone.role-assignments.remove');

		return this.request.del(request_options);
	}

	// gets a list of all regions in the system
	// calls back with cb(error, region_array)
	public async listRegions(access_token: string) {
		const request_options = this.getRequestOptions(access_token, '/regions', true, 'remote-calls.keystone.regions.list', 'regions');

		const body = await this.request.get<{
			regions: IRegion[];
			links: ILinks;
		}>(request_options);
		// No mangling
		// You should handle input and output mangling outside of this lib going forward
		const regions_array = body.regions as ArrayWithLinks<IRegion>;

		// tack these on for easy consupmtion and in case we ever need pagination
		regions_array.self = body.links.self;
		regions_array.previous = body.links.previous;
		regions_array.next = body.links.next;

		return regions_array;
	}

	// THE FOLLOWING ARE ONLY USEFUL WITHIN GODADDY (and are prioprietary functions until/if the project meta data work is adopted)
	// THUS THEY AREN"T DOCUMENTED
	// --------------------------------------------------------------------------
	// make a callback(error) after retrieving all of the possible environments for the project/server meta data
	// calls back with cb(error, environments_array)
	public async listMetaEnvironments(auth_token: string) {
		const request_options = this.getRequestOptions(auth_token, '/meta_values/environment', true, 'remote-calls.keystone.meta-environments.get', 'environments');

		const body = await this.request.get<{
			environments: IEnvironment[];
		}>(request_options);

		return body.environments;
	}

	// make a callback(error) after retrieving all of the possible ownsers for the project/server meta data
	// calls back with cb(error, owning_groups_array)
	public async listMetaOwningGroups(auth_token: string) {
		const request_options = this.getRequestOptions(auth_token, '/meta_values/owning_group', true, 'remote-calls.keystone.meta-owninggroups.get', 'owning_groups');

		const body = await this.request.get<{
			owning_groups: IOwningGroup[];
		}>(request_options);

		return body.owning_groups;
	}

	// make a callback(error) after listing all of the project meta data
	// calls back with cb(error, meta_object)
	public async listProjectMeta(project_token: string, project_id: string) {
		const request_options = this.getRequestOptions(project_token, '/projects/' + project_id + '/meta', true, 'remote-calls.keystone.projects.meta.get', 'meta');

		const body = await this.request.get<{
			meta: IMeta;
		}>(request_options);

		return body.meta;
	}

	// make a callback(error) after updating the project meta data
	// meta_data should be an object with key-value pairs ie: {environment: 'dev', group: 'marketing'}
	// calls back with cb(error, meta_object)
	public async updateProjectMeta(project_token: string, project_id: string, new_meta: string) {
		const meta_data = { meta: new_meta };

		const request_options = this.getRequestOptions(project_token, '/projects/' + project_id + '/meta', meta_data, 'remote-calls.keystone.projects.meta.update', 'meta');
		const body = await this.request.put<{
			meta: IMeta;
		}>(request_options);

		return body.meta;
	}

	// make a callback(error, project_authorization) with all of the data on a project and an access token for further calls on it
	// NOTE: this is not the admin function that gets project details - you have to do this so I'm not bothering with that
	private async getProjectTokenForReal(auth_data: IAuthData) {
		// use the normal getRequestOptions but send in a bogus token and nullfiy the header
		// the token will get passed in the data in this call
		const request_options = this.getRequestOptions('bogus', '/auth/tokens', auth_data, 'remote-calls.keystone.tokens.get-project', 'token');

		const {
			body,
			res
		} = await this.request.request<{
			token: {
				token: string;
				is_domain: boolean,
				methods: string[];
				roles:
				IRole[];
				expires_at: string;
				project: IProject;
				catalog: ICatalog[],
				user: IUser;
				audit_ids: string[];
				issued_at: string;
			};
		}>({
			...request_options,
			method: 'POST'
		});

		// hack to put the actual token value back into the body
		body.token.token = res.headers['x-subject-token'] as string;
		return body.token;
	}

	// returns an formatted options object - just makes the code below a little less repetitious
	// auth_token can be either a generic or project scoped token depending what your doing
	// json_value should be almost certainly be true if you don't have an actual object you want to send over
	// NOTE: because keystone is non-project specific this function is different than all the other classes with it
	private getRequestOptions(auth_token: string, path: string, json_value: unknown, metricPath: string, requireBodyObject?: string) {
		const return_object = {
			headers: { 'X-Auth-Token': auth_token } as { [key: string]: string; },
			json: json_value,
			metricLogger: this.logger,
			metricPath,
			metricRequestID: this.request_id,
			metricUserName: this.user_name,
			requireBodyObject,
			timeout: this.timeout,
			uri: this.url + path,
			validateStatus: true
		};

		return return_object;
	}
}
