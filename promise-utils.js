
/**
 * Causes promise resolution to take *at least* as long as the time specified by
 * creating a promise chain with the `padMs` value that isn't resolved until
 * both the padding promise and the original promise are resolved.
 * 
 * @param {Promise} promise
 * @param {Number} padMs
 * @return {Promise} A new promise that combines the original and a padding
 *   value to slow resolution from happening.
 */
export function pad(promise, padMs) {
	return Promise.all([
		promise,
		new Promise(resolve => setTimeout(resolve, padMs))
	])
		.then(([result]) => result);
}
