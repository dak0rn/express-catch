# express-catch
Error propagation for express.js

This small utility wraps all express.js functions ensuring that errors thrown or
promises rejected by callback functions are caught and propagated to the next
handler.

## Install

```bash
npm install --save express-catch

# - or -

yarn add express-catch
```

## Usage example

```js
const express = require('express');
const wrapCatch = require('express-catch');

const server = express();
const router = wrapCatch(server);

router.get('/', async function() {
    throw new Error();
});

router.post('/', function() {
    return Promise.reject();
});

// Using `server` here! See notes.
server.use(function(err, req, res, next) {
    // Error handling
});

server.use(function(req, res) {
    // 404 handling
});
```

## Notes

- The given object is not modified
- The functionality is meant to be used with routing functions having the signature
    `(req, res, next)` - therefore, it does not work with error handlers, for example.
    Define them using the original server object.
