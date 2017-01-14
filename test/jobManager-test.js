/*jslint node: true */
"use strict";

const mocha = require('mocha');
const assert = require('assert');
const should = require('should');
const JobManager = require('../lib/jobManager');

//TODO: disable logger on unit tests

describe('jobManager', function () {
    describe('constructor', function () {
        it('using new constructor', function () {
            const jobManager = new JobManager();
            assert.ok(jobManager);
        });
    });
    it('request job', function (done) {
        const request = {
            type: 'add',
            payload: {
                operands: [1, 2]
            }
        };
        const manager = new JobManager();
        manager.request(request, function (err) {
            assert.equal(err, null);
            done();
        });
    });

    describe('process single job', function () {
        it('process one job', function () {
            const request = {
                type: 'add',
                payload: {
                    operands: [1, 2]
                }
            };
            const manager = new JobManager();
            const result = manager.processSingleJob(request);
            assert.equal(result.value, 3);
        });
        it('when job is processed, if it contains a callback, callback fires', function (done) {
            const myCallback = function (err, result) {
                assert.equal(result.value, 3);
                done();
            }
            const request = {
                type: 'add',
                callback: myCallback,
                payload: {
                    operands: [1, 2]
                }
            };
            const manager = new JobManager();
            const result = manager.processSingleJob(request);
            assert.equal(result.value, 3);
        });
        it('when job is processed, if it contains a callback but callback is not a function, callback does not fire', function () {
            const request = {
                type: 'add',
                callback: 'invalid callback',
                payload: {
                    operands: [1, 2]
                }
            };
            const manager = new JobManager();
            manager.processSingleJob(request);
        });
        it('process one job delegates to correct handler', function () {
            const request1 = {
                type: 'addition',
                payload: {
                    operands: [3, 2]
                }
            };
            const request2 = {
                type: 'multiplication',
                payload: {
                    operands: [3, 2]
                }
            };
            const manager = new JobManager();
            assert.equal(manager.processSingleJob(request1).value, 5, "addition");
            assert.equal(manager.processSingleJob(request2).value, 6, "multiplication");
        });
    });
    describe('jobManager with async queue adapter', function () {
        it('process one job', function (done) {
            const request = {
                type: 'add',
                payload: {
                    operands: [3, 2]
                },
                callback: requestCallback
            };
            const manager = new JobManager();
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