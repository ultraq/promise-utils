
promise-utils
=============

[![Build Status](https://travis-ci.com/ultraq/promise-utils.svg?branch=main)](https://travis-ci.com/ultraq/promise-utils)
[![Coverage Status](https://coveralls.io/repos/github/ultraq/promise-utils/badge.svg?branch=main)](https://coveralls.io/github/ultraq/promise-utils?branch=main)
[![npm](https://img.shields.io/npm/v/@ultraq/promise-utils.svg?maxAge=3600)](https://www.npmjs.com/package/@ultraq/promise-utils)
[![Bundlephobia minified size](https://img.shields.io/bundlephobia/min/@ultraq/promise-utils)](https://bundlephobia.com/result?p=@ultraq/promise-utils)

A collection of utilities for JavaScript promises.


Installation
------------

Via npm:

```
npm install @ultraq/promise-utils
```

If targeting browsers that don't natively support `Promise`, a polyfill is
required.


API
---

### delay(doPromise, delayMs)

Add an artificial delay to the execution of a promise.  Returns a promise that
is resolved/rejected with the values of the underlying promise, executed after
the initial delay has elapsed.

 - **doPromise**: A function which returns the promise to be delayed.
 - **delayMs**: Number of milliseconds to delay execution of the promise by.

### pad(doPromise, padMs)

Causes promise resolution and rejection to take *at least* as long as the time
specified.  Returns a new promise that will be resolved or rejected after the
padding time has elapsed.

 - **doPromise**: A function which returns the promise to be padded.
 - **padMs**: Number of milliseconds to have `promise` padded out to, if it
   resolves or rejects too quickly.

### retry(doPromise, numRetries, shouldRetry)

Retry a promise a specified number of times.  A promise that will eventually
resolve to the value from the retried promise, is rejected with the error from
the retried promise, or is rejected with an error message with "Maximum number
of retries reached".

 - **doPromise**: A function which returns the promise to be retried.
 - **numRetries**: The number of times the promise should be retried.
 - **shouldRetry**: A function called with 2 parameters, the result from a
   promise resolution and the error from a promise rejection (only 1 will be set
   each call, depending on whether the promise was resolved/rejected), that
   should determine whether or not the promise should be retried. eg:

   ```javascript
   // Retry if a resolved promise result is still in a waiting state
   function shouldRetry(result, error) {
     return result && result.waiting;
   }

   // Retry a rejected promise
   function shouldRetry(result, error) {
     return !!error;
   }
   ```
