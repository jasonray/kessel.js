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
            assert.equal(manager._doesLogExist('logname'), false);
        });
    });
});