
/**
 * Add an artificial delay to the execution of a promise.
 * 
 * @param {Function} doPromise
 *   A function which performs and returns the promise to be retried.
 * @param {Number} delayMs
 *   Number of milliseconds to delay execution of the promise by.
 * @return {Promise}
 *   A promise that is resolved with the values of the original promise, but
 *   only executed after the initial delay has elapsed.
 */
export function delay(doPromise, delayMs) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			doPromise()
				.then(resolve)
				.catch(reject);
		}, delayMs);
	});
}

/**
 * Causes promise resolution and rejection to take *at least* as long as the
 * time specified.
 * 
 * @param {Promise} promise
 *   The Promise to pad out.
 * @param {Number} padMs
 *   Number of milliseconds to have `promise` padded out to, if it resolves or
 *   rejects too quickly.
 * @return {Promise} A new promise that will be resolved or rejected after the
 *   padding time has elapsed.
 */
export function pad(promise, padMs) {
	let start = Date.now();
	return Promise.all([
		promise,
		new Promise(resolve => setTimeout(resolve, padMs))
	])
		.then(([result]) => result)
		.catch(error => {
			let now = Date.now();
			let elapsed = now - start;
			if (elapsed > padMs) {
				throw error;
			}
			return new Promise((resolve, reject) => {
				setTimeout(() => reject(error), padMs - elapsed);
			});
		});
}

/**
 * Retry a promise a specified number of times.
 * 
 * @param {Function} doPromise
 *   A function which performs and returns the promise to be retried.
 * @param {Number} numRetries
 *   The number of times a retry should be attempted.
 * @param {Function} shouldRetry
 *   When the promise succeeds, this function is called with the result to
 *   determine whether or not the promise should be retried.
 * @return {Promise}
 *   If the promise succeeds and we don't have to retry, then the promise will
 *   be resolved with the result.  If the promise itself returns an error or the
 *   number of retries has been exceeded, it will be rejected.
 */
export function retry(doPromise, numRetries, shouldRetry) {
	let retries = 0;
	return new Promise((resolve, reject) => {
		function makeAttempt() {
			return doPromise()
				.then(response => {
					if (shouldRetry(response)) {
						if (retries < numRetries) {
							retries++;
							return makeAttempt();
						}
						else {
							reject(new Error('Maximum number of retries reached'));
						}
					}
					else {
						resolve(response);
					}
				})
				.catch(reject);
		}
		makeAttempt();
	});
}
