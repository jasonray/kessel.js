/*jslint node: true */
"use strict";

const mocha = require('mocha');
const assert = require('assert');
const should = require('should');
const _ = require('underscore');
const HandlerRegistry = require('../lib/handlerRegistry');

describe('handler registry', function () {
    const additionModuleKey = '../lib/sample-handlers/addition-handler';
    const additionFunctionModuleKey = '../lib/sample-handlers/addition-function-handler';
    const multiplicationModuleKey = '../lib/sample-handlers/multiplication-handler';

    describe('register', function () {
        it('empty job manager returns null handler', function () {
            const registry = new HandlerRegistry();
            const handler = registry.getHandler('+');
            should.not.exists(handler);
        });
        it('register single handler, get returns it', function () {
            const registry = new HandlerRegistry();
            const additionHandler = require(additionModuleKey);
            registry.registerHandler("+", additionHandler);
            const registeredHandler = registry.getHandler('+');
            registeredHandler.should.equal(additionHandler.handle);
        });
        it('get does not care about spaces', function () {
            const registry = new HandlerRegistry();
            const additionHandler = require(additionModuleKey);
            registry.registerHandler("+", additionHandler);
            const registeredHandler = registry.getHandler(' + ');
            registeredHandler.should.equal(additionHandler.handle);
        });
        it('register two handler, get returns it', function () {
            const registry = new HandlerRegistry();

            const additionHandler = require(additionModuleKey);
            registry.registerHandler("+", additionHandler);

            const multiplicationHandler = require(multiplicationModuleKey);
            registry.registerHandler("*", multiplicationHandler);

            registry.getHandler('+').should.equal(additionHandler.handle);
            registry.getHandler('*').should.equal(multiplicationHandler.handle);
        });
        it('register same handler twice', function () {
            const registry = new HandlerRegistry();

            const additionHandler = require(additionModuleKey);
            registry.registerHandler("+", additionHandler);
            registry.registerHandler("add", additionHandler);

            registry.getHandler('+').should.equal(additionHandler.handle);
            registry.getHandler('add').should.equal(additionHandler.handle);
        });
        it('getHandler on null return no handler', function () {
            const registry = new HandlerRegistry();

            const additionHandler = require(additionModuleKey);
            registry.registerHandler("+", additionHandler);
            registry.registerHandler("add", additionHandler);

            const handler = registry.getHandler();
            should.not.exists(handler);
        });
        it('getHandler on empty return no handler', function () {
            const registry = new HandlerRegistry();

            const additionHandler = require(additionModuleKey);
            registry.registerHandler("+", additionHandler);
            registry.registerHandler("add", additionHandler);

            const handler = registry.getHandler('');
            should.not.exists(handler);
        });
        it('do not allow two handlers for same type; ##note, I may change this in future', function () {
            const registry = new HandlerRegistry();

            const additionHandler = require(additionModuleKey);
            registry.registerHandler("math", additionHandler);

            const multiplicationHandler = require(multiplicationModuleKey);

            assert.throws(
                function () {
                    registry.registerHandler("math", multiplicationHandler);
                },
                Error
            );

        });
        it('get on non handled type returns null', function () {
            const registry = new HandlerRegistry();

            const additionHandler = require(additionModuleKey);
            registry.registerHandler("+", additionHandler);

            const multiplicationHandler = require(multiplicationModuleKey);
            registry.registerHandler("*", multiplicationHandler);

            should.not.exists(registry.getHandler('^'));
        });
        it('cannot register null type', function () {
            const registry = new HandlerRegistry();
            const additionHandler = require(additionModuleKey);

            assert.throws(
                function () {
                    registry.registerHandler(null, additionHandler);
                },
                Error
            );
        });
        it('cannot register blank type', function () {
            const registry = new HandlerRegistry();
            const additionHandler = require(additionModuleKey);

            assert.throws(
                function () {
                    registry.registerHandler("", additionHandler);
                },
                Error
            );
        });
        it('cannot register spaced type', function () {
            const registry = new HandlerRegistry();
            const additionHandler = require(additionModuleKey);

            assert.throws(
                function () {
                    registry.registerHandler(' ', additionHandler);
                },
                Error
            );
        });
        it('cannot register missing handler', function () {
            const registry = new HandlerRegistry();
            assert.throws(
                function () {
                    registry.registerHandler("+");
                },
                Error
            );
        });
        it('can handle a function based handler', function () {
            const registry = new HandlerRegistry();
            const additionFunctionHandler = require(additionFunctionModuleKey);
            registry.registerHandler("+f", additionFunctionHandler);
            const registeredHandler = registry.getHandler('+f');
            registeredHandler.should.equal(additionFunctionHandler);
        });
        it('can handle a module identifier based handler', function () {
            const registry = new HandlerRegistry();
            registry.registerHandler("+", additionModuleKey);
            const registeredHandler = registry.getHandler('+');
            assert.ok(_.isFunction(registeredHandler));
        });
        it('can handle a module identifier of function based handler', function () {
            const registry = new HandlerRegistry();
            registry.registerHandler("+f", additionFunctionModuleKey);
            const registeredHandler = registry.getHandler('+f');
            assert.ok(_.isFunction(registeredHandler));
        });
        it('function registered as function', function () {
            const registry = new HandlerRegistry();
            const additionFunctionHandler = require(additionFunctionModuleKey);
            registry.registerHandler("+f", additionFunctionHandler);
            const registeredHandler = registry.getHandler('+f');
            assert.ok(_.isFunction(registeredHandler));
        });
        it('object registered as function', function () {
            const registry = new HandlerRegistry();
            const additionFunctionHandler = require(additionModuleKey);
            console.log(additionFunctionHandler);
            registry.registerHandler("+", additionFunctionHandler);
            const registeredHandler = registry.getHandler('+');
            assert.ok(_.isFunction(registeredHandler));
        });
    });

    describe('register group', function () {
        const additionHandler = require(additionModuleKey);
        const multiplicationHandler = require(multiplicationModuleKey);

        it('register none', function () {
            const registry = new HandlerRegistry();
            registry.registerHandlers();
            const handler = registry.getHandler('+');
            should.not.exists(handler);
        });
        describe('array based config', function () {
            it('register one', function () {
                const registry = new HandlerRegistry();
                registry.registerHandlers([{type: '+', handler: additionHandler}]);
                const handler = registry.getHandler('+');
                handler.should.equal(additionHandler.handle);
            });
            it('register two', function () {
                const registry = new HandlerRegistry();
                registry.registerHandlers(
                    [
                        {type: '+', handler: additionHandler},
                        {type: '*', handler: multiplicationHandler}
                    ]);

                registry.getHandler('+').should.equal(additionHandler.handle);
                registry.getHandler('*').should.equal(multiplicationHandler.handle);
            });
            it('duplicative', function () {
                const config = [
                    {type: '+', handler: additionHandler},
                    {type: '+', handler: additionHandler},
                    {type: '*', handler: multiplicationHandler}
                ];

                const registry = new HandlerRegistry();

                assert.throws(
                    function () {
                        registry.registerHandlers(config);
                    },
                    Error
                );
            });
        });
        describe('key/value based config', function () {
            it('register one', function () {
                const registry = new HandlerRegistry();
                registry.registerHandlers({'+': additionHandler});
                const handler = registry.getHandler('+');
                handler.should.equal(additionHandler.handle);
            });
            it('register two', function () {
                const registry = new HandlerRegistry();
                registry.registerHandlers({'+': additionHandler, '*': multiplicationHandler});

                registry.getHandler('+').should.equal(additionHandler.handle);
                registry.getHandler('*').should.equal(multiplicationHandler.handle);
            });
        });
    });
});