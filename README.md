
promise-utils
=============

[![Build Status](https://github.com/ultraq/promise-utils/actions/workflows/build.yml/badge.svg)](https://github.com/ultraq/promise-utils/actions)
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

Retry a promise based on the result of the `shouldRetry` function.  Returns a
promise that will eventually resolve to the value or reject with the error from
the retried promise.

 - **doPromise**: A function which returns the promise to be retried.
 - **shouldRetry**: A function called with the result from a promise resolution
   (if we are here because the promise was resolved), the error from a promise
   rejection (if we are here because the promise was rejected), and the number
   of attempts made thus far.  These can be used to determine if the promise
   should be retried, and the function can return either a boolean to indicate a
   retry should be made immediately (`true`), or abandoned (`false`), or a
   number value to specify a delay in milliseconds of how long until that retry
   should be attempted (a -1 can also be used to abandon a retry).  eg:

   ```javascript
   // Retry immediately if a resolved promise result is still in a waiting state
   function shouldRetry(result) {
     return result && result.waiting ? 0 : -1;
   }

   // Retry immediately on a rejected promise
   function shouldRetry(result, error) {
     return !!error;
   }

   // Retry on error up to 2 times (3 attempts total)
   function shouldRetry(result, error, attempts) {
     return !!error && attempts < 3;
   }

   // Retry on error up to 2 times (3 attempts total) with an increasing delay between attempts
   function shouldRetry(result, error, attempts) {
     return !!error && attempts < 3 ? attempts * 250 : -1;
   }
   ```
