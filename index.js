/**
 * express-catch
 * Error propagation for express.js
 */

module.exports = function(server) {
    // Wrapper function that handles errors
    const wrap = fn =>
        async function(req, res, next) {
            try {
                const promise = fn(req, res, next);

                if (promise && promise.catch) promise.catch(next);
            } catch (e) {
                next(e);
            }
        };

    return Object.keys(server)
        .filter(n => 'function' === typeof server[n])
        .reduce((srv, fnName) => {
            const _fn = server[fnName].bind(server);

            return Object.assign(srv, {
                [fnName]: function(...args) {
                    const wrappedArgs = args.map(
                        f => ('function' === typeof f ? wrap(f) : f)
                    );

                    return _fn(...wrappedArgs);
                }
            });
        }, Object.assign({}, server)); // Create a copy of the server
};
