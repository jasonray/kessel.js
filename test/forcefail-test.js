/*jslint node: true */
"use strict";

var mocha = require('mocha');
var assert = require('assert');

describe.skip('force fail unit test section', function () {
    it('force fail test', function () {
        assert.fail();
    });
});
