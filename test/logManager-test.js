/*jslint node: true */
"use strict";

var mocha = require('mocha');
var assert = require('assert');
var LogManager = require('../lib/logManager');

describe('logManager', function () {
    it('init', function () {
        var manager = new LogManager();
    });
    describe('_doesLogExist', function () {
        it('false if loggers empty', function () {
            var manager = new LogManager();
            assert.equal(manager._doesLogExist('log1'), false);
        });
        it('false if logger has not been created', function () {
            var manager = new LogManager();
            manager.getLogger('log1');
            assert.equal(manager._doesLogExist('log2'), false);
        });
        it('true if logger has been created', function () {
            var manager = new LogManager();
            manager.getLogger('log1');
            assert.equal(manager._doesLogExist('log1'), true);
        });
    });
    describe('getLogger', function () {
        it('get will create log', function () {
            var manager = new LogManager();
            assert.ok(manager.getLogger('log1'));
        });
        it('get logger twice should not create two loggers', function () {
            //TODO: I do not know how to assert this, so for now this is a manual check, and lack of error is success
            var manager = new LogManager();
            assert.ok(manager.getLogger('please just once'));
            assert.ok(manager.getLogger('please just once'));
        });
    });
});