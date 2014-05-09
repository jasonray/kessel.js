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