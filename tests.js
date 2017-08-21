const test = require('tape');

const sut = require('./index');

test('exports a function', function(t) {
    t.plan(1);
    t.equal(typeof sut, 'function');
    t.end();
});

test('overwrites all functions', function(t) {
    const obj = {
        a: 1,
        fn1: function() {},
        fn2: function() {},
        fn3: 'fn3',
        c: true
    };
    t.plan(5);

    const wrapped = sut(obj);

    Object.keys(obj).forEach(prop => {
        const value = obj[prop];

        if ('function' !== typeof value) t.equal(wrapped[prop], value);
        else t.notEqual(wrapped[prop], value);
    });

    t.end();
});

test('does not touch the original object', function(t) {
    const obj = {
        a: 1,
        fn1: function() {},
        fn2: function() {},
        fn3: 'fn3',
        c: true
    };

    t.plan(1);
    const wrapped = sut(obj);

    t.notEqual(wrapped, obj);

    t.end();
});

test('catches and propagates all thrown errors', function(t) {
    const server = {
        get(ignore1, ignore2, fn, ignore3) {
            this.$fn = fn;
        },
        post(fn1, fn2) {
            this.$fn1 = fn1;
            this.$fn2 = fn2;
        },

        $fn: void 0,
        $fn1: void 0,
        $fn2: void 0
    };
    const error = new Error('test.error');
    const error1 = new Error('test.error');
    const error2 = new Error('test.error');

    t.plan(3);

    const wrapped = sut(server);
    const throwError = e =>
        function() {
            throw e;
        };
    const errorEquals = e =>
        function(cmp) {
            t.equals(cmp, e);
        };

    wrapped.get('a', 'b', throwError(error), 'c');
    wrapped.post(throwError(error1), throwError(error2));

    // Execute the fake 'route' functions
    server.$fn(void 0, void 0, errorEquals(error));
    server.$fn1(void 0, void 0, errorEquals(error1));
    server.$fn2(void 0, void 0, errorEquals(error2));

    t.end();
});

test('catches and propagates all rejected promises', function(t) {
    const server = {
        get(ignore1, ignore2, fn, ignore3) {
            this.$fn = fn;
        },
        post(fn1, fn2) {
            this.$fn1 = fn1;
            this.$fn2 = fn2;
        },

        $fn: void 0,
        $fn1: void 0,
        $fn2: void 0
    };
    const error = new Error('test.error');
    const error1 = new Error('test.error');
    const error2 = new Error('test.error');

    t.plan(3);
    t.timeoutAfter(1000);

    const wrapped = sut(server);
    const rejectError = e =>
        function() {
            return Promise.reject(e);
        };
    const errorEquals = e =>
        function(cmp) {
            t.equals(cmp, e);
        };

    wrapped.get('a', 'b', rejectError(error), 'c');
    wrapped.post(rejectError(error1), rejectError(error2));

    // Execute the fake 'route' functions
    server.$fn(void 0, void 0, errorEquals(error));
    server.$fn1(void 0, void 0, errorEquals(error1));
    server.$fn2(void 0, void 0, errorEquals(error2));

    // Promises are async, don't do that here
    //t.end();
});
