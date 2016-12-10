/*jslint node: true */
"use strict";

var mocha = require('mocha');
var assert = require('assert');
var Queue = require('../lib/queue');

describe('basic queue', function () {
    describe('isEmpty', function () {
        it('isEmpty on empty queue returns true', function () {
            var queue = new Queue();
            assert.equal(queue.isEmpty(), true);
        });

        it('isEmpty on a non-empty queue returns false', function () {
            var queue = new Queue();
            queue.push('apple');
            assert.equal(queue.isEmpty(), false);
        });

        it('isEmpty after push / pop returns true', function () {
            var queue = new Queue();
            queue.push('apple');
            assert.equal(queue.isEmpty(), false);
        });
    });

    describe('peek', function () {
        it('peek empty queue returns null', function () {
            var queue = new Queue();
            assert.equal(queue.peek(), null);
        });

        it('peek non-empty queue returns first items', function () {
            var queue = new Queue();
            queue.push('apple');
            assert.equal(queue.peek(), 'apple');
        });
        it('peekNonEmptyQueueWithTwoItems', function () {
            var queue = new Queue();
            queue.push('apple');
            queue.push('banana');
            assert.equal(queue.peek(), 'apple');
        });
    });

    describe('pop', function () {
        it('popEmpty', function () {
            var queue = new Queue();
            assert.equal(queue.pop(), null);
        });

        it('pushPop', function () {
            var queue = new Queue();
            queue.push('apple');
            assert.equal('apple', queue.pop());
        });

        it('overPop', function () {
            var queue = new Queue();
            queue.push('apple');
            queue.pop();
            assert.equal(queue.pop(), null);
        });

        it('pushPop3', function () {
            var queue = new Queue();
            queue.push('apple');
            queue.push('banana');
            queue.push('coconut');
            assert.equal(queue.pop(), 'apple');
            assert.equal(queue.pop(), 'banana');
            assert.equal(queue.pop(), 'coconut');
            assert.equal(queue.pop(), null);
        });

        it('mixPop', function () {
            var queue = new Queue();
            queue.push('apple');
            queue.push('banana');
            assert.equal(queue.pop(), 'apple');
            queue.push('coconut');
            assert.equal(queue.pop(), 'banana');
            assert.equal(queue.pop(), 'coconut');
            assert.equal(queue.pop(), null);
            queue.push('donut');
            assert.equal(queue.pop(), 'donut');
            assert.equal(queue.pop(), null);
        });
    });

    describe('dual queue', function () {
        it('show that two queues are independent', function () {
            var queue1 = new Queue();
            var queue2 = new Queue();
            queue1.push('apple');
            queue2.push('banana');
            assert.equal('apple', queue1.pop());
            assert.equal(null, queue1.pop());
            assert.equal('banana', queue2.pop());
            assert.equal(null, queue2.pop());
        });
    });
});
