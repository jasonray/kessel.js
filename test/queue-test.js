var queueModule = require('../lib/queue');

exports.isEmpty = function(test) {
	var queue = new queueModule.queue();
	test.equals(true, queue.isEmpty());
	test.done();
};
