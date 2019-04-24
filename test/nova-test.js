const Nova = require('../dist/nova.js').default;
const nova = new Nova('mock_url', 'mock_token');

//returns a mock request object for dependency injection with the get method calling back with the given 3 values
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
	setUp(cb) {
		cb();
	},

	confirmResult(test) {
		const result = nova.getRequestOptions('/mock_path', { meh: 'meh' }, 'a', 'b', true);
		const expected_result = {
			uri: 'mock_url/mock_path',
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



exports.listServers = {
	setUp(callback) {
		callback();
	},

	async confirmArrayOnSuccess(test) {
		const mock_request = getMockRequest(null, 200, { servers: [{ status: 'ACTIVE' }] });
		nova.setRequest(mock_request);

		const result = await nova.listServers();
		test.equal(result[0].status, 'ACTIVE', 'value should be "ACTIVE"');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.listServers();
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.getServer = {
	async confirmObjectOnSuccess(test) {
		const mock_request = getMockRequest(null, 200, { server: { status: 'ACTIVE' } });
		nova.setRequest(mock_request);

		const result = await nova.getServer('mock_id');
		test.equal(result.status, 'ACTIVE', 'value should be "ACTIVE"');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.getServer('mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.createServer = {
	async confirmObjectOnSuccess(test) {
		const mock_request = getMockRequest(null, 200, { server: { status: 'ACTIVE' } });
		nova.setRequest(mock_request);

		const result = await nova.createServer('mock_id');
		test.equal(result.status, 'ACTIVE', 'value should be "ACTIVE"');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.createServer('mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.renameServer = {
	async confirmNoErrorOnValidStatus(test) {
		const mock_request = getMockRequest(null, 200, 'mock_response');
		nova.setRequest(mock_request);

		await nova.renameServer('mock_id', 'mock_name');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.renameServer('mock_id', 'mock_name');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.resizeServer = {
	async confirmNoErrorOnValidStatus(test) {
		const mock_request = getMockRequest(null, 200, 'mock_response');
		nova.setRequest(mock_request);

		await nova.resizeServer('mock_id', 'mock_flavor_id');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.resizeServer('mock_id', 'mock_flavor_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.confirmResizeServer = {
	async confirmNoErrorOnValidStatus(test) {
		const mock_request = getMockRequest(null, 200, 'mock_response');
		nova.setRequest(mock_request);

		await nova.confirmResizeServer('mock_id');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.confirmResizeServer('mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.revertResizeServer = {
	async confirmNoErrorOnValidStatus(test) {
		const mock_request = getMockRequest(null, 200, 'mock_response');
		nova.setRequest(mock_request);

		await nova.revertResizeServer('mock_id');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.revertResizeServer('mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.removeServer = {
	async confirmNoErrorOnValidStatus(test) {
		const mock_request = getMockRequest(null, 200, 'mock response');
		nova.setRequest(mock_request);

		await nova.removeServer('mock_id');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.removeServer('mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.rebootServer = {
	async confirmNoErrorOnValidStatus(test) {
		const mock_request = getMockRequest(null, 200, 'mock response');
		nova.setRequest(mock_request);

		await nova.rebootServer('mock_id');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.rebootServer('mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.forceRebootServer = {
	async confirmNoErrorOnValidStatus(test) {
		const mock_request = getMockRequest(null, 200, 'mock response');
		nova.setRequest(mock_request);

		await nova.forceRebootServer('mock_id');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.forceRebootServer('mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.stopServer = {
	async confirmNoErrorOnValidStatus(test) {
		const mock_request = getMockRequest(null, 200, 'mock response');
		nova.setRequest(mock_request);

		await nova.stopServer('mock_id');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.stopServer('mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.startServer = {
	async confirmNoErrorOnValidStatus(test) {
		const mock_request = getMockRequest(null, 200, 'mock response');
		nova.setRequest(mock_request);

		await nova.startServer('mock_id');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.startServer('mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.pauseServer = {
	async confirmNoErrorOnValidStatus(test) {
		const mock_request = getMockRequest(null, 200, { meh: 'meh' });
		nova.setRequest(mock_request);

		await nova.pauseServer('mock_id');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.pauseServer('mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.suspendServer = {
	async confirmNoErrorOnValidStatus(test) {
		const mock_request = getMockRequest(null, 200, { meh: 'meh' });
		nova.setRequest(mock_request);

		await nova.suspendServer('mock_id');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.suspendServer('mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.resumeServer = {
	async confirmNoErrorOnSuccess(test) {
		//can't use the normal getMockRequest here as there are actually 2 requests in this function
		//first a get in getById then a post in the actual function
		const mock_request = {
			get: function (options_array, callback) {
				return { server: { status: 'PAUSED' } };
			},
			post: function (options_array, callback) {
				return { meh: 'meh' };
			}
		};
		nova.setRequest(mock_request);

		await nova.resumeServer('mock_id');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.resumeServer('mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.getServerConsoleUrl = {
	async confirmURLOnSuccess(test) {
		const mock_request = getMockRequest(null, 200, { console: { url: 'http://something' } });
		nova.setRequest(mock_request);

		const result = await nova.getServerConsoleURL('mock-type', 'mock_id');
		test.equal(result, 'http://something', 'value should be boolean "http://something"');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.getServerConsoleURL('mock-type', 'mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.getServerLog = {
	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);

		try {
			await nova.getServerLog('mock_id', 50);
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.createServerImage = {
	async confirmResponseOnSuccessOldNova(test) {
		const mock_request = {
			request(options_array, callback) {
				return {
					res: { statusCode: 200, headers: { location: '/images/mock_id' } },
					body: {
						output: { result: 'result' }
					}
				};
			}
		};
		nova.setRequest(mock_request);

		const result = await nova.createServerImage('mock_id', { meh: 'meh' });
		test.deepEqual({ image_id: 'mock_id' }, result, 'value should be {image_id: "mock_id"}');
		test.done();
	},

	async confirmResponseOnSuccessNewNova(test) {
		const mock_request = {
			request: function (options_array, callback) {
				return {
					body: {
						image_id: 'mock_id'
					}
				};
			}
		};
		nova.setRequest(mock_request);

		const result = await nova.createServerImage('mock_id', { meh: 'meh' });
		test.deepEqual({ image_id: 'mock_id' }, result, 'value should be {image_id: "mock_id"}');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.createServerImage('mock_id', { meh: 'meh' });
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};


//tests Nova.Instance.setMetadata()
exports.setServerMetadata = {
	async confirmResponseOnSuccess(test) {
		const mock_request = getMockRequest(null, 200, { x: 'x' });
		nova.setRequest(mock_request);

		const result = await nova.setServerMetadata('mock_id', { meh: 'meh' });
		test.deepEqual({ x: 'x' }, result, 'value should be {x: "x"}');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.setServerMetadata('mock_id', { meh: 'meh' });
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.listFlavors = {
	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.listFlavors();
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};


exports.getFlavor = {
	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);

		try {
			await nova.getFlavor("id");
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};


exports.listProjectNetworks = {
	setUp(cb) {
		this.valid_response_body = {
			networks: [
				{
					"cidr": "10.0.0.0/29",
					"id": "616fb98f-46ca-475e-917e-2563e5a8cd19",
					"label": "test_0"
				},
				{
					"cidr": "10.0.0.8/29",
					"id": "616fb98f-46ca-475e-917e-2563e5a8cd20",
					"label": "test_1"
				}
			]
		};

		this.valid_result = [
			{
				"cidr": "10.0.0.0/29",
				"id": "616fb98f-46ca-475e-917e-2563e5a8cd19",
				"label": "test_0"
			},
			{
				"cidr": "10.0.0.8/29",
				"id": "616fb98f-46ca-475e-917e-2563e5a8cd20",
				"label": "test_1"
			}
		];

		cb();
	},

	async confirmArrayValuesOnSuccess(test) {
		const self = this;
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		nova.setRequest(mock_request);
		const result = await nova.listProjectNetworks();
		test.deepEqual(result, self.valid_result, 'value should match object: ' + JSON.stringify(self.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.listProjectNetworks();
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};


exports.floatinglistFloatingIpsip_list = {
	async confirmArrayOnSuccess(test) {
		const mock_request = getMockRequest(null, 200, { floating_ips: [{ status: 'ACTIVE' }] });
		nova.setRequest(mock_request);

		const result = await nova.listFloatingIps();
		test.equal(result[0].status, 'ACTIVE', 'value should be "ACTIVE"');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.listFloatingIps();
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.getFloatingIp = {
	async confirmObjectOnSuccess(test) {
		const mock_request = getMockRequest(null, 200, { floating_ip: { meh: 'meh' } });
		nova.setRequest(mock_request);

		const result = await nova.getFloatingIp('mock_id');
		test.deepEqual(result, { meh: 'meh' }, 'value should be an object {meh: "meh"}');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.getFloatingIp("id");
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.createFloatingIp = {
	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.createFloatingIp({});
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.removeFloatingIp = {
	async confirmNoErrorOnSuccess(test) {
		const mock_request = getMockRequest(null, 200, true);
		nova.setRequest(mock_request);

		await nova.removeFloatingIp('mock_id');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.removeFloatingIp("id");
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.associateFloatingIp = {
	async confirmNoErrorOnSuccess(test) {
		const mock_request = getMockRequest(null, 204, true);
		nova.setRequest(mock_request);

		await nova.associateFloatingIp('mock_id', 'mock-address');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.associateFloatingIp("mock_id", 'mock-address');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.disassociateFloatingIp = {
	async confirmNoErrorOnSuccess(test) {
		const mock_request = getMockRequest(null, 204, true);
		nova.setRequest(mock_request);

		await nova.disassociateFloatingIp('mock_id', 'mock-address');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.disassociateFloatingIp("mock_id", 'mock-address');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.listFloatingIpPools = {
	setUp(cb) {
		this.valid_response_body = { floating_ip_pools: [{ name: 'mock_id' }] };
		this.valid_result = [{ name: 'mock_id' }];

		cb();
	},

	async confirmArrayOnSuccess(test) {
		const self = this;
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		nova.setRequest(mock_request);

		const result = await nova.listFloatingIpPools();
		test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.listFloatingIpPools();
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.getFloatingIpPool = {
	setUp(cb) {
		//this function will actually call listIpPools so use a valid response body for that
		this.valid_response_body = { floating_ip_pools: [{ name: 'mock_id' }] };
		//just need the individual matching object though for the valid result check
		this.valid_result = { name: 'mock_id' };

		cb();
	},


	async confirmObjectOnSuccess(test) {
		const self = this;
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		nova.setRequest(mock_request);

		const result = await nova.getFloatingIpPool('mock_id');
		test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.getFloatingIpPool("not-testid");
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.listAvailabilityZones = {
	setUp(cb) {
		this.valid_response_body = { availabilityZoneInfo: [{ zoneName: 'mock_name1' }, { zoneName: 'mock_name2' }] };
		this.valid_result = [{ zoneName: 'mock_name1' }, { zoneName: 'mock_name2' }];

		cb();
	},

	async confirmArrayValuesOnSuccess(test) {
		const self = this;
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		nova.setRequest(mock_request);

		const result = await nova.listAvailabilityZones();
		test.deepEqual(result, self.valid_result, 'value should match object: ' + JSON.stringify(self.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.listAvailabilityZones();
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.getAvailabilityZone = {
	setUp(cb) {
		this.valid_response_body = { availabilityZoneInfo: [{ zoneName: 'mock_name' }, { zoneName: 'mock_name2' }] };
		this.valid_result = { zoneName: 'mock_name' };

		cb();
	},

	async confirmObjectOnSuccess(test) {
		const self = this;
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		nova.setRequest(mock_request);

		const result = await nova.getAvailabilityZone('mock_name');
		test.deepEqual(result, self.valid_result, 'value should be an object: ' + JSON.stringify(self.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.getAvailabilityZone("not-testname");
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.listKeyPairs = {
	setUp(cb) {
		this.valid_response_body = { keypairs: [{ keypair: { name: 'mock_name' } }, { keypair: { name: 'mock_name2' } }] };
		this.valid_result = [{ name: 'mock_name' }, { name: 'mock_name2' }];

		cb();
	},

	async confirmArrayValuesOnSuccess(test) {
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		nova.setRequest(mock_request);

		const result = await nova.listKeyPairs();
		test.deepEqual(result, this.valid_result, 'value should match object: ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.listKeyPairs();
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.getKeyPair = {
	async confirmObjectOnSuccess(test) {
		const mock_request = getMockRequest(null, 200, { keypair: { meh: 'meh' } });
		nova.setRequest(mock_request);

		const result = await nova.getKeyPair('mock_id');
		test.deepEqual(result, { meh: 'meh' }, 'value should be an object {meh: "meh"}');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.getKeyPair('mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.createKeyPair = {
	async confirmObjectOnSuccess(test) {
		const mock_request = getMockRequest(null, 200, { keypair: { meh: 'meh' } });
		nova.setRequest(mock_request);

		const result = await nova.createKeyPair('mock_name', 'mock-key');
		test.deepEqual(result, { meh: 'meh' }, 'value should be an object {meh: "meh"}');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.createKeyPair('mock_name', 'mock-key');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.removeKeyPair = {
	async confirmSuccessOn200(test) {
		const mock_request = getMockRequest(null, 200, { keypair: { meh: 'meh' } });
		nova.setRequest(mock_request);

		await nova.removeKeyPair('mock_id');
		//I think thats all we can test for...
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);

		try {
			await nova.removeKeyPair('mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.getQuotaSet = {
	setUp(cb) {
		this.valid_response_body = { quota_set: { ram: 1234 } };
		this.valid_result = { ram: 1234 };

		cb();
	},

	async confirmValueOnSuccess(test) {
		const self = this;
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		nova.setRequest(mock_request);

		const result = await nova.getQuotaSet('mock_id');
		test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.getQuotaSet('mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};




exports.setQuotaSet = {
	setUp(cb) {
		this.valid_response_body = { quota_set: { ram: 1234 } };
		this.valid_result = { ram: 1234 };

		cb();
	},

	async confirmValueOnSuccess(test) {
		const self = this;
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		nova.setRequest(mock_request);

		const result = await nova.setQuotaSet('mock_id', { ram: 1234 });
		test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.setQuotaSet('mock_id', {});
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};


exports.getTenantUsage = {
	setUp(cb) {
		this.valid_response_body = { tenant_usage: { total_hours: 3.14167 } };
		this.valid_result = { total_hours: 3.14167 };

		cb();
	},

	async confirmTenantUsageOnSuccess(test) {
		const self = this;
		const start_date = new Date();
		const end_date = new Date();
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		nova.setRequest(mock_request);

		const result = await nova.getTenantUsage('mock_id', start_date, end_date);
		test.deepEqual(result, self.valid_result, 'value should be an object: ' + JSON.stringify(self.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		const start_date = new Date();
		const end_date = new Date();
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.getTenantUsage('mock_id', start_date, end_date);
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.assignSecurityGroup = {
	async confirmNoErrorOn200(test) {
		const mock_request = getMockRequest(null, 200, { meh: 'meh' });
		nova.setRequest(mock_request);

		await nova.assignSecurityGroup('mock_name', 'mock_id');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);

		try {
			await nova.assignSecurityGroup('mock_name', 'mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.removeSecurityGroup = {
	async confirmValuesOnSuccess(test) {
		const mock_request = getMockRequest(null, 200, { meh: 'meh' });
		nova.setRequest(mock_request);

		await nova.removeSecurityGroup('mock_name', 'mock_id');
		test.done();
	},

	async confirmErrorOn5Error(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.removeSecurityGroup('mock_name', 'mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.getImageMetaData = {
	async confirmResponseOnSuccess(test) {
		const mock_request = getMockRequest(null, 200, { metadata: { x: 'x' } });
		nova.setRequest(mock_request);

		const result = await nova.getImageMetaData('mock_id');
		test.deepEqual({ x: 'x' }, result, 'value should be {x: "x"}');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);
		try {
			await nova.getImageMetaData('mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.setImageMetadata = {
	async confirmResponseOnSuccess(test) {
		const mock_request = getMockRequest(null, 200, { metadata: { x: 'x' } });
		nova.setRequest(mock_request);

		const result = await nova.setImageMetaData('mock_id', { meh: 'meh' });
		test.deepEqual({ x: 'x' }, result, 'value should be {x: "x"}');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		nova.setRequest(mock_request);

		try {
			await nova.setImageMetaData('mock_id', { meh: 'meh' });
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};
