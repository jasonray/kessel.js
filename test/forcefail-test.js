/*jslint node: true */
"use strict";

var mocha = require('mocha');
var assert = require('assert');

describe('force fail unit test section', function () {
    it('force fail test 1');
    it('force fail test 2', function () {
        assert.fail();
    });
});
