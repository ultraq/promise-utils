
promise-utils
=============

[![Build Status](https://travis-ci.org/ultraq/promise-utils.svg?branch=master)](https://travis-ci.org/ultraq/promise-utils)
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

### pad(promise, padMs)

Causes promise resolution to take *at least* as long as the time specified by
returning a promise chain with the `padMs` value that isn't resolved until both
the padding promise and the original promise are resolved.

 - **promise**: the Promise to pad out
 - **padMs**: number of milliseconds to have `promise` padded out to, if it
   resolves too quickly
