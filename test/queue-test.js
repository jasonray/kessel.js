var queueModule = require('../lib/queue');

exports.isEmpty = function(test) {
	var queue = new queueModule.queue();
	test.equals(true, queue.isEmpty());
	test.done();
};

exports.isNotEmpty = function(test) {
	var queue = new queueModule.queue();
	queue.push('apple');
	test.equals(false, queue.isEmpty());
	test.done();
};

exports.peekEmptyQueue = function(test) {
	var queue = new queueModule.queue();
	test.equals(null, queue.peek());
	test.done();
};

exports.peekNonEmptyQueue = function(test) {
	var queue = new queueModule.queue();
	queue.push('apple');
	test.equals('apple', queue.peek());
	test.done();
};

exports.peekNonEmptyQueueWithTwoItems = function(test) {
	var queue = new queueModule.queue();
	queue.push('apple');
	queue.push('banana');
	test.equals('apple', queue.peek());
	test.done();
};

exports.popEmpty = function(test) {
	var queue = new queueModule.queue();
	test.equals(null, queue.pop());
	test.done();
};

exports.overPop = function(test) {
	var queue = new queueModule.queue();
	queue.push('apple');
	test.equals('apple', queue.pop());
	test.equals(null, queue.pop());
	test.done();
};

exports.pushPop = function(test) {
	var queue = new queueModule.queue();
	queue.push('apple');
	test.equals('apple', queue.pop());
	test.equals(null, queue.pop());
	test.done();
};

exports.pushPop3 = function(test) {
	var queue = new queueModule.queue();
	queue.push('apple');
	queue.push('banana');
	queue.push('coconut');
	test.equals('apple', queue.pop());
	test.equals('banana', queue.pop());
	test.equals('coconut', queue.pop());
	test.equals(null, queue.pop());
	test.done();
};