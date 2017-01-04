/*jslint node: true */
"use strict";

var mocha = require('mocha');
var assert = require('assert');
var should = require('should');
var _ = require('underscore');
var HandlerRegistry = require('../lib/handlerRegistry');

describe('handler config', function () {
    var additionModuleKey = '../lib/sample-handlers/addition-handler';
    var additionFunctionModuleKey = '../lib/sample-handlers/addition-function-handler';
    var multiplicationModuleKey = '../lib/sample-handlers/multiplication-handler';

    it('empty job manager returns null handler', function () {
        var registry = new HandlerRegistry();
        var handler = registry.getHandler('+');
        should.not.exists(handler);
    });
    it('register single handler, get returns it', function () {
        var registry = new HandlerRegistry();
        var additionHandler = require(additionModuleKey);
        registry.registerHandler("+", additionHandler);
        var registeredHandler = registry.getHandler('+');
        registeredHandler.should.equal(additionHandler.handle);
    });
    it('get does not care about spaces', function () {
        var registry = new HandlerRegistry();
        var additionHandler = require(additionModuleKey);
        registry.registerHandler("+", additionHandler);
        var registeredHandler = registry.getHandler(' + ');
        registeredHandler.should.equal(additionHandler.handle);
    });
    it('register two handler, get returns it', function () {
        var registry = new HandlerRegistry();

        var additionHandler = require(additionModuleKey);
        registry.registerHandler("+", additionHandler);

        var multiplicationHandler = require(multiplicationModuleKey);
        registry.registerHandler("*", multiplicationHandler);

        registry.getHandler('+').should.equal(additionHandler.handle);
        registry.getHandler('*').should.equal(multiplicationHandler.handle);
    });
    it('register same handler twice', function () {
        var registry = new HandlerRegistry();

        var additionHandler = require(additionModuleKey);
        registry.registerHandler("+", additionHandler);
        registry.registerHandler("add", additionHandler);

        registry.getHandler('+').should.equal(additionHandler.handle);
        registry.getHandler('add').should.equal(additionHandler.handle);
    });
    it('getHandler on null return no handler', function () {
        var registry = new HandlerRegistry();

        var additionHandler = require(additionModuleKey);
        registry.registerHandler("+", additionHandler);
        registry.registerHandler("add", additionHandler);

        var handler = registry.getHandler();
        should.not.exists(handler);
    });
    it('getHandler on empty return no handler', function () {
        var registry = new HandlerRegistry();

        var additionHandler = require(additionModuleKey);
        registry.registerHandler("+", additionHandler);
        registry.registerHandler("add", additionHandler);

        var handler = registry.getHandler('');
        should.not.exists(handler);
    });
    it('do not allow two handlers for same type; ##note, I may change this in future', function () {
        var registry = new HandlerRegistry();

        var additionHandler = require(additionModuleKey);
        registry.registerHandler("math", additionHandler);

        var multiplicationHandler = require(multiplicationModuleKey);

        assert.throws(
            function () {
                registry.registerHandler("math", multiplicationHandler);
            },
            Error
        );

    });
    it('get on non handled type returns null', function () {
        var registry = new HandlerRegistry();

        var additionHandler = require(additionModuleKey);
        registry.registerHandler("+", additionHandler);

        var multiplicationHandler = require(multiplicationModuleKey);
        registry.registerHandler("*", multiplicationHandler);

        should.not.exists(registry.getHandler('^'));
    });
    it('cannot register null type', function () {
        var registry = new HandlerRegistry();
        var additionHandler = require(additionModuleKey);

        assert.throws(
            function () {
                registry.registerHandler(null, additionHandler);
            },
            Error
        );
    });
    it('cannot register blank type', function () {
        var registry = new HandlerRegistry();
        var additionHandler = require(additionModuleKey);

        assert.throws(
            function () {
                registry.registerHandler("", additionHandler);
            },
            Error
        );
    });
    it('cannot register spaced type', function () {
        var registry = new HandlerRegistry();
        var additionHandler = require(additionModuleKey);

        assert.throws(
            function () {
                registry.registerHandler(" ", additionHandler);
            },
            Error
        );
    });
    it('cannot register missing handler', function () {
        var registry = new HandlerRegistry();
        assert.throws(
            function () {
                registry.registerHandler("+");
            },
            Error
        );
    });
    it('can handle a function based handler', function () {
        var registry = new HandlerRegistry();
        var additionFunctionHandler = require(additionFunctionModuleKey);
        registry.registerHandler("+f", additionFunctionHandler);
        var registeredHandler = registry.getHandler('+f');
        registeredHandler.should.equal(additionFunctionHandler);
    });
    it('function registered as function', function () {
        var registry = new HandlerRegistry();
        var additionFunctionHandler = require(additionFunctionModuleKey);
        registry.registerHandler("+f", additionFunctionHandler);
        var registeredHandler = registry.getHandler('+f');
        assert.ok(_.isFunction(registeredHandler));
    });
    it('object registered as function', function () {
        var registry = new HandlerRegistry();
        var additionFunctionHandler = require(additionModuleKey);
        console.log(additionFunctionHandler);
        registry.registerHandler("+", additionFunctionHandler);
        var registeredHandler = registry.getHandler('+');
        assert.ok(_.isFunction(registeredHandler));
    });

});