/*jslint node: true */
"use strict";

var mocha = require('mocha');
var assert = require('assert');
var QueueAdapter = require('../lib/queue/beanstalkAdapter');

var config = {
    beanstalk: {
        host: '127.0.0.1',
        port: '3000'
    }
}

var config_invalidHost = {
    beanstalk: {
        host: '127.0.0.1',
        port: '3000'
    }
}

//these tests assume that beanstalkd is running at 127.0.0.1:3000
describe('beanstalkAdapter', function () {
    describe.only('initialization', function () {
        it('constructor', function () {
            var adapter = new QueueAdapter(config);
        });
        it('init', function (done) {
            var adapter = new QueueAdapter(config);
            adapter.initialize(function () {
                done();
            });
        });
        it('handle no config', function (done) {
            var adapter = new QueueAdapter();
            adapter.initialize(function () {
                done();
            });
        });
        it('handle config with no host', function (done) {
            var noHostConfig = {
                beanstalk: {
                    port: '3000'
                }
            }

            var adapter = new QueueAdapter();
            adapter.initialize(function () {
                done();
            });
        });
        it('handle config with no port', function (done) {
            var noPortConfig = {
                beanstalk: {
                    port: '3000'
                }
            }

            var adapter = new QueueAdapter();
            adapter.initialize(function () {
                done();
            });
        });
        it('handle unable to connect to beanstalk');
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
        it('dequeue (with commit) makes item unavailable to another dequeue', function (done) {
            var queueAdapter = new QueueAdapter();

            var jobRequestA = createSampleJobRequest('a');
            queueAdapter.enqueue(jobRequestA, afterEnqueueCallback);

            function afterEnqueueCallback(err, jobRequest) {
                //at this point jobRequestA is in queue
                queueAdapter.dequeue(function (reservedJobA, commitJobA, rollbackJobA) {
                    //at this point, no item on queue and jobRequestA is in reserved state
                    assert.ok(reservedJobA, 'expected an item to be reserved from queue');
                    assert.equal(reservedJobA.ref, 'a');

                    commitJobA(function () {
                        //item commit off of queue

                        //if we dequeue at this point, we should get empty item as there is nothing available on queue
                        queueAdapter.dequeue(function (reservedJobB, commitJobB, rollbackJobB) {
                            assert.equal(reservedJobB, null, 'expected no item available from queue');
                            done();
                        });
                    });
                });
            }
        });
        it('dequeue (with rollback) makes item available to another dequeue', function (done) {
            var queueAdapter = new QueueAdapter();

            var jobRequestA = createSampleJobRequest('a');
            queueAdapter.enqueue(jobRequestA, afterEnqueueCallback);

            function afterEnqueueCallback(err, jobRequest) {
                //at this point jobRequestA is in queue
                queueAdapter.dequeue(function (reservedJobA, commitJobA, rollbackJobA) {
                    //at this point, no item on queue and jobRequestA is in reserved state
                    assert.ok(reservedJobA, 'expected an item to be reserved from queue');
                    assert.equal(reservedJobA.ref, 'a');

                    rollbackJobA(function () {
                        //item rollbacked to queue

                        //if we dequeue at this point, we should get jobRequestA again
                        queueAdapter.dequeue(function (reservedJobA2, commitJobA2, rollbackJobA2) {
                            assert.ok(reservedJobA2, 'expected an item to be reserved from queue');
                            assert.equal(reservedJobA2.ref, 'a');
                            done();
                        });
                    });
                });
            }
        });
        it('ensure support for two no-committed dequeue', function (done) {
            //TODO: holy callbacks, batman.  Switch this to promises.
            //Update: i tried out promises.  And it worked better, but it does have an odd play with
            //how to handle the callbacks on commit() and rollback() that would need to be overcome
            //would need to decide between explicitly switching to promises or using bluebird.promisfy

            var queueAdapter = new QueueAdapter();

            var jobRequestA = createSampleJobRequest('a');
            queueAdapter.enqueue(jobRequestA, function () {
                var jobRequestB = createSampleJobRequest('b');
                queueAdapter.enqueue(jobRequestB, function () {
                    var jobRequestC = createSampleJobRequest('c');
                    queueAdapter.enqueue(jobRequestC, function () {

                        //at this point there should be three items in the queue

                        queueAdapter.dequeue(function (reservedJobA, commitJobA, rollbackJobA) {
                            //expected state: jobA reserved, jobB and jobC on queue
                            assert.ok(reservedJobA, 'expected an item to be reserved from queue');
                            assert.equal(reservedJobA.ref, 'a');

                            queueAdapter.dequeue(function (reservedJobB, commitJobB, rollbackJobB) {
                                //expected state: jobA and jobB reserved, jobC on queue
                                assert.ok(reservedJobB, 'expected an item to be reserved from queue');
                                assert.equal(reservedJobB.ref, 'b');

                                queueAdapter.dequeue(function (reservedJobC, commitJobC, rollbackJobC) {
                                    //expected state: jobA, jobB, and jobC reserved
                                    assert.ok(reservedJobC, 'expected an item to be reserved from queue');
                                    assert.equal(reservedJobC.ref, 'c');

                                    rollbackJobB(function () {
                                        //job B rollbacked to queue
                                        //expected state: jobA and jobC reserved, jobB on queue

                                        //if we dequeue at this point, we should get jobB again
                                        queueAdapter.dequeue(function (reservedJobB2, commitJobB2, rollbackJobB2) {
                                            assert.ok(reservedJobB2, 'expected an item to be reserved from queue');
                                            assert.equal(reservedJobB2.ref, 'b');
                                            done();
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });

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