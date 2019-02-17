/* eslint-env jest */
import {pad} from './promise-utils.js';

/**
 * Tests for the Promises utility module.
 */
describe('promise-utils', function() {

	/**
	 * Returns a promise whose status can be queried.  Taken from:
	 * https://stackoverflow.com/questions/21485545/is-there-a-way-to-tell-if-an-es6-promise-is-fulfilled-rejected-resolved
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

	describe('#pad', function() {

		beforeAll(function() {
			jest.useFakeTimers();
		});
		afterAll(function() {
			jest.useRealTimers();
		});

		test("Promises faster than the delay don't resolve until after the delay", async function() {
			let padMs = 1000;
			let quickPromise = Promise.resolve('Now!');
			let delayedPromise = queryablePromise(pad(quickPromise, padMs));

			expect(delayedPromise.isFulfilled()).toBe(false);
			jest.runAllTimers();
			await delayedPromise;
			expect(delayedPromise.isResolved()).toBe(true);
		});

		// TODO: Not really sure how to test this, can't await on the promise to an
		//       in-between state or anything like that :/
		test.skip('Promises slower than the delay resolve when they resolve', function() {
			// let padMs = 100;
			// let quickPromise = new Promise(resolve => {
			// 	setTimeout(resolve, 1000);
			// });
			// let delayedPromise = queryablePromise(pad(quickPromise, padMs));

			// ...???
		});
	});
});
