/*jslint node: true */
"use strict";

var mocha = require('mocha');
var assert = require('assert');
var QueueAdapter = require('../lib/asyncQueueAdapter');

describe('asyncQueueAdapter', function () {
    describe('size', function () {
        it('initial size is 0', function () {
            var queueAdapter = new QueueAdapter();
            assert.equal(queueAdapter.size(), 0);
        });
        it('after enqueue, size is 1', function (done) {
            var queueAdapter = new QueueAdapter();
            var request = createSampleJobRequest();
            queueAdapter.enqueue(request, function () {
                assert.equal(queueAdapter.size(), 1);
                done();
            });
        });
    });
    describe('isEmpty', function () {
        it('initial isEmpty returns true', function () {
            var queueAdapter = new QueueAdapter();
            assert.equal(queueAdapter.isEmpty(), true);
        });
        it('after enqueue, isEmpty is false', function (done) {
            var queueAdapter = new QueueAdapter();
            var request = createSampleJobRequest();
            queueAdapter.enqueue(request, function () {
                assert.equal(queueAdapter.isEmpty(), false);
                done();
            });
        });
    });
    //
    //
    describe('enqueue / dequeue', function () {
        it('dequeue on empty returns empty', function (done) {
            var dequeueCallback = function (jobRequest, jobRequestProcessingCallback) {
                assert.equal(jobRequest, null);
                done();
            }

            var queueAdapter = new QueueAdapter();
            queueAdapter.dequeue(dequeueCallback);
        });
        it('enqueue then dequeue returns job request', function (done) {
            var dequeueCallback = function (jobRequest, jobRequestProcessingCallback) {
                assert.equal(jobRequest.ref, 'testjob');
                done();
            }

            var afterEnqueueCallback = function (err, jobRequest) {
                queueAdapter.dequeue(dequeueCallback);
            }

            var queueAdapter = new QueueAdapter();
            var request = createSampleJobRequest('testjob');
            queueAdapter.enqueue(request, afterEnqueueCallback)
        });
        it('enqueue then dequeue returns job request (with latency)', function (done) {
            var dequeueCallback = function (jobRequest, jobRequestProcessingCallback) {
                assert.equal(jobRequest.ref, 'testjob');
                done();
            }

            var afterEnqueueCallback = function (err, jobRequest) {
                queueAdapter.dequeue(dequeueCallback);
            }

            var queueAdapter = new QueueAdapter(100);
            var request = createSampleJobRequest('testjob');
            queueAdapter.enqueue(request, afterEnqueueCallback)
        });
    });
});

function createSampleJobRequest(ref) {
    var request = {
        type: 'sample',
        payload: {
            x: 'x',
            y: 'y'
        }
    };
    if (ref) {
        request.ref = ref;
    }
    return request;
}