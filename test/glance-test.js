const Glance = require('../dist/glance.js').default;
const glance = new Glance('http://mock_glance_url', 'mock_token');


//returns a mock request object for dependency injection with get/post/patch/del methods calling back with the given 3 values
function getMockRequest(return_error, return_status_code, return_response) {
	function mockVerb(options_array, callback) {
		// callback(return_error, { statusCode: return_status_code }, return_response);
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
		const result = glance.getRequestOptions('/mock_path', { meh: 'meh' }, 'a', 'b', { extra_header: 'extra_header_value' });
		const expected_result = {
			uri: 'http://mock_glance_url/mock_path',
			headers: { 'X-Auth-Token': 'mock_token', extra_header: 'extra_header_value' },
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



exports.listImages = {
	setUp: function (cb) {
		this.valid_response_body = { images: [{ id: 'mock_id' }, { id: 'mock_id2' }] };
		this.valid_result = [{ id: 'mock_id' }, { id: 'mock_id2' }];
		cb();
	},

	async confirmImagesOnSuccess(test) {
		//stub out request with a completely valid response
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		glance.setRequest(mock_request);


		const result = await glance.listImages();
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out request for an invalid status but an otherwise valid body (to ensure error on invalid status)
		const mock_request = getMockRequest(new Error('meh'), 500, this.valid_response_body);
		glance.setRequest(mock_request);

		try {
			await glance.listImages();
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



exports.getImage = {
	setUp: function (cb) {
		this.valid_response_body = { id: 'mock_id' };
		this.valid_result = { id: 'mock_id' };

		cb();
	},

	async confirmImageOnSuccess(test) {
		//stub out the request for a completely valid response
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		glance.setRequest(mock_request);

		const result = await glance.getImage('mock_id');
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out request for an invalid status with valid json body (to test the status triggers an error)
		const mock_request = getMockRequest(new Error('meh'), 500, this.valid_response_body);
		glance.setRequest(mock_request);

		try {
			await glance.getImage('mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error');
			test.done();

		}
	}
};



exports.queueImage = {
	setUp: function (cb) {
		this.valid_response_body = { id: 'mock_id' };
		this.valid_result = { id: 'mock_id' };

		cb();
	},

	async confirmImageOnSuccess(test) {
		//stub out the request for a completely valid response
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		glance.setRequest(mock_request);

		const result = await glance.queueImage({});

		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},


	async confirmErrorOnError(test) {
		//stub out request for an invalid status with valid json body (to test the status triggers an error)
		const mock_request = getMockRequest(new Error('meh'), 500, this.valid_response_body);
		glance.setRequest(mock_request);

		try {
			await glance.queueImage({});
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};



//skipping uploadImage - not sure this is unit-testable in the normal fashion



exports.updateImage = {
	setUp: function (cb) {
		this.valid_response_body = { id: 'mock_id' };
		this.valid_result = { id: 'mock_id' };

		cb();
	},

	async confirmImageOnSuccess(test) {
		//stub out request with a completely valid response
		const mock_request = getMockRequest(null, 200, this.valid_response_body);
		glance.setRequest(mock_request);

		const result = await glance.updateImage('mock_id', {});
		test.deepEqual(result, this.valid_result, 'result should be ' + JSON.stringify(this.valid_result));
		test.done();
	},


	async confirmErrorOnError(test) {
		//stub out request for a 500 with valid json in the body (to ensure the status triggers an error)
		const mock_request = getMockRequest(new Error('meh'), 500, 'Our server just borked');
		glance.setRequest(mock_request);

		try {
			await glance.updateImage('mock_id', {});
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};

exports.removeImage = {
	async confirmNoErrorOnSuccess(test) {
		//stub out request with a completely valid response
		const mock_request = getMockRequest(null, 200, {});
		glance.setRequest(mock_request);

		await glance.removeImage('mock_id');
		test.done();
	},

	async confirmErrorOnError(test) {
		//stub out request for a 500 with valid json in the body (to ensure the status triggers an error)
		const mock_request = getMockRequest(new Error('meh'), 500, 'Our server just borked');
		glance.setRequest(mock_request);

		try {
			await glance.removeImage('mock_id');
		} catch (error) {
			test.ok(error, 'We should receive an error object');
			test.done();
		}
	}
};
