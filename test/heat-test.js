const Heat = require('../dist/heat.js').default;
const heat = new Heat('http://mock_heat_url', 'mock_token');



//returns a mock request object for dependency injection with get/post/patch/del methods calling back with the given 3 values
function getMockRequest(return_error, return_status_code, return_response) {
	function mockVerb(options_array, callback) {
		if (return_error) {
			throw return_error;
		} else {
			return return_response;
		}
	}

	const return_object = {
		get: mockVerb,
		post: mockVerb,
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

	confirmResult: function (test) {
		const result = heat.getRequestOptions('/mock_path', { meh: 'meh' }, 'a', 'b');
		const expected_result = {
			uri: 'http://mock_heat_url/mock_path',
			headers: { 'X-Auth-Token': 'mock_token' },
			json: { meh: 'meh' },
			timeout: 9000,
			metricPath: 'a',
			metricRequestID: '',
			metricUserName: '',
			metricLogger: null,
			validateStatus: true
		};

		test.deepEqual(result, expected_result, 'result should be ' + JSON.stringify(expected_result));
		test.done();
	}
};



exports.listStacks = {
	setUp: function (cb) {
		this.valid_response_body = { stacks: [{ id: 1 }, { id: 2 }] };
		this.valid_result = [{ id: 1 }, { id: 2 }];

		cb();
	},

	async confirmValidResultOnSuccess(test) {
		//stub out a request obj with a completely valid response
		const self = this;
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		heat.setRequest(mock_request);

		const result = await heat.listStacks({});
		test.deepEqual(result, self.valid_result, 'result should be ' + JSON.stringify(self.valid_result));
		test.done();
	},


	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		heat.setRequest(mock_request);

		try {
			await heat.listStacks({});
		} catch (error) {
			test.ok(error, 'We should receive an error object or string');
			test.done();
		}
	}
};



exports.createStack = {
	setUp: function (cb) {
		this.valid_response_body = { stack: { id: 'mock_id' } };
		this.valid_result = { id: 'mock_id' };

		cb();
	},

	async confirmValidResultOnSuccess(test) {
		//stub out a request obj with a completely valid response
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		heat.setRequest(mock_request);

		const options = {
			template_url: "http://mock_template_url"
		};
		const result = await heat.createStack('mock_stack_name', options);
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		heat.setRequest(mock_request);

		const options = {
			template_url: "http://mock_template_url"
		};
		try {
			await heat.createStack('mock_stack_name', options);
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.updateStack = {
	setUp: function (cb) {
		this.valid_result = {};
		cb();
	},

	async confirmValidResultOnSuccess(test) {
		//stub out a request obj with a completely valid response
		const mock_request = getMockRequest(null, 200, {});
		heat.setRequest(mock_request);

		const options = {
			template_url: "http://mock_template_url"
		};
		const result = await heat.updateStack('mock_stack_name', 'mock_stack_id', options);
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		heat.setRequest(mock_request);

		const options = {
			template_url: "http://mock_template_url"
		};
		try {
			await heat.updateStack('mock_stack_name', 'mock_stack_id', options);
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.deleteStack = {
	setUp: function (cb) {
		this.valid_result = {};
		cb();
	},

	async confirmValidResultOnSuccess(test) {
		//stub out a request obj with a completely valid response
		const mock_request = getMockRequest(null, 200, {});
		heat.setRequest(mock_request);

		const result = await heat.deleteStack('mock_stack_name', 'mock_stack_id');
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out some junk with an error
		const mock_request = getMockRequest(new Error('meh'), 500, {});
		heat.setRequest(mock_request);

		try {
			await heat.deleteStack('mock_stack_name', 'mock_stack_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};
