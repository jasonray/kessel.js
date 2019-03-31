/*jslint node: true */
"use strict";

const mocha = require('mocha');
const assert = require('assert');
const QueueAdapter = require('../lib/queue/basicQueueAdapter');

describe('basicQueueAdapter', function () {
    describe('size', function () {
        it('initial size is 0', function () {
            const queueAdapter = new QueueAdapter();
            assert.equal(queueAdapter.size(), 0);
        });
        it('after enqueue, size is 1', function () {
            const queueAdapter = new QueueAdapter();
            const request = createSampleJobRequest();
            queueAdapter.enqueue(request)
            assert.equal(queueAdapter.size(), 1);
        });
    });
    describe('isEmpty', function () {
        it('initial isEmpty returns true', function () {
            const queueAdapter = new QueueAdapter();
            assert.equal(queueAdapter.isEmpty(), true);
        });
        it('after enqueue, isEmpty is false', function () {
            const queueAdapter = new QueueAdapter();
            const request = createSampleJobRequest();
            queueAdapter.enqueue(request)
            assert.equal(queueAdapter.isEmpty(), false);
        });
    });


    describe('enqueue / dequeue', function () {
        it('dequeue on empty returns empty', function (done) {
            const dequeueCallback = function (jobRequest, jobRequestProcessingCallback) {
                assert.equal(jobRequest, null);
                done();
            }

            const queueAdapter = new QueueAdapter();
            queueAdapter.dequeue(dequeueCallback);
        });
        it('enqueue then dequeue returns job request', function (done) {
            const dequeueCallback = function (jobRequest, jobRequestProcessingCallback) {
                assert.equal(jobRequest.ref, 'testjob');
                done();
            };

            const queueAdapter = new QueueAdapter();
            const request = createSampleJobRequest('testjob');
            queueAdapter.enqueue(request)
            queueAdapter.dequeue(dequeueCallback);
        });
    });
});

function createSampleJobRequest(ref) {
    const request = {
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