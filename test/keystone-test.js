const Keystone = require('../dist/keystone.js').default;
const keystone = new Keystone('http://mock_keystone_url');


//returns a mock request object for dependency injection with the get method calling back with the given 3 values
function getMockRequest(return_error, return_status_code, return_headers, return_response) {
	function mockVerb(options_array) {
		if (return_error) {
			throw return_error;
		} else {
			return return_response;
		}
	}

	function mockVerb2(options_array) {
		if (return_error) {
			throw return_error;
		} else {
			return {
				res: {
					statusCode: return_status_code,
					headers: return_headers
				},
				body: return_response
			};
		}
	}

	const return_object = {
		get: mockVerb,
		post: mockVerb,
		request: mockVerb2,
		patch: mockVerb,
		put: mockVerb,
		del: mockVerb
	};

	return return_object;
}


exports.getRequestOptions = {
	setUp: function (cb) {
		cb();
	},


	confirmResult(test) {
		const result = keystone.getRequestOptions('mock_token', '/mock_path', { meh: 'meh' }, 'a', 'b');
		const expected_result = {
			uri: 'http://mock_keystone_url/mock_path',
			headers: { 'X-Auth-Token': 'mock_token' },
			json: { meh: 'meh' },
			timeout: 9000,
			metricPath: 'a',
			metricRequestID: '',
			metricUserName: '',
			metricLogger: null,
			requireBodyObject: 'b',
			validateStatus: true
		};

		test.deepEqual(result, expected_result, 'result should be ' + JSON.stringify(expected_result));
		test.done();
	}
};



exports.getToken = {
	setUp: function (cb) {
		//we'll need these a few times so...
		this.valid_response_headers = { 'x-subject-token': 'token_value' };
		this.valid_response_body = { token: { meh: 'meh' } };
		this.valid_result = { meh: 'meh', token: 'token_value' };

		cb();
	},


	async confirmTokenOnSuccess(test) {
		//stub out the request for a completely valid response
		const self = this;
		const mock_request = getMockRequest(null, 200, this.valid_response_headers, this.valid_response_body);
		keystone.setRequest(mock_request);

		const result = await keystone.getToken('username', 'password');
		test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out request for an automagic 500 with junk text in the body
		const mock_request = getMockRequest(new Error('meh'), 500, this.valid_response_headers, this.valid_response_body);
		keystone.setRequest(mock_request);
		try {
			await keystone.getToken('username', 'password');
		} catch (error) {
			test.ok(error, "We should receive an error object or string");
			test.done();
		}
	}
};



exports.getProjectToken = {
	setUp: function (cb) {
		//we'll need these a few times so...
		this.valid_response_headers = { 'x-subject-token': 'token_value' };
		this.valid_response_body = { token: { meh: 'meh' } };
		this.valid_result = { meh: 'meh', token: 'token_value' };

		cb();
	},


	async confirmTokenOnSuccess(test) {
		//stub out the request for a completely valid response
		const self = this;
		const mock_request = getMockRequest(null, 200, this.valid_response_headers, this.valid_response_body);
		keystone.setRequest(mock_request);

		const result = await keystone.getProjectToken('access_token', 'project_id');
		test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out request for a 500 with a valid header/body (worst case scenario)
		const mock_request = getMockRequest(new Error('meh'), 500, this.valid_response_headers, this.valid_response_body);
		keystone.setRequest(mock_request);
		try {
			await keystone.getProjectToken("access_token", "project_id");
		} catch (error) {
			test.ok(error, "We should receive an error object or string");
			test.done();
		}
	}
};




