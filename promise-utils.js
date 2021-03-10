
/**
 * Add an artificial delay to the execution of a promise.
 * 
 * @param {Function} doPromise
 *   A function which returns the promise to be delayed.
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
 * @param {Function} doPromise
 *   A function which returns the promise to be padded.
 * @param {Number} padMs
 *   Number of milliseconds to have `promise` padded out to, if it resolves or
 *   rejects too quickly.
 * @return {Promise} A new promise that will be resolved or rejected after the
 *   padding time has elapsed.
 */
export function pad(doPromise, padMs) {
	let start = Date.now();
	return Promise.all([
		doPromise(),
		new Promise(resolve => setTimeout(resolve, padMs))
	])
		.then(results => results[0])
		.catch(error => {
			let now = Date.now();
			let elapsed = now - start;
			if (elapsed > padMs) {
				throw error;
			}
			return new Promise((resolve, reject) => setTimeout(() => reject(error), padMs - elapsed));
		});
}

/**
 * Retry a promise a specified number of times.
 * 
 * @param {Function} doPromise
 *   A function which returns the promise to be retried.
 * @param {Number} numRetries
 *   The number of times the promise should be retried.
 * @param {Function} shouldRetry
 *   A function called with 2 parameters, the result from a promise resolution
 *   and the error from a promise rejection (only 1 will be set each call,
 *   depending on whether the promise was resolved/rejected), that should
 *   determine whether or not the promise should be retried. eg:
 *   ```javascript
 *   // Retry if a resolved promise result is still in a `waiting` state 
 *   function shouldRetry(result, error) {
 *     return result && result.waiting;
 *   }
 *   // Retry a rejected promise
 *   function shouldRetry(result, error) {
 *     return !!error;
 *   }
 *   ```
 * @return {Promise}
 *   A promise that will eventually resolve to the value from the retried
 *   promise, is rejected with the error from the retried promise, or is
 *   rejected with an error message with "Maximum number of retries reached".
 */
export function retry(doPromise, numRetries, shouldRetry) {
	let retries = 0;
	return new Promise((resolve, reject) => {
		function retryIfNeeded(response, error) {
			if (shouldRetry(response, error)) {
				if (retries < numRetries) {
					retries++;
					return makeAttempt();
				}
				else {
					reject(new Error('Maximum number of retries reached'));
				}
			}
			else if (response) {
				resolve(response);
			}
			else {
				reject(error);
			}
		}
		function makeAttempt() {
			return doPromise()
				.then(
					response => {
						return retryIfNeeded(response, undefined);
					},
					error => {
						return retryIfNeeded(undefined, error);
					}
				);
		}
		makeAttempt();
	});
}
