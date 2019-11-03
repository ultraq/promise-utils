/* eslint-env jest */
import {delay, pad, retry} from './promise-utils.js';

/**
 * Tests for the Promises utility module.
 */
describe('promise-utils', function() {

	/**
	 * Wrap a promise with another promise whose status can be queried.  Taken
	 * from: https://stackoverflow.com/questions/21485545/is-there-a-way-to-tell-if-an-es6-promise-is-fulfilled-rejected-resolved
	 * 
	 * @param {Promise} promise
	 * @return {Promise} A new promise with methods `isFulfilled`, `isResolved`,
	 *   and `isRejected`.
	 */
	function queryablePromise(promise) {
		if (promise.isResolved) {
			return promise;
		}
		let isResolved = false;
		let isRejected = false;
		let result = promise.then(
			value => {
				isResolved = true;
				return value;
			},
			error => {
				isRejected = true;
				throw error;
			}
		);
		result.isFulfilled = () => isResolved || isRejected;
		result.isResolved = () => isResolved;
		result.isRejected = () => isRejected;
		return result;
	}

	describe('#delay', function() {

		beforeAll(function() {
			jest.useFakeTimers();
		});
		afterAll(function() {
			jest.useRealTimers();
		});

		test("Promise functions aren't executed until the delay is reached", async function() {
			let quickPromise = Promise.resolve('Now!');
			let doPromise = jest.fn(() => quickPromise);
			let delayedPromise = queryablePromise(delay(doPromise, 1000));

			expect(doPromise).not.toHaveBeenCalled();
			expect(delayedPromise.isFulfilled()).toBe(false);
			jest.runAllTimers();
			expect(doPromise).toHaveBeenCalled();
			await delayedPromise;
			expect(delayedPromise.isFulfilled()).toBe(true);
		});

		test('Returns the result of the underlying promise', async function() {
			const successResponse = 'Hi!';
			let delayedPromise = delay(() => Promise.resolve(successResponse), 1000);
			jest.runAllTimers();
			let result = await delayedPromise;
			expect(result).toBe(successResponse);
		});

		test('Returns any underlying rejections', async function() {
			const errorResponse = new Error('Bye!');
			let delayedPromise = delay(() => Promise.reject(errorResponse), 1000);
			jest.runAllTimers();
			expect.assertions(1);
			try {
				await delayedPromise;
			}
			catch (ex) {
				expect(ex).toBe(errorResponse);
			}
		});
	});

	describe('#pad', function() {

		beforeAll(function() {
			jest.useFakeTimers();
		});
		afterAll(function() {
			jest.useRealTimers();
		});

		test("Promises faster than the delay don't resolve until after the delay", async function() {
			const quickPromise = Promise.resolve('Now!');
			let paddedPromise = queryablePromise(pad(quickPromise, 1000));

			expect(paddedPromise.isResolved()).toBe(false);
			jest.runAllTimers();
			await paddedPromise;
			expect(paddedPromise.isResolved()).toBe(true);
		});

		test('Promises slower than the delay resolve when they resolve', async function() {
			const padMs = 1000;
			const slowPromise = new Promise(resolve => {
				setTimeout(() => {
					resolve('Hi!');
				}, 2000);
			});
			let paddedPromise = queryablePromise(pad(slowPromise, padMs));

			jest.advanceTimersByTime(padMs);
			expect(paddedPromise.isResolved()).toBe(false);
			jest.advanceTimersByTime(1000); // Another 1000ms should reach the timeout of the slow promise
			await paddedPromise;
			expect(paddedPromise.isResolved()).toBe(true);
		});
	});

	describe('#retry', function() {

		test('Returns the result of the underlying promise', async function() {
			const underlyingResult = {
				message: 'Hi!'
			};
			let result = await retry(() => Promise.resolve(underlyingResult), 1, () => false);
			expect(result).toBe(underlyingResult);
		});

		test('Returns any underlying rejections', async function() {
			const underlyingRejection = new Error('Test error');
			expect.assertions(1);
			try {
				await retry(() => Promise.reject(underlyingRejection), 1, () => false);
			}
			catch (exception) {
				expect(exception).toBe(underlyingRejection);
			}
		});

		test('Retries the promise action if the shouldRetry method tells it to', async function() {
			const doPromise = jest.fn(() => Promise.resolve({}));
			const shouldRetry = jest.fn()
				.mockReturnValueOnce(true)   // Causes 1 retry
				.mockReturnValueOnce(false); // Don't retry again
			await retry(doPromise, 3, shouldRetry);
			expect(doPromise).toHaveBeenCalledTimes(2);
		});

		test('Rejects the promise when the number of retries has been reached', async function() {
			const doPromise = jest.fn(() => Promise.resolve({}));
			const shouldRetry = jest.fn(() => true); // Always cause a retry

			expect.assertions(2);
			try {
				await retry(doPromise, 3, shouldRetry);
			}
			catch (exception) {
				expect(doPromise).toHaveBeenCalledTimes(4);
				expect(exception.message).toBe('Maximum number of retries reached');
			}
		});
	});
});