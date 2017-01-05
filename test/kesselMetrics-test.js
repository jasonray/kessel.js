/*jslint node: true */
"use strict";

var mocha = require('mocha');
var assert = require('assert');
var should = require('should');
// var JobManager = require('../lib/jobManager');
var KesselMetrics = require('../lib/kesselMetrics');

//TODO: disable logger on unit tests

describe.only('metrics', function () {
    beforeEach(function () {
        var kesselMetrics = new KesselMetrics();
        kesselMetrics.reset();
    });
    it('using new constructor', function () {
        var kesselMetrics = new KesselMetrics();
        assert.ok(kesselMetrics);
    });
    it('increment and check', function () {
        var kesselMetrics = new KesselMetrics();
        kesselMetrics.metrics.gauges('jobs-published').value().should.equal(0);
        kesselMetrics._jobPublished();
        kesselMetrics.metrics.gauges('jobs-published').value().should.equal(1);
    });
    it('running twice works because of the reset, otherwise gauge would still be 1', function () {
        var kesselMetrics = new KesselMetrics();
        kesselMetrics.metrics.gauges('jobs-published').value().should.equal(0);
        kesselMetrics._jobPublished();
        kesselMetrics.metrics.gauges('jobs-published').value().should.equal(1);
    });
});