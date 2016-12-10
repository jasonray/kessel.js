/*jslint node: true */
"use strict";

var mocha = require('mocha');
var assert = require('assert');
var QueueAdapter = require('../lib/QueueAdapter');

describe('queueAdapter', function () {
    it('initial size is 0', function () {
        var queueAdapter = new QueueAdapter();
        assert.equal(queueAdapter.size(), 0);
    });
    // it('will fail', function () {
    //     assert.ok(false);
    // });
});