exports.listProjects = {
	setUp: function (cb) {
		//we'll need these a few times so...
		this.valid_response_body = { links: { self: 'selfurl', previous: null, next: null }, projects: [] };
		this.valid_result = [];
		this.valid_result.self = 'selfurl';
		this.valid_result.previous = null;
		this.valid_result.next = null;

		cb();
	},


	async confirmProjectsOnSuccess(test) {
		//stub out request with a completely valid response
		const self = this;
		const mock_request = getMockRequest(null, 200, {}, this.valid_response_body);
		keystone.setRequest(mock_request);

		const result = await keystone.listProjects('accesstoken');
		test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out request for a 500 with a valid body (worst case scenario)
		const mock_request = getMockRequest(new Error('meh'), 500, {}, this.valid_response_body);
		keystone.setRequest(mock_request);
		try {
			await keystone.listProjects('accesstoken');
		} catch (error) {
			test.ok(error, "We should receive an error object");
			test.done();
		}
	}
};



exports.listUserProjects = {
	setUp: function (cb) {
		//we'll need these a few times so...
		this.valid_response_body = { links: { self: 'selfurl', previous: null, next: null }, projects: [] };
		this.valid_result = [];
		this.valid_result.self = 'selfurl';
		this.valid_result.previous = null;
		this.valid_result.next = null;

		cb();
	},


	async confirmProjectsOnSuccess(test) {
		//stub out request with a completely valid response
		const self = this;
		const mock_request = getMockRequest(null, 200, {}, this.valid_response_body);
		keystone.setRequest(mock_request);

		const result = await keystone.listUserProjects('username', 'accesstoken');
		test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
		test.done();
	},


	async confirmErrorOnError(test) {
		//stub out request for a 500 with a valid body (worst case scenario)
		const mock_request = getMockRequest(new Error('meh'), 500, {}, this.valid_response_body);
		keystone.setRequest(mock_request);
		try {
			await keystone.listUserProjects('username', 'accesstoken');
		} catch (error) {
			test.ok(error, "We should receive an error object");
			test.done();
		}
	}
};



exports.getProjectByName = {
	setUp: function (cb) {
		//we'll need these a few times so...
		this.valid_response_body = { links: { self: 'selfurl', previous: null, next: null }, projects: [{ meh: 'meh' }] };
		this.valid_result = { meh: 'meh' };

		cb();
	},

	async confirmProjectsOnSuccess(test) {
		//stub out request with a completely valid response
		const self = this;
		const mock_request = getMockRequest(null, 200, {}, this.valid_response_body);
		keystone.setRequest(mock_request);

		const result = await keystone.getProjectByName('accesstoken', 'project_name');
		test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
		test.done();
	},


	async confirmErrorOnError(test) {
		//stub out request for a 500 with a valid body (worst case scenario)
		const mock_request = getMockRequest(new Error('meh'), 500, {}, this.valid_response_body);
		keystone.setRequest(mock_request);
		try {
			await keystone.getProjectByName('accesstoken', 'project_name');
		} catch (error) {
			test.ok(error, "We should receive an error object");
			test.done();
		}
	}
};


exports.listRoles = {
	setUp: function (cb) {
		//we'll need these a few times so...
		this.valid_response_body = { links: { self: 'selfurl', previous: null, next: null }, roles: [] };
		this.valid_result = [];
		this.valid_result.self = 'selfurl';
		this.valid_result.previous = null;
		this.valid_result.next = null;

		cb();
	},


	async confirmRolesOnSuccess(test) {
		//stub out request with a completely valid response
		const self = this;
		const mock_request = getMockRequest(null, 200, {}, this.valid_response_body);
		keystone.setRequest(mock_request);

		const result = await keystone.listRoles('access_token');
		test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
		test.done();
	},


	async confirmErrorOnError(test) {
		//stub out request with an invalid status but a valid body/header
		const mock_request = getMockRequest(new Error('meh'), 500, {}, this.valid_response_body);
		keystone.setRequest(mock_request);
		try {
			await keystone.listRoles('accesstoken');
		} catch (error) {
			test.ok(error, "We should receive an error object or string");
			test.done();
		}
	}
};



