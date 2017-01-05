/*jslint node: true */
"use strict";

var mocha = require('mocha');
var assert = require('assert');
var should = require('should');
// var JobManager = require('../lib/jobManager');
var KesselMetrics = require('../lib/kesselMetrics');

//TODO: disable logger on unit tests

describe.only('metrics', function () {
    it('using new constructor', function () {
        var metrics = new KesselMetrics();
        assert.ok(metrics);
    });
});