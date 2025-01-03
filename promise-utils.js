/*
 * Copyright 2019, Emanuel Rabina (http://www.ultraq.net.nz/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * A function which returns a promise.
 *
 * @template T
 * @callback PromiseCallback
 * @return {Promise<T>}
 */

/**
 * Add an artificial delay to the execution of a promise.
 *
 * @template T
 * @param {PromiseCallback<T>} doPromise
 *   A function which returns the promise to be delayed.
 * @param {number} delayMs
 *   Number of milliseconds to delay execution of the promise by.
 * @return {Promise<T>}
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
 * @template T
 * @param {PromiseCallback<T>} doPromise
 *   A function which returns the promise to be padded.
 * @param {number} padMs
 *   Number of milliseconds to have `promise` padded out to, if it resolves or
 *   rejects too quickly.
 * @return {Promise<T>}
 *   A new promise that will be resolved or rejected after the padding time has
 *   elapsed.
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
 * A function called with the retry context to determine if another retry
 * attempt should be made.
 *
 * @template T
 * @callback RetryCallback
 * @param {T | undefined} response
 * @param {Error | undefined} error
 * @param {number} attempts
 * @return {boolean | number}
 */

/**
 * Retry a promise based on the result of the `shouldRetry` function.
 *
 * @template T
 * @param {PromiseCallback<T>} doPromise
 *   A function which returns the promise to be retried.
 * @param {RetryCallback<T>} shouldRetry
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
 * @return {Promise<T>}
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

/**
 * Returns a `Promise` that is resolved only after the given wait period.
 *
 * @param {number} waitMs
 *   Number of milliseconds to wait before the promise is resolved.
 * @return {Promise<void>}
 */
export function wait(waitMs) {
	return new Promise(resolve => {
		setTimeout(resolve, waitMs);
	});
}