exports.listRoleAssignments = {
	setUp: function (cb) {
		//we'll need these a few times so...
		this.valid_response_body = { links: { self: 'selfurl', previous: null, next: null }, role_assignments: [] };
		this.valid_result = [];
		this.valid_result.self = 'selfurl';
		this.valid_result.previous = null;
		this.valid_result.next = null;

		cb();
	},


	async confirmAssignmentsArrayOnSuccess(test) {
		//inject request to give a completely valid response
		const self = this;
		const mock_request = getMockRequest(null, 200, {}, this.valid_response_body);
		keystone.setRequest(mock_request);

		const result = await keystone.listRoleAssignments('access_token', 'project_id');
		test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
		test.done();
	},


	async confirmErrorOnError(test) {
		//stub out request for an invalid status but with a valid body
		const mock_request = getMockRequest(new Error('meh'), 500, {}, this.valid_response_body);
		keystone.setRequest(mock_request);
		try {
			await keystone.listRoleAssignments('accesstoken', 'project_id');
		} catch (error) {
			test.ok(error, "We should receive an error object");
			test.done();
		}
	}
};



exports.addRoleAssignment = {
	setUp: function (cb) {
		cb();
	},


	async confirmObjectOnSuccess(test) {
		//stub out a rquest with a valid result
		const mock_request = getMockRequest(null, 200, {}, {});
		keystone.setRequest(mock_request);

		await keystone.addRoleAssignment('access_token', 'project_id', 'entry_id', 'group', 'role_id');
		test.done();
	},


	async confirmErrorOnError(test) {
		//stub out request for an invalid status
		const mock_request = getMockRequest(new Error('meh'), 500, {}, 'Our server just borked');
		keystone.setRequest(mock_request);
		try {
			await keystone.addRoleAssignment('accesstoken', 'project_id', 'entry_id', 'user', 'role_id');
		} catch (error) {
			test.ok(error, "We should receive an error object or string");
			test.done();
		}
	}
};



exports.removeRoleAssignment = {
	setUp: function (cb) {
		cb();
	},


	async confirmNoErrorOnSuccess(test) {
		const mock_request = getMockRequest(null, 200, {}, {});
		keystone.setRequest(mock_request);

		//stub out a rquest with a valid result
		await keystone.removeRoleAssignment('access_token', 'project_id', 'entry_id', 'group', 'role_id');
		test.done();
	},


	async confirmErrorOnError(test) {
		//stub out request for an invalid status
		const mock_request = getMockRequest(new Error('meh'), 500, {}, 'Our server just borked');
		keystone.setRequest(mock_request);
		try {
			await keystone.removeRoleAssignment('accesstoken', 'project_id', 'entry_id', 'user', 'role_id');
		} catch (error) {
			test.ok(error, "We should receive an error object or string");
			test.done();
		}
	}
};



exports.listRegions = {
	setUp: function (cb) {
		//we'll need these a few times so...
		this.valid_response_body = {
			links: { self: 'selfurl', previous: null, next: null },
			regions: [
				{
					"description": "",
					"id": "RegionOne",
					"links": { "self": "selfurl" },
					"parent_region_id": null
				}
			]
		};

		this.valid_result = [
			{
				"description": "",
				"id": "RegionOne",
				"links": { "self": "selfurl" },
				"parent_region_id": null
			}
		];

		this.valid_result.self = 'selfurl';
		this.valid_result.previous = null;
		this.valid_result.next = null;
		cb();
	},

	async confirmRegionsOnSuccess(test) {
		//stub out request with a completely valid response
		const self = this;
		const mock_request = getMockRequest(null, 200, {}, this.valid_response_body);
		keystone.setRequest(mock_request);
		const result = await keystone.listRegions('accesstoken');
		test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out request for a 500 with a valid body (worst case scenario)
		const mock_request = getMockRequest(new Error('meh'), 500, {}, this.valid_response_body);
		keystone.setRequest(mock_request);
		try {
			await keystone.listRegions('accesstoken');
		} catch (error) {
			test.ok(error, "We should receive an error object");
			test.done();
		}
	}
};


