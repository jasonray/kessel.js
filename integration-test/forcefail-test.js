/*jslint node: true */
"use strict";

var mocha = require('mocha');
var assert = require('assert');

/**
 * Created by jason.ray on 12/28/16.
 */
describe('force fail integration section', function () {
    it('force fail test', function () {
        assert.fail();
    });
});
