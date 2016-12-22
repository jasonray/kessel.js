/*jslint node: true */
"use strict";

var mocha = require('mocha');
var assert = require('assert');
var JobManager = require('../lib/jobManager');

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
    it('process one job', function () {
        var request = {
            type: 'add',
            payload: {
                operands: [1, 2]
            }
        };
        var manager = new JobManager();
        manager.request(request);
        manager._processOneJob();
    });
    it('when job is processed, if it contains a callback, callback fires', function (done) {
        var myCallback = function () {
            console.log('callback fired');
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
        manager.request(request);
        manager._processOneJob();
    });
    it('when job is processed, if it contains a callback but callback is not a function, callback does not fire', function () {
        var request = {
            type: 'add',
            callback: 'hello',
            payload: {
                operands: [1, 2]
            }
        };
        var manager = new JobManager();
        manager.request(request);
        manager._processOneJob();
    });
});