exports.listMetaEnvironments = {
	setUp: function (cb) {
		this.valid_result = [{ id: 'DEV', name: 'Development' }];
		cb();
	},


	async confirmObjectsOnSuccess(test) {
		//stub out a rquest with a valid result
		const self = this;
		const mock_request = getMockRequest(null, 200, {}, { environments: [{ id: 'DEV', name: 'Development' }] });
		keystone.setRequest(mock_request);

		const result = await keystone.listMetaEnvironments('access_token');
		test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
		test.done();
	},


	async confirmErrorOnError(test) {
		//stub out request for an invalid status
		const mock_request = getMockRequest(new Error('meh'), 500, {}, 'Our server just borked');
		keystone.setRequest(mock_request);
		try {
			await keystone.listMetaEnvironments('accesstoken');
		} catch (error) {
			test.ok(error, "We should receive an error object or string");
			test.done();
		}
	}
};


exports.listMetaOwningGroups = {
	setUp: function (cb) {
		this.valid_result = [{ id: '1 - Group Name', name: 'Group Name' }];
		cb();
	},


	async confirmObjetsOnSuccess(test) {
		//stub out a rquest with a valid result
		const self = this;
		const mock_request = getMockRequest(null, 200, {}, { owning_groups: [{ id: '1 - Group Name', name: 'Group Name' }] });
		keystone.setRequest(mock_request);

		const result = await keystone.listMetaOwningGroups('access_token');
		test.deepEqual(result, self.valid_result, JSON.stringify(result) + '!=' + JSON.stringify(self.valid_result));
		test.done();
	},


	async confirmErrorOnError(test) {
		//stub out request for an invalid status
		const mock_request = getMockRequest(new Error('meh'), 500, {}, 'Our server just borked');
		keystone.setRequest(mock_request);
		try {
			await keystone.listMetaOwningGroups('accesstoken');
		} catch (error) {
			test.ok(error, "We should receive an error object or string");
			test.done();
		}
	}
};


exports.listProjectMeta = {
	setUp: function (cb) {
		this.valid_result = { name: 'value' };
		cb();
	},


	async confirmObjectsOnSuccess(test) {
		//stub out a rquest with a valid result
		const self = this;
		const mock_request = getMockRequest(null, 200, {}, { meta: { name: 'value' } });
		keystone.setRequest(mock_request);

		const result = await keystone.listProjectMeta('access_token', 'project_id');
		test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
		test.done();
	},


	async confirmErrorOnError(test) {
		//stub out request for an invalid status
		const mock_request = getMockRequest(new Error('meh'), 500, {}, 'Our server just borked');
		keystone.setRequest(mock_request);
		try {
			await keystone.listProjectMeta('accesstoken', 'project_id');
		} catch (error) {
			test.ok(error, "We should receive an error object or string");
			test.done();
		}
	}
};


exports.updateProjectMeta = {
	setUp: function (cb) {
		this.valid_result = { name: 'value' };
		cb();
	},


	async confirmObjectOnSuccess(test) {
		//stub out a rquest with a valid result
		const self = this;
		const mock_request = getMockRequest(null, 200, {}, { meta: { name: 'value' } });
		keystone.setRequest(mock_request);

		const result = await keystone.updateProjectMeta('access_token', 'project_id', { environment: 'ENV', owning_group: 'GROUPID' });
		test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
		test.done();
	},


	async confirmErrorOnError(test) {
		//stub out request for an invalid status
		const mock_request = getMockRequest(new Error('meh'), 500, {}, 'Our server just borked');
		keystone.setRequest(mock_request);

		try {
			await keystone.updateProjectMeta('accesstoken', 'project_id', { environment: 'ENV', owning_grouop: 'GROUPID' });
		} catch (error) {
			test.ok(error, "We should receive an error object or string");
			test.done();
		}
	}
};