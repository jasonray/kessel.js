/*jslint node: true */
"use strict";

const mocha = require('mocha');
const assert = require('assert');
const LogManager = require('../lib/logManager');

describe('logManager', function () {
    it('init', function () {
        const manager = new LogManager();
    });
    describe('_doesLogExist', function () {
        it('false if loggers empty', function () {
            const manager = new LogManager();
            assert.equal(manager._doesLogExist('log1'), false);
        });
        it('false if logger has not been created', function () {
            const manager = new LogManager();
            manager.getLogger('log1');
            assert.equal(manager._doesLogExist('log2'), false);
        });
        it('true if logger has been created', function () {
            const manager = new LogManager();
            manager.getLogger('log1');
            assert.equal(manager._doesLogExist('log1'), true);
        });
    });
    describe('getLogger', function () {
        it('get will create log', function () {
            const manager = new LogManager();
            assert.ok(manager.getLogger('log1'));
        });
        it('get logger twice should not create two loggers', function () {
            //TODO: I do not know how to assert this, so for now this is a manual check, and lack of error is success
            const manager = new LogManager();
            assert.ok(manager.getLogger('please just once'));
            assert.ok(manager.getLogger('please just once'));
        });
    });
});