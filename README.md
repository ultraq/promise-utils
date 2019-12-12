
promise-utils
=============

[![Build Status](https://travis-ci.com/ultraq/promise-utils.svg?branch=master)](https://travis-ci.com/ultraq/promise-utils)
[![Coverage Status](https://coveralls.io/repos/github/ultraq/promise-utils/badge.svg?branch=master)](https://coveralls.io/github/ultraq/promise-utils?branch=master)
[![npm](https://img.shields.io/npm/v/@ultraq/promise-utils.svg?maxAge=3600)](https://www.npmjs.com/package/@ultraq/promise-utils)
[![License](https://img.shields.io/github/license/ultraq/promise-utils.svg?maxAge=2592000)](https://github.com/ultraq/promise-utils/blob/master/LICENSE.txt)

A collection of utilities for JavaScript promises.

Installation
------------

Via npm:

```
npm install @ultraq/redux-utils
```

If targeting browsers that don't natively support `Promise`, a polyfill is
required.


API
---

### delay(doPromise, delayMs)

Add an artificial delay to the execution of a promise.  Returns a promise that
is resolved/rejected with the values of the underlying promise, executed after
the initial delay has elapsed.

 - **doPromise**: A function which performs and returns the promise to be
   retried.
 - **delayMs**: Number of milliseconds to delay execution of the promise by.

### pad(promise, padMs)

Causes promise resolution and rejection to take *at least* as long as the time
specified.  Returns a new promise that will be resolved or rejected after the
padding time has elapsed.

 - **promise**: The Promise to pad out
 - **padMs**: Number of milliseconds to have `promise` padded out to, if it
   resolves or rejects too quickly.

### retry(doPromise, numRetries, shouldRetry)

Retry a promise a specified number of times.  Returns a promise that is
resolved/rejected with the results of the underlying promise, or eventually
rejected after the number of retries has been reached without success.

 - **doPromise**: A function which performs and returns the promise to be
   retried.
 - **numRetries**: The number of times a retry should be attempted.
 - **shouldRetry**: When the promise succeeds, this function is called with the
   result to determine whether or not the promise should be retried.
