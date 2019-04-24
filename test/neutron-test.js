const Neutron = require('../dist/neutron.js').default;
const neutron = new Neutron('http://mock_neutron_url', 'mock_token');



//returns a mock request object for dependency injection with get/post/patch/del methods calling back with the given 3 values
function getMockRequest(return_error, return_status_code, return_response) {
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

	async confirmResult(test) {
		const result = neutron.getRequestOptions('/mock_path', { meh: 'meh' }, 'a', 'b');
		const expected_result = {
			uri: 'http://mock_neutron_url/mock_path',
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



exports.listNetworks = {
	setUp: function (cb) {
		this.valid_response_body = { networks: [{ id: 1 }, { id: 2 }] };
		this.valid_result = [{ id: 1 }, { id: 2 }];

		cb();
	},

	async confirmValidResultOnSuccess(test) {
		//stub out a request obj with a completely valid response
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.listNetworks();
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.listNetworks();
		} catch (error) {
			test.ok(error, 'We should receive an error object or string');
			test.done();
		}
	}
};



exports.getNetwork = {
	setUp: function (cb) {
		this.valid_response_body = { network: { id: 1 } };
		this.valid_result = { id: 1 };

		cb();
	},

	async confirmFipsOnSuccess(test) {
		//stub out a request obj with a completely valid response
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.getNetwork('id');
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.getNetwork('id');
		} catch (error) {
			test.ok(error, 'We should receive an error object or string');
			test.done();
		}
	}
};



exports.createFloatingIp = {
	setUp: function (cb) {
		this.valid_response_body = { floatingip: { id: 'mock_id' } };
		this.valid_result = { id: 'mock_id' };

		cb();
	},

	async confirmValidResultOnSuccess(test) {
		//stub out a request obj with a completely valid response
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.createFloatingIp('mock_network_id');
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);
		try {
			await neutron.createFloatingIp('mock_network_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.listFloatingIps = {
	setUp: function (cb) {
		this.valid_response_body = { floatingips: [{ id: 1 }, { id: 2 }] };
		this.valid_result = [{ id: 1 }, { id: 2 }];

		cb();
	},

	async confirmPortsOnSuccess(test) {
		//stub out a request obj with a completely valid response
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.listFloatingIps({});
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmPortsOnSuccessWithOptions(test) {
		//stub out a request obj with a completely valid response
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.listFloatingIps({});

		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},


	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.listFloatingIps({});
		} catch (error) {
			test.ok(error, 'We should receive an error object or string');
			test.done();
		}
	}
};



exports.getFloatingIp = {
	setUp: function (cb) {
		this.valid_response_body = { floatingip: { id: 1 } };
		this.valid_result = { id: 1 };

		cb();
	},

	async confirmFipsOnSuccess(test) {
		//stub out a request obj with a completely valid response
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.getFloatingIp('id');
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.getFloatingIp('id');
		} catch (error) {
			test.ok(error, 'We should receive an error object or string');
			test.done();
		}
	}
};



exports.updateFloatingIp = {
	setUp: function (cb) {
		this.valid_response_body = { floatingip: { id: 'mock_id' } };
		this.valid_result = { id: 'mock_id' };

		cb();
	},

	async confirmValidResultOnSuccess(test) {
		//stub out a request obj with a completely valid response
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.updateFloatingIp('mock_id', 'mock_port_id');
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.updateFloatingIp('mock_id', 'mock_port_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.removeFloatingIp = {
	setUp: function (cb) {
		cb();
	},

	async confirmNoErrorOnSuccess(test) {
		//stub out a completely valid response
		const mock_request = getMockRequest(null, 200, '');
		neutron.setRequest(mock_request);

		await neutron.removeFloatingIp('mock_id');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.removeFloatingIp('mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};


exports.listPorts = {
	setUp: function (cb) {
		this.valid_response_body = { ports: [{ id: 1 }, { id: 2 }] };
		this.valid_result = [{ id: 1 }, { id: 2 }];

		cb();
	},

	async confirmPortsOnSuccess(test) {
		//stub out a request obj with a completely valid response
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.listPorts({});
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmPortsOnSuccessWithOptions(test) {
		//stub out a request obj with a completely valid response
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.listPorts({});
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},


	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);
		try {
			await neutron.listPorts();
		} catch (error) {
			test.ok(error, 'We should receive an error object or string');
			test.done();
		}
	}
};

exports.updatePort = {
	setUp: function (cb) {
		this.valid_response_body = { port: { id: 'mock_id' } };
		this.valid_result = { id: 'mock_id' };

		cb();
	},

	async confirmPortOnSuccess(test) {
		//stub out a request obj with a completely valid response
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.updatePort('mock_id', { name: 'mock_name' });
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);
		try {
			await neutron.updatePort('mock_id', { name: 'mock_name' });
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.listSecurityGroups = {
	setUp: function (cb) {
		this.valid_response_body = { security_groups: [{}, {}] };
		this.valid_result = [{}, {}];

		cb();
	},

	async confirmSecurityGroupsOnSuccess(test) {
		//stub out a request obj with a completely valid response
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.listSecurityGroups('mock_id');
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.listSecurityGroups('mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object or string');
			test.done();
		}
	}
};



exports.getSecurityGroup = {
	setUp: function (cb) {
		this.valid_response_body = { security_group: { id: 'mock_id' } };
		this.valid_result = { id: 'mock_id' };

		cb();
	},

	async confirmSecurityGroupOnSuccess(test) {
		//stub out a request obj with a completely valid response
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.getSecurityGroup('mock_id');
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.getSecurityGroup('mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};

exports.createSecurityGroup = {
	setUp: function (cb) {
		this.valid_response_body = { security_group: { id: 'mock_id' } };
		this.valid_result = { id: 'mock_id' };

		cb();
	},

	async confirmSecurityGroupOnSuccess(test) {
		//stub out a request obj with a completely valid response
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.createSecurityGroup('mock_name', { description: 'mock_description' });

		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.createSecurityGroup('mock_name', { description: 'mock_description' });
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.updateSecurityGroup = {
	setUp: function (cb) {
		this.valid_response_body = { security_group: { id: 'mock_id' } };
		this.valid_result = { id: 'mock_id' };

		cb();
	},

	async confirmSecurityGroupOnSuccess(test) {
		//stub out a request obj with a completely valid response
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.updateSecurityGroup('mock_id', { name: 'mock-name' });
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.updateSecurityGroup('mock_id', { name: 'mock-name' });
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.removeSecurityGroup = {
	setUp: function (cb) {
		cb();
	},

	async confirmNoErrorOnSuccess(test) {
		//stub out a completely valid response
		const mock_request = getMockRequest(null, 200, '');
		neutron.setRequest(mock_request);

		await neutron.removeSecurityGroup('mock_id');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.removeSecurityGroup('mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.listSecurityGroupRules = {
	setUp: function (cb) {
		this.valid_response_body = { security_group_rules: [{ id: 'mock_id' }, { id: 'mock_id2' }] };
		this.valid_result = [{ id: 'mock_id' }, { id: 'mock_id2' }];

		cb();
	},

	async confirmSecurityGroupRulesOnSuccess(test) {
		//stub out a completely valid request
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.listSecurityGroupRules();
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.listSecurityGroupRules();
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.getSecurityGroupRule = {
	setUp: function (cb) {
		this.valid_response_body = { security_group_rule: { id: 'mock_id' } };
		this.valid_result = { id: 'mock_id' };

		cb();
	},

	async confirmSecurityGroupRuleOnSuccess(test) {
		//stub out a completely valid request
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.getSecurityGroupRule('mock_id');
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.getSecurityGroupRule('mock_id')
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.createSecurityGroupRule = {
	setUp: function (cb) {
		this.valid_response_body = { security_group_rule: { id: 'mock_id' } };
		this.valid_result = { id: 'mock_id' };

		cb();
	},

	async confirmSecurityGroupRuleOnSuccess(test) {
		//stub out a completely valid request
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.createSecurityGroupRule('mock_id', 'mock_direction', { name: 'mock_name', description: 'mock_description' });
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	//stub out a request with a valid status but an invalid json response body
	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.createSecurityGroupRule('mock_id', { name: 'mock_name', description: 'mock_description' });
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



//various tests for neutron.securityRule.remove()
exports.removeSecurityGroupRule = {
	setUp: function (cb) {
		cb();
	},

	async confirmNoErrorOnSuccess(test) {
		//stub out a completely valid request
		const mock_request = getMockRequest(null, 200, '');
		neutron.setRequest(mock_request);

		await neutron.removeSecurityGroupRule('mock_id');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.removeSecurityGroupRule('mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};


exports.listLoadBalancers = {
	setUp: function (cb) {
		this.valid_response_body = {
			loadbalancers: [{ id: 'mock_id' }, { id: 'mock_id2' }]
		};
		this.valid_result = [{ id: 'mock_id' }, { id: 'mock_id2' }];

		cb();
	},

	async confirmLoadBalancersOnSuccess(test) {
		//stub out a completely valid request
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.listLoadBalancers();
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.listLoadBalancers();
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.getLoadBalancers = {
	setUp: function (cb) {
		this.valid_response_body = { loadbalancer: { id: 'mock_id' } };
		this.valid_result = { id: 'mock_id' };

		cb();
	},

	async confirmLoadBalancerOnSuccess(test) {
		//stub out a completely valid request
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.getLoadBalancer('mock_id');
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.getLoadBalancer('mock_id')
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};

exports.createLoadBalancer = {
	setUp: function (cb) {
		this.valid_response_body = { loadbalancer: { id: 'mock_id' } };
		this.valid_result = { id: 'mock_id' };

		cb();
	},

	async confirmValidResultOnSuccess(test) {
		//stub out a completely valid request
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.createLoadBalancer('tenant_id', 'vip_subnet_id', { name: 'mock_name' });
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	//stub out a request with a valid status but an invalid json response body
	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.createLoadBalancer('tenant_id', 'vip_subnet_id', { name: 'mock_name' });
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};

exports.updateLoadBalancer = {
	setUp: function (cb) {
		this.valid_response_body = { loadbalancer: { id: 'mock_id' } };
		this.valid_result = { id: 'mock_id' };

		cb();
	},

	async confirmValidResultOnSuccess(test) {
		//stub out a request obj with a completely valid response
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.updateLoadBalancer('mock_id', { description: 'Updated LB' });
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.updateLoadBalancer('mock_id', { description: 'Updated LB' });
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};

exports.removeLoadBalancer = {
	setUp: function (cb) {
		cb();
	},

	async confirmNoErrorOnSuccess(test) {
		//stub out a completely valid response
		const mock_request = getMockRequest(null, 200, '');
		neutron.setRequest(mock_request);

		await neutron.removeLoadBalancer('mock_id');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.removeLoadBalancer('mock_id')
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};


exports.getLBStats = {
	setUp: function (cb) {
		this.valid_response_body = { stats: { id: 'mock_id' } };
		this.valid_result = { id: 'mock_id' };

		cb();
	},

	async confirmValidResultOnSuccess(test) {
		//stub out a completely valid request
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.getLBStats('lb_id');
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);
		try {
			await neutron.getLBStats('lb_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};


exports.listLBListeners = {
	setUp: function (cb) {
		this.valid_response_body = { listeners: [{ id: 'mock_id' }, { id: 'mock_id2' }] };
		this.valid_result = [{ id: 'mock_id' }, { id: 'mock_id2' }];

		cb();
	},

	async confirmLBListenersOnSuccess(test) {
		//stub out a completely valid request
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.listLBListeners();
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.listLBListeners();
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};


exports.getLBListener = {
	setUp: function (cb) {
		this.valid_response_body = { listener: { id: 'mock_id' } };
		this.valid_result = { id: 'mock_id' };

		cb();
	},

	async confirmLBListenerOnSuccess(test) {
		//stub out a completely valid request
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.getLBListener('mock_id');
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.getLBListener('mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};


exports.createLBListener = {
	setUp: function (cb) {
		this.valid_response_body = { listener: { id: 'mock_id' } };
		this.valid_result = { id: 'mock_id' };

		cb();
	},

	async confirmValidResultOnSuccess(test) {
		//stub out a completely valid request
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.createLBListener('tenant_id', 'loadbalancer_id', 'description', 'protocol', { protocol_port: 'mock_protocol_port' });
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	//stub out a request with a valid status but an invalid json response body
	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.createLBListener('tenant_id', 'loadbalancer_id', 'description', 'protocol', { protocol_port: 'mock_protocol_port' });
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.updateLBListener = {
	setUp: function (cb) {
		this.valid_response_body = { listener: { id: 'mock_id' } };
		this.valid_result = { id: 'mock_id' };

		cb();
	},

	async confirmValidResultOnSuccess(test) {
		//stub out a request obj with a completely valid response
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.updateLBListener('mock_id', { description: 'Updated Listener' });
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.updateLBListener('mock_id', { description: 'Updated Listener' });
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.removeLBListener = {
	setUp: function (cb) {
		cb();
	},

	async confirmNoErrorOnSuccess(test) {
		//stub out a completely valid response
		const mock_request = getMockRequest(null, 200, '');
		neutron.setRequest(mock_request);

		await neutron.removeLBListener('mock_id');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.removeLBListener('mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.listLBPools = {
	setUp: function (cb) {
		this.valid_response_body = { pools: [{ id: 'mock_id' }, { id: 'mock_id2' }] };
		this.valid_result = [{ id: 'mock_id' }, { id: 'mock_id2' }];

		cb();
	},

	async confirmLBPoolsOnSuccess(test) {
		//stub out a completely valid request
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.listLBPools();
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.listLBPools();
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.getLBPool = {
	setUp: function (cb) {
		this.valid_response_body = { pool: { id: 'mock_id' } };
		this.valid_result = { id: 'mock_id' };

		cb();
	},

	async confirmPoolOnSuccess(test) {
		//stub out a completely valid request
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.getLBPool('mock_id');
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.getLBPool('mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.createLBPool = {
	setUp: function (cb) {
		this.valid_response_body = { pool: { id: 'mock_id' } };
		this.valid_result = { id: 'mock_id' };

		cb();
	},

	async confirmValidResultOnSuccess(test) {
		//stub out a completely valid request
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.createLBPool('tenant_id', 'protocol', 'lb_algorithm', 'listener_id', { 'admin_state_up': 'mock_admin_state_up' });
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.createLBPool('tenant_id', 'protocol', 'lb_algorithm', 'listener_id', { 'admin_state_up': 'mock_admin_state_up' });
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.updateLBPool = {
	setUp: function (cb) {
		this.valid_response_body = { pool: { id: 'mock_id' } };
		this.valid_result = { id: 'mock_id' };

		cb();
	},

	async confirmValidResultOnSuccess(test) {
		//stub out a request obj with a completely valid response
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.updateLBPool('mock_id', { description: 'Updated LBPool' });
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.updateLBPool('mock_id', { description: 'Updated LBPool' });
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.removeLBPool = {
	setUp: function (cb) {
		cb();
	},

	async confirmNoErrorOnSuccess(test) {
		//stub out a completely valid response
		const mock_request = getMockRequest(null, 200, '');
		neutron.setRequest(mock_request);

		await neutron.removeLBPool('mock_id');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.removeLBPool('mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.listLBPoolMembers = {
	setUp: function (cb) {
		this.valid_response_body = { members: [{ id: 'mock_id' }, { id: 'mock_id2' }] };
		this.valid_result = [{ id: 'mock_id' }, { id: 'mock_id2' }];

		cb();
	},

	async confirmMembersOnSuccess(test) {
		//stub out a completely valid request
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.listLBPoolMembers('pool_id');
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.listLBPoolMembers('pool_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.getLBPoolMember = {
	setUp: function (cb) {
		this.valid_response_body = { member: { id: 'mock_id' } };
		this.valid_result = { id: 'mock_id' };

		cb();
	},

	async confirmMemberOnSuccess(test) {
		//stub out a completely valid request
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.getLBPoolMember('pool_id', 'member_id');
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.getLBPoolMember('pool_id', 'member_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};


exports.createLBPoolMember = {
	setUp: function (cb) {
		this.valid_response_body = { member: { id: 'mock_id' } };
		this.valid_result = { id: 'mock_id' };

		cb();
	},

	async confirmValidResultOnSuccess(test) {
		//stub out a completely valid request
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.createLBPoolMember('pool_id', 'tenant_id', 'address', 'protocol_port', { 'admin_state_up': 'mock_admin_state_up' });
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.createLBPoolMember('pool_id', 'tenant_id', 'address', 'protocol_port', { 'admin_state_up': 'mock_admin_state_up' });
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.updateLBPoolMember = {
	setUp: function (cb) {
		this.valid_response_body = { member: { id: 'mock_id' } };
		this.valid_result = { id: 'mock_id' };

		cb();
	},

	async confirmValidResultOnSuccess(test) {
		//stub out a request obj with a completely valid response
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.updateLBPoolMember('pool_id', 'member_id', { description: 'Updated LBPool' });
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.updateLBPoolMember('pool_id', 'member_id', { description: 'Updated LBPool' });
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.removeLBPoolMember = {
	setUp: function (cb) {
		cb();
	},

	async confirmNoErrorOnSuccess(test) {
		//stub out a completely valid response
		const mock_request = getMockRequest(null, 200, '');
		neutron.setRequest(mock_request);

		await neutron.removeLBPoolMember('pool_id', 'member_id');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.removeLBPoolMember('pool_id', 'member_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.listLBHealthMonitors = {
	setUp: function (cb) {
		this.valid_response_body = {
			healthmonitors: [{ id: 'mock_id' }, { id: 'mock_id2' }]
		};
		this.valid_result = [{ id: 'mock_id' }, { id: 'mock_id2' }];

		cb();
	},

	async confirmMembersOnSuccess(test) {
		//stub out a completely valid request
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.listLBHealthMonitors();
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.listLBHealthMonitors();
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.getLBHealthMonitor = {
	setUp: function (cb) {
		this.valid_response_body = { healthmonitor: { id: 'mock_id' } };
		this.valid_result = { id: 'mock_id' };

		cb();
	},

	async confirmValidResultOnSuccess(test) {
		//stub out a completely valid request
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.getLBHealthMonitor('health_monitor_id');
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.getLBHealthMonitor('health_monitor_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.createLBHealthMonitor = {
	setUp: function (cb) {
		this.valid_response_body = { healthmonitor: { id: 'mock_id' } };
		this.valid_result = { id: 'mock_id' };

		cb();
	},

	async confirmValidResultOnSuccess(test) {
		//stub out a completely valid request
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.createLBHealthMonitor('tenant_id', 'type', 'delay', 'timeout', 'max_retries', 'pool_id', { 'http_method': 'mock_http_method' });
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.createLBHealthMonitor('tenant_id', 'type', 'delay', 'timeout', 'max_retries', 'pool_id', { 'http_method': 'mock_http_method' });
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.updateLBHealthMonitor = {
	setUp: function (cb) {
		this.valid_response_body = { healthmonitor: { id: 'mock_id' } };
		this.valid_result = { id: 'mock_id' };

		cb();
	},

	async confirmValidResultOnSuccess(test) {
		//stub out a request obj with a completely valid response
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		neutron.setRequest(mock_request);

		const result = await neutron.updateLBHealthMonitor('health_monitor_id', { delay: 'mock_delay' });
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.updateLBHealthMonitor('health_monitor_id', { delay: 'mock_delay' });
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.removeLBHealthMonitor = {
	setUp: function (cb) {
		cb();
	},

	async confirmNoErrorOnSuccess(test) {
		//stub out a completely valid response
		const mock_request = getMockRequest(null, 200, '');
		neutron.setRequest(mock_request);

		await neutron.removeLBHealthMonitor('health_monitor_id');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		neutron.setRequest(mock_request);

		try {
			await neutron.removeLBHealthMonitor('health_monitor_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};