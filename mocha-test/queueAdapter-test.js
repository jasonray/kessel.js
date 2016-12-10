/*jslint node: true */
"use strict";

var mocha = require('mocha');
var assert = require('assert');
var QueueAdapter = require('../lib/QueueAdapter');

describe('queueAdapter', function () {
    describe('size', function () {
        it('initial size is 0', function () {
            var queueAdapter = new QueueAdapter();
            assert.equal(queueAdapter.size(), 0);
        });
        it('after enqueue, size is 1', function () {
            var queueAdapter = new QueueAdapter();
            var request = createSampleJobRequest();
            queueAdapter.enqueue(request)
            assert.equal(queueAdapter.size(), 1);
        });
    });
    describe('isEmpty', function () {
        it('initial isEmpty returns true', function () {
            var queueAdapter = new QueueAdapter();
            assert.equal(queueAdapter.isEmpty(), true);
        });
        it('after enqueue, isEmpty is false', function () {
            var queueAdapter = new QueueAdapter();
            var request = createSampleJobRequest();
            queueAdapter.enqueue(request)
            assert.equal(queueAdapter.isEmpty(), false);
        });
    });
    describe('enqueue / dequeue', function () {
        it('enqueue then dequeue returns job request', function (done) {
            var dequeueCallback = function (jobRequest, jobRequestProcessingCallback) {
                assert.equal(jobRequest.ref, 'testjob');
                done();
            }

            var queueAdapter = new QueueAdapter();
            var request = createSampleJobRequest('testjob');
            queueAdapter.enqueue(request)
            queueAdapter.dequeue(dequeueCallback);

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