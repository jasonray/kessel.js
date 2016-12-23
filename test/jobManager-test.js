/*jslint node: true */
"use strict";

var mocha = require('mocha');
var assert = require('assert');
var JobManager = require('../lib/jobManager');

//TODO: disable logger on unit tests

describe('jobManager', function () {
    it('init', function () {
        var manager = new JobManager();
    });
    it('request job', function () {
        var request = {
            type: 'add',
            payload: {
                operands: [1, 2]
            }
        };
        var manager = new JobManager();
        manager.request(request);
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
            assert.equal(result, 3);
        });
        it('when job is processed, if it contains a callback, callback fires', function (done) {
            var myCallback = function (result) {
                console.log('callback fired');
                assert.equal(result, 3);
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
            assert.equal(result, 3);
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
    });
});