
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
 * Retry a promise based on the result of the `shouldRetry` function.
 * 
 * @param {Function} doPromise
 *   A function which returns the promise to be retried.
 * @param {Function} shouldRetry
 *   A function called with the result from a promise resolution (if we are here
 *   because the promise was resolved), the error from a promise rejection (if
 *   we are here because the promise was rejected), and the number of attempts
 *   made thus far.  These can be used to determine if the promise should be
 *   retried, and the function can return either a boolean to indicate a retry
 *   should be made immediately (`true`), or abandoned (`false`), or a number
 *   value to specify a delay in milliseconds of how long until that retry
 *   should be attempted (a -1 can also be used to abandon a retry).  eg:
 *   
 *   ```javascript
 *   // Retry immediately if a resolved promise result is still in a waiting state
 *   function shouldRetry(result) {
 *     return result && result.waiting ? 0 : -1;
 *   }
 *   
 *   // Retry immediately on a rejected promise
 *   function shouldRetry(result, error) {
 *     return !!error;
 *   }
 *   
 *   // Retry on error up to 2 times (3 attempts total)
 *   function shouldRetry(result, error, attempts) {
 *     return !!error && attempts < 3;
 *   }
 *   
 *   // Retry on error up to 2 times (3 attempts total) with an increasing delay between attempts
 *   function shouldRetry(result, error, attempts) {
 *     return !!error && attempts < 3 ? attempts * 250 : -1;
 *   }
 *   ```
 * @return {Promise}
 *   A promise that will eventually resolve to the value or reject with the
 *   error from the retried promise.
 */
export function retry(doPromise, shouldRetry) {
	let attempts = 0;
	return new Promise((resolve, reject) => {

		/* 
		 * Given the result of `doPromise`, figure out whether another attempt
		 * should be made or if we return what we've got.
		 */
		function retryIfNeeded(response, error) {

			// Retry?
			try {
				let shouldRetryResult = shouldRetry(response, error, attempts);
				if (shouldRetryResult === true) {
					return makeAttempt();
				}
				if (typeof shouldRetryResult === 'number' && shouldRetryResult >= 0) {
					return new Promise((resolve1, reject1) => {
						setTimeout(() => {
							makeAttempt().then(resolve1, reject1);
						}, shouldRetryResult);
					});
				}
			}
			catch (exception) {
				reject(exception);
			}

			// Return
			if (response) {
				resolve(response);
			}
			else {
				reject(error);
			}
		}

		/* 
		 * Execute `doPromise`, incrementing the attempt counter and then using
		 * `retryIfNeeded` to determine what to do with the result.
		 */
		function makeAttempt() {
			attempts++;
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
