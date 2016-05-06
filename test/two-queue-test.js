var queueModule = require('../lib/queue');

exports.dual = function(test) {
	var queue1 = new queueModule.queue();
	var queue2 = new queueModule.queue();
	queue1.push('apple');
	queue2.push('banana');
	test.equals('apple', queue1.pop());
	test.equals(null, queue1.pop());
	test.equals('banana', queue2.pop());
	test.equals(null, queue2.pop());
	test.done();
};
