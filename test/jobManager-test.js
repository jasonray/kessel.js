/*jslint node: true */
"use strict";

var mocha = require('mocha');
var assert = require('assert');
var JobManager = require('../lib/jobManager');

//TODO: disable logger on unit tests

describe('jobManager', function () {
    describe('constructor', function () {
        it('using new constructor', function () {
            var jobManager = new JobManager();
            assert.ok(jobManager);
        });
        it('using implicit constructor', function () {
            var jobManager = JobManager();
            assert.ok(jobManager);
        });
    });
    it('request job', function (done) {
        var request = {
            type: 'add',
            payload: {
                operands: [1, 2]
            }
        };
        var manager = new JobManager();
        manager.request(request, function (err) {
            assert.equal(err, null);
            done();
        });
    });

    describe('process single job', function () {
        it('process one job', function () {
            var request = {
                type: 'add',
                payload: {
                    operands: [1, 2]
                }
            };
            var manager = new JobManager();
            var result = manager.processSingleJob(request);
            assert.equal(result.value, 3);
        });
        it('when job is processed, if it contains a callback, callback fires', function (done) {
            var myCallback = function (err, result) {
                assert.equal(result.value, 3);
                done();
            }
            var request = {
                type: 'add',
                callback: myCallback,
                payload: {
                    operands: [1, 2]
                }
            };
            var manager = new JobManager();
            var result = manager.processSingleJob(request);
            assert.equal(result.value, 3);
        });
        it('when job is processed, if it contains a callback but callback is not a function, callback does not fire', function () {
            var request = {
                type: 'add',
                callback: 'invalid callback',
                payload: {
                    operands: [1, 2]
                }
            };
            var manager = new JobManager();
            manager.processSingleJob(request);
        });
        it('process one job delegates to correct handler', function () {
            var request1 = {
                type: 'addition',
                payload: {
                    operands: [3, 2]
                }
            };
            var request2 = {
                type: 'multiplication',
                payload: {
                    operands: [3, 2]
                }
            };
            var manager = new JobManager();
            assert.equal(manager.processSingleJob(request1).value, 5, "addition");
            assert.equal(manager.processSingleJob(request2).value, 6, "multiplication");
        });
    });
    describe('jobManager with async queue adapter', function () {
        it.only('process one job', function (done) {
            var request = {
                type: 'add',
                payload: {
                    operands: [3, 2]
                },
                callback: requestCallback
            };
            var manager = new JobManager();
            manager.initialize(function (err) {
                manager.request(request, function (err) {
                    manager.start();
                })
            });

            function requestCallback(err, processedJobResult) {
                assert.equal(processedJobResult.value, 5);
                done();
            }

        });
    });
});