/*jslint node: true */
"use strict";

const mocha = require('mocha');
const assert = require('assert');

describe.skip('force fail unit test section', function () {
    it('force fail test', function () {
        assert.fail();
    });
});
