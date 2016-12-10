/*jslint node: true */
"use strict";

var mocha = require('mocha');
var assert = require('assert');
var Queue = require('../lib/queue');

describe('basic queue', function () {
    it('initial size is 0', function () {
        var queueAdapter = new QueueAdapter();
        assert.equal(queueAdapter.size(), 0);
    });
});


exports.isEmpty = function (test) {
    var queue = new Queue();
    test.equals(true, queue.isEmpty());
    test.done();
};

exports.isNotEmpty = function (test) {
    var queue = new Queue();
    queue.push('apple');
    test.equals(false, queue.isEmpty());
    test.done();
};

exports.peekEmptyQueue = function (test) {
    var queue = new Queue();
    test.equals(null, queue.peek());
    test.done();
};

exports.peekNonEmptyQueue = function (test) {
    var queue = new Queue();
    queue.push('apple');
    test.equals('apple', queue.peek());
    test.done();
};

exports.peekNonEmptyQueueWithTwoItems = function (test) {
    var queue = new Queue();
    queue.push('apple');
    queue.push('banana');
    test.equals('apple', queue.peek());
    test.done();
};

exports.popEmpty = function (test) {
    var queue = new Queue();
    test.equals(null, queue.pop());
    test.done();
};

exports.overPop = function (test) {
    var queue = new Queue();
    queue.push('apple');
    test.equals('apple', queue.pop());
    test.equals(null, queue.pop());
    test.done();
};

exports.pushPop = function (test) {
    var queue = new Queue();
    queue.push('apple');
    test.equals('apple', queue.pop());
    test.equals(null, queue.pop());
    test.done();
};

exports.pushPop3 = function (test) {
    var queue = new Queue();
    queue.push('apple');
    queue.push('banana');
    queue.push('coconut');
    test.equals('apple', queue.pop());
    test.equals('banana', queue.pop());
    test.equals('coconut', queue.pop());
    test.equals(null, queue.pop());
    test.done();
};

exports.mixPop = function (test) {
    var queue = new Queue();
    queue.push('apple');
    queue.push('banana');
    test.equals('apple', queue.pop());
    test.equals('banana', queue.pop());
    queue.push('coconut');
    test.equals('coconut', queue.pop());
    test.equals(null, queue.pop());
    queue.push('donut');
    test.equals('donut', queue.pop());
    test.equals(null, queue.pop());
    test.done();
};

