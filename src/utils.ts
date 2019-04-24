export const default_timeout = 9000;

export interface IUnknowObject {
	[key: string]: unknown;
}

export function assign<T>(dest: T, optional_keys: string[], src: IUnknowObject) {
	// now loop through all the optional ones
	for (let n = 0; n < optional_keys.length; n++) {
		const key = optional_keys[n];
		if (typeof src[key] !== 'undefined') {
			(dest as IUnknowObject)[key] = src[key];
		}
	}
	return dest;
}
