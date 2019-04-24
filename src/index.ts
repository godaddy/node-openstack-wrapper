import Glance from './glance';
import Heat from './heat';
import Keystone from './keystone';
import Neutron from './neutron';
import Nova from './nova';
import Octavia from './octavia';

// A convenience method for quick/dirty work for those that already have a project_id
// calls back with (error, project) where project already has all the individual objects setup
// ie: project.nova, project.glance, etc..
async function getSimpleProject(username: string, password: string, project_id: string, keystone_url: string) {
	const keystone = new Keystone(keystone_url);

	const token = await keystone.getToken(username, password);

	const project_token = await keystone.getProjectToken(token.token, project_id);
	const catalog_array = project_token.catalog;
	let glance_url = '';
	let heat_url = '';
	let neutron_url = '';
	let octavia_url = '';
	let nova_url = '';
	for (let n = 0; n < catalog_array.length; n++) {
		// ELS Puppet sometimes screws up Keystone and puts in duplicate service entries
		// that have no endpoints.. ignore these.
		if (!catalog_array[n].endpoints || !catalog_array[n].endpoints.length) {
			continue;
		}

		const endpoints_array = catalog_array[n].endpoints;
		const endpoint_type = catalog_array[n].type;

		for (let j = 0; j < endpoints_array.length; j++) {
			if (endpoints_array[j].interface === 'public') {
				endpoints_array[j].url = endpoints_array[j].url.replace(/\/$/, '');// yank any trailing /'s,

				if (endpoint_type === 'image') {
					// we have to add the v2 to the end to get the most current functionality
					glance_url = endpoints_array[j].url + '/v2.0';
				} else if (endpoint_type === 'network') {
					// we have to add the v2 to the end to get the most current functionality
					neutron_url = endpoints_array[j].url + '/v2.0';
				} else if (endpoint_type === 'compute') {
					nova_url = endpoints_array[j].url;
				} else if (endpoint_type === 'load-balancer') {
					octavia_url = endpoints_array[j].url;
				} else if (endpoint_type === 'orchestration') {
					heat_url = endpoints_array[j].url;
				}
				break;
			}
		}
	}

	return {
		general_token: token,
		glance: new Glance(glance_url, project_token.token),
		heat: new Heat(heat_url, project_token.token),
		neutron: new Neutron(neutron_url, project_token.token),
		nova: new Nova(nova_url, project_token.token),
		octavia: new Octavia(octavia_url, project_token.token),
		project_token
	};
}

export default {
	Glance,
	Heat,
	Keystone,
	Neutron,
	Nova,
	Octavia,
	getSimpleProject
};
