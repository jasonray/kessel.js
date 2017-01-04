/*jslint node: true */
"use strict";

var mocha = require('mocha');
var assert = require('assert');
var should = require('should');
var HandlerRegistry = require('../lib/handlerRegistry');

describe('handler config', function () {
    var additionModuleKey = '../lib/sample-handlers/addition-handler';
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
        registeredHandler.should.equal(additionHandler);
    });
    it('get does not care about spaces', function () {
        var registry = new HandlerRegistry();
        var additionHandler = require(additionModuleKey);
        registry.registerHandler("+", additionHandler);
        var registeredHandler = registry.getHandler(' + ');
        registeredHandler.should.equal(additionHandler);
    });
    it('register two handler, get returns it', function () {
        var registry = new HandlerRegistry();

        var additionHandler = require(additionModuleKey);
        registry.registerHandler("+", additionHandler);

        var multiplicationHandler = require(multiplicationModuleKey);
        registry.registerHandler("*", multiplicationHandler);

        registry.getHandler('+').should.equal(additionHandler);
        registry.getHandler('*').should.equal(multiplicationHandler);
    });
    it('register same handler twice', function () {
        var registry = new HandlerRegistry();

        var additionHandler = require(additionModuleKey);
        registry.registerHandler("+", additionHandler);
        registry.registerHandler("add", additionHandler);

        registry.getHandler('+').should.equal(additionHandler);
        registry.getHandler('add').should.equal(additionHandler);
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
});