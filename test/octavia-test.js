const Octavia = require('../dist/octavia.js').default;
const octavia = new Octavia('http://mock_url', 'mock_token');

exports.getRequestOptions = {
	setUp(cb) {
		cb();
	},

	confirmResult(test) {
		const result = octavia.getRequestOptions('/mock_path', { meh: 'meh' }, 'a', 'b');
		const expected_result = {
			uri: 'http://mock_url/mock_path',
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



exports.listLoadBalancers = {
	setUp(cb) {
		cb();
	},

	async confirmLoadBalancersOnSuccess(test) {
		const valid_response_body = { loadbalancers: [{ id: 'mock_id' }, { id: 'mock_id2' }] };
		const expected_result = [{ id: 'mock_id' }, { id: 'mock_id2' }];
		const mock_request = {
			get: function (options, cb) {
				return valid_response_body;
			}
		};

		octavia.setRequest(mock_request);
		const result = await octavia.listLoadBalancers();
		test.deepEqual(result, expected_result, 'result should be ' + JSON.stringify(expected_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		const mock_request = {
			get: function (options, cb) {
				throw new Error('meh');
			}
		};
		octavia.setRequest(mock_request);
		try {
			await octavia.listLoadBalancers();
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.getLoadBalancers = {
	setUp(cb) {
		cb();
	},

	async confirmLoadBalancerOnSuccess(test) {
		const valid_response_body = { loadbalancer: { id: 'mock_id' } };
		const expected_result = { id: 'mock_id' };
		const mock_request = {
			get: function (options, cb) {
				return valid_response_body;
			}
		};
		octavia.setRequest(mock_request);

		const result = await octavia.getLoadBalancer('mock_id');
		test.deepEqual(result, expected_result, 'result should be ' + JSON.stringify(expected_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		const mock_request = {
			get: function (options, cb) {
				cb(new Error('meh'));
			}
		};
		octavia.setRequest(mock_request);
		try {
			await octavia.getLoadBalancer('mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};

exports.createLoadBalancer = {
	setUp(cb) {
		cb();
	},

	async confirmValidResultOnSuccess(test) {
		const valid_response_body = { loadbalancer: { id: 'mock_id' } };
		const valid_result = { id: 'mock_id' };
		const mock_request = {
			post: function (options, cb) {
				return valid_response_body;
			}
		};
		octavia.setRequest(mock_request);

		const result = await octavia.createLoadBalancer('mock_project_id', {});
		test.deepEqual(result, valid_result, 'result should be ' + JSON.stringify(valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		const mock_request = {
			post: function (options, cb) {
				throw new Error('mock');
			}
		};
		octavia.setRequest(mock_request);
		try {
			await octavia.createLoadBalancer('mock_project_id', {});
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.updateLoadBalancer = {
	setUp(cb) {
		cb();
	},

	async confirmValidResultOnSuccess(test) {
		const valid_response_body = { loadbalancer: { id: 'mock_id' } };
		const valid_result = { id: 'mock_id' };

		const mock_request = {
			put: function (options, cb) {
				return valid_response_body;
			}
		};
		octavia.setRequest(mock_request);

		const result = await octavia.updateLoadBalancer('mock_id', {});
		test.deepEqual(result, valid_result, 'result should be ' + JSON.stringify(valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		const mock_request = {
			put: function (options, cb) {
				throw new Error('mock');
			}
		};

		octavia.setRequest(mock_request);
		try {
			await octavia.updateLoadBalancer('mock_id', {});
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.removeLoadBalancer = {
	setUp(cb) {
		cb();
	},

	async confirmNoErrorOnSuccess(test) {
		const mock_request = {
			del: function (options, cb) {
				return {};
			}
		};
		octavia.setRequest(mock_request);

		await octavia.removeLoadBalancer('mock_id');
		test.done();
	},

	async confirmErrorOnError(test) {
		const mock_request = {
			del: function (options, cb) {
				throw new Error('mock');
			}
		};
		octavia.setRequest(mock_request);

		try {
			await octavia.removeLoadBalancer('mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



/*exports.listLBListeners = {
  setUp: function(cb){
    this.valid_response_body = {listeners: [{id: 'mock_id'}, {id: 'mock_id2'}]};
    this.valid_result = [{id: 'mock_id'}, {id: 'mock_id2'}];

    cb();
  },

  confirmLBListenersOnSuccess: function(test)
  {
    //stub out a completely valid request
    const self = this;
    const mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.listLBListeners(function(error, result){
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    const mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.listLBListeners(function(error, rules_array){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};


exports.getLBListener = {
  setUp: function(cb){
    this.valid_response_body = {listener: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmLBListenerOnSuccess: function(test)
  {
    //stub out a completely valid request
    const self = this;
    const mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.getLBListener('mock_id', function(error, result){
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    const mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.getLBListener('mock_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};


exports.createLBListener = {
  setUp: function(cb){
    this.valid_response_body = {listener: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmValidResultOnSuccess: function(test)
  {
    //stub out a completely valid request
    const self = this;
    const mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.createLBListener('tenant_id', 'loadbalancer_id', 'description', 'protocol', {protocol_port: 'mock_protocol_port'}, function(error, result){
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  //stub out a request with a valid status but an invalid json response body
  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    const mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.createLBListener('tenant_id', 'loadbalancer_id', 'description', 'protocol', {protocol_port: 'mock_protocol_port'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.updateLBListener = {
  setUp: function(cb){
    this.valid_response_body = {listener: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmValidResultOnSuccess: function(test)
  {
    //stub out a request obj with a completely valid response
    const self = this;
    const mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.updateLBListener('mock_id', {description: 'Updated Listener'}, function(error, result){
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    const mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.updateLBListener('mock_id', {description: 'Updated Listener'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.removeLBListener = {
  setUp: function(cb){
    cb();
  },

  confirmNoErrorOnSuccess: function(test)
  {
    //stub out a completely valid response
    const mock_request = getMockRequest(null, 200, '');
    neutron.setRequest(mock_request);

    neutron.removeLBListener('mock_id', function(error){
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    const mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.removeLBListener('mock_id', function(error){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.listLBPools = {
  setUp: function(cb){
    this.valid_response_body = {pools: [{id: 'mock_id'}, {id: 'mock_id2'}]};
    this.valid_result = [{id: 'mock_id'}, {id: 'mock_id2'}];

    cb();
  },

  confirmLBPoolsOnSuccess: function(test)
  {
    //stub out a completely valid request
    const self = this;
    const mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.listLBPools(function(error, result){
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    const mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.listLBPools(function(error, rules_array){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.getLBPool = {
  setUp: function(cb){
    this.valid_response_body = {pool: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmPoolOnSuccess: function(test)
  {
    //stub out a completely valid request
    const self = this;
    const mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.getLBPool('mock_id', function(error, result){
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    const mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.getLBPool('mock_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.createLBPool = {
  setUp: function(cb){
    this.valid_response_body = {pool: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmValidResultOnSuccess: function(test)
  {
    //stub out a completely valid request
    const self = this;
    const mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.createLBPool('tenant_id', 'protocol', 'lb_algorithm', 'listener_id', {'admin_state_up': 'mock_admin_state_up'}, function(error, result){
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    const mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.createLBPool('tenant_id', 'protocol', 'lb_algorithm', 'listener_id', {'admin_state_up': 'mock_admin_state_up'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.updateLBPool = {
  setUp: function(cb){
    this.valid_response_body = {pool: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmValidResultOnSuccess: function(test)
  {
    //stub out a request obj with a completely valid response
    const self = this;
    const mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.updateLBPool('mock_id', {description: 'Updated LBPool'}, function(error, result){
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    const mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.updateLBPool('mock_id', {description: 'Updated LBPool'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.removeLBPool = {
  setUp: function(cb){
    cb();
  },

  confirmNoErrorOnSuccess: function(test)
  {
    //stub out a completely valid response
    const mock_request = getMockRequest(null, 200, '');
    neutron.setRequest(mock_request);

    neutron.removeLBPool('mock_id', function(error){
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    const mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.removeLBPool('mock_id', function(error){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.listLBPoolMembers = {
  setUp: function(cb){
    this.valid_response_body = {members: [{id: 'mock_id'}, {id: 'mock_id2'}]};
    this.valid_result = [{id: 'mock_id'}, {id: 'mock_id2'}];

    cb();
  },

  confirmMembersOnSuccess: function(test)
  {
    //stub out a completely valid request
    const self = this;
    const mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.listLBPoolMembers('pool_id', function(error, result){
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    const mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.listLBPoolMembers('pool_id', function(error, rules_array){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.getLBPoolMember = {
  setUp: function(cb){
    this.valid_response_body = {member: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmMemberOnSuccess: function(test)
  {
    //stub out a completely valid request
    const self = this;
    const mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.getLBPoolMember('pool_id', 'member_id', function(error, result){
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    const mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.getLBPoolMember('pool_id', 'member_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};


exports.createLBPoolMember= {
  setUp: function(cb){
    this.valid_response_body = {member: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmValidResultOnSuccess: function(test)
  {
    //stub out a completely valid request
    const self = this;
    const mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.createLBPoolMember('pool_id', 'tenant_id', 'address', 'protocol_port', {'admin_state_up': 'mock_admin_state_up'}, function(error, result){
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    const mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.createLBPoolMember('pool_id', 'tenant_id', 'address', 'protocol_port', {'admin_state_up': 'mock_admin_state_up'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.updateLBPoolMember = {
  setUp: function(cb){
    this.valid_response_body = {member: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmValidResultOnSuccess: function(test)
  {
    //stub out a request obj with a completely valid response
    const self = this;
    const mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.updateLBPoolMember('pool_id', 'member_id', {description: 'Updated LBPool'}, function(error, result){
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    const mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.updateLBPoolMember('pool_id', 'member_id', {description: 'Updated LBPool'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.removeLBPoolMember = {
  setUp: function(cb){
    cb();
  },

  confirmNoErrorOnSuccess: function(test)
  {
    //stub out a completely valid response
    const mock_request = getMockRequest(null, 200, '');
    neutron.setRequest(mock_request);

    neutron.removeLBPoolMember('pool_id', 'member_id', function(error){
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    const mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.removeLBPoolMember('pool_id', 'member_id', function(error){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.listLBHealthMonitors = {
  setUp: function(cb){
    this.valid_response_body = {healthmonitors: [{id: 'mock_id'}, {id: 'mock_id2'}]
    };
    this.valid_result = [{id: 'mock_id'}, {id: 'mock_id2'}];

    cb();
  },

  confirmMembersOnSuccess: function(test)
  {
    //stub out a completely valid request
    const self = this;
    const mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.listLBHealthMonitors(function(error, result){
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    const mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.listLBHealthMonitors(function(error, rules_array){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.getLBHealthMonitor = {
  setUp: function(cb){
    this.valid_response_body = {healthmonitor: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmValidResultOnSuccess: function(test)
  {
    //stub out a completely valid request
    const self = this;
    const mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.getLBHealthMonitor('health_monitor_id', function(error, result){
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    const mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.getLBHealthMonitor('health_monitor_id', function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.createLBHealthMonitor= {
  setUp: function(cb){
    this.valid_response_body = {healthmonitor: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmValidResultOnSuccess: function(test)
  {
    //stub out a completely valid request
    const self = this;
    const mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.createLBHealthMonitor('tenant_id', 'type', 'delay', 'timeout', 'max_retries', 'pool_id', {'http_method': 'mock_http_method'}, function(error, result){
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    const mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.createLBHealthMonitor('tenant_id', 'type', 'delay', 'timeout', 'max_retries', 'pool_id', {'http_method': 'mock_http_method'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.updateLBHealthMonitor = {
  setUp: function(cb){
    this.valid_response_body = {healthmonitor: {id: 'mock_id'}};
    this.valid_result = {id: 'mock_id'};

    cb();
  },

  confirmValidResultOnSuccess: function(test)
  {
    //stub out a request obj with a completely valid response
    const self = this;
    const mock_request = getMockRequest(null, 200, this.valid_response_body);
    neutron.setRequest(mock_request);

    neutron.updateLBHealthMonitor('health_monitor_id', {delay: 'mock_delay'}, function(error, result){
      test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    const mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.updateLBHealthMonitor('health_monitor_id', {delay: 'mock_delay'}, function(error, result){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};



exports.removeLBHealthMonitor = {
  setUp: function(cb){
    cb();
  },

  confirmNoErrorOnSuccess: function(test)
  {
    //stub out a completely valid response
    const mock_request = getMockRequest(null, 200, '');
    neutron.setRequest(mock_request);

    neutron.removeLBHealthMonitor('health_monitor_id', function(error){
      test.done();
    });
  },

  confirmErrorOnError: function(test)
  {
    //stub out some junk with an error
    const mock_request = getMockRequest(new Error('meh'), 500, {});
    neutron.setRequest(mock_request);

    neutron.removeLBHealthMonitor('health_monitor_id', function(error){
      test.ok(error, 'We should receive an error object');
      test.done();
    });
  }
};
*/