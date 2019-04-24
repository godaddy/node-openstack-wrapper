import http from 'http';
import https from 'https';
import { Readable } from 'stream';
import { parse } from 'url';
import { IMetricLogger } from './os-request';
import * as Request from './os-request';
import { default_timeout } from './utils';

interface IImage {
	// todo
	todo: unknown;
}

export default class Glance {
	private url: string;
	private token: string;
	private timeout = default_timeout;
	private request_id = '';
	private user_name = '';
	private logger = null as unknown as IMetricLogger;
	private request = Request;
	constructor(endpoint_url: string, auth_token: string) {
		// endpoint_url should come from the keystone projectInfo call - also yank all the trailing slashes in case folks get clever
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



	// makes a callback cb(error, images_array) with a list of all of the available images for a given project/user
	// NOTE: harding pagination for now - change at will (just be aware it will break backwards compat so update version accordingly)
	public async listImages() {
		const request_options = this.getRequestOptions('/images?member_status=all&limit=200', true, 'remote-calls.glance.images.list', 'images');

		const body = await this.request.get<{
			images: IImage[];
		}>(request_options);
		return body.images;
	}

	// gets info on a specific image given the id
	// takes an image id ex: '8ab808ed-d2aa-471c-9af0-0d3287061670'
	// and callback with 2 params (error, image_info_object)
	public getImage(id: string) {
		const request_options = this.getRequestOptions('/images/' + escape(id), true, 'remote-calls.glance.images.get', 'id');

		// todo
		return this.request.get<{/* todo */ }>(request_options);
	}

	// This might create a temporary id/placeholder for us to upload new images into
	// ...or it may bring the end of times through dark titual.... probably 50/50
	// callback takes 2 params (error, data) where data seems to include the id of the result of queuing...er posting... er whatever
	public queueImage(data: {
		name?: string;
		visibility?: boolean;
		tags?: unknown[];
		disk_format?: string;
		container_format?: string;
	}) {
		const request_options = this.getRequestOptions('/images', data, 'remote-calls.glance.images.queue', 'id');

		// todo
		return this.request.post<{/* todo */ }>(request_options);
	}



	// uploads a new image to openstack
	// takes the new image id(from the queue call above?)
	// a stream object... don't really get that one (download result?)
	// and a callback w/2 params (error, response) I think response here is the result of the upload call
	public uploadImage(id: string, stream: Readable) {
		return new Promise<string | Buffer>((resolve, reject) => {
			const url = this.url + '/images/' + escape(id) + '/file';
			const opt = parse(url); // sadly I didn't get this working with the request object.... yet!
			const h = (() => {
				if (opt.protocol === 'https:') {
					return https;
				} else {
					return http;
				}
			})();

			const upload = h.request({
				...opt,
				headers: {
					Connection: 'close',
					'Content-Type': 'application/octet-stream',
					'X-Auth-Token': this.token
				},
				method: 'PUT'
			}, (res) => {
				let response = '';

				res.on('data', (chunk) => {
					response += chunk;
				});

				res.on('end', () => {
					resolve(response);
				});
			});

			upload.on('error', (e) => {
				reject(e);
			});

			stream.pipe(upload);
		});
	}

	// calls back with (error, image) after updating the data on an image
	// data should be an object with only the deltas to be tweaked - the following are supposed
	/*
	  data.name
	  data.visibility
	  data.protected
	  data.tags
	*/
	public updateImage(id: string, data: {
		name?: string;
		visibility?: boolean;	// ?? todo string
		protected?: boolean;
		tags: unknown[];	// todo:
	}) {
		const patch_data = [];

		if (data.name) {
			patch_data.push({ op: 'replace', path: '/name', value: data.name });
		}
		if (data.visibility) {
			patch_data.push({ op: 'replace', path: '/visibility', value: data.visibility });
		}
		// data.protected is a boolean so the normal if(thing) mechanism won't work - hence typeof
		if (typeof data.protected !== 'undefined') {
			patch_data.push({ op: 'replace', path: '/protected', value: !!data.protected });
		}
		if (data.tags) {
			patch_data.push({ op: 'replace', path: '/tags', value: data.tags });
		}

		// we have an additional header here due to the patch command
		const request_options = this.getRequestOptions('/images/' + escape(id), patch_data, 'remote-calls.glance.images.update', 'id', {
			'Content-Type': 'application/openstack-images-v2.1-json-patch'
		});

		return this.request.patch(request_options);
	}



	// calls back with (error) after attempting to remove an openstack image
	public removeImage(id: string) {
		const request_options = this.getRequestOptions('/images/' + escape(id), true, 'remote-calls.glance.images.remove', '');

		return this.request.del(request_options);
	}

	// returns an formatted options object - just makes the code below a little less repetitious
	// path should begin with a "/"
	// json_value should be almost certainly be true if you don't have an actual object you want to send over
	private getRequestOptions(path: string, json_value: unknown, metricPath: string, requireBodyObject: string, extra_headers?: { [key: string]: string; }) {
		const options = {
			headers: { 'X-Auth-Token': this.token } as { [key: string]: string; },
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

		// add the extra header info if it exists
		if (typeof extra_headers !== 'undefined') {
			for (const key in extra_headers) {
				if (extra_headers.hasOwnProperty(key)) {
					options.headers[key] = extra_headers[key];
				}
			}
		}

		return options;
	}
}
