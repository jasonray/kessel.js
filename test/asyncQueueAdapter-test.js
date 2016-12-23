/*jslint node: true */
"use strict";

var mocha = require('mocha');
var assert = require('assert');
var QueueAdapter = require('../lib/queue/asyncQueueAdapter');

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
    describe('enqueue / dequeue', function () {
        it('dequeue on empty returns empty', function (done) {
            var dequeueCallback = function (reservedJobRequest, commitJobA, rollbackJobA) {
                assert.equal(reservedJobRequest, null);
                done();
            }

            var queueAdapter = new QueueAdapter();
            queueAdapter.dequeue(dequeueCallback);
        });
        it('enqueue then dequeue returns job request', function (done) {
            var dequeueCallback = function (jobRequest, commitJobA, rollbackJobA) {
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
            var dequeueCallback = function (jobRequest, commitJobA, rollbackJobA) {
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
    describe('enqueue / dequeue with transactions', function () {
        it('dequeue (without commit/rollback) makes item unavailable to another dequeue', function (done) {
            var queueAdapter = new QueueAdapter();

            var jobRequestA = createSampleJobRequest('a');
            queueAdapter.enqueue(jobRequestA, afterEnqueueCallback);

            function afterEnqueueCallback(err, jobRequest) {
                //at this point jobRequestA is in queue
                queueAdapter.dequeue(function (reservedJobA, commitJobA, rollbackJobA) {
                    //at this point, no item on queue and jobRequestA is in reserved state
                    assert.ok(reservedJobA, 'expected an item to be reserved from queue');
                    assert.equal(reservedJobA.ref, 'a');

                    //if we dequeue at this point, we should get empty item as there is nothing available on queue
                    queueAdapter.dequeue(function (reservedJobB, commitJobB, rollbackJobB) {
                        assert.equal(reservedJobB, null, 'expected no item available from queue');
                        done();
                    });

                });
            }


        });
        // it('dequeue (with commit) makes item unavailable to another dequeue', function (done) {
        //     assert.fail('not implemented');
        // });
        // it('dequeue (with rollback) makes item available to another dequeue', function (done) {
        //     assert.fail('not implemented');
        // });
        // it('ensure support for two no-committed dequeue', function (done) {
        //     assert.fail('not implemented');
        // });
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