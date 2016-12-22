/*jslint node: true */
"use strict";

var mocha = require('mocha');
var assert = require('assert');
var LogManager = require('../logManager');

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
});