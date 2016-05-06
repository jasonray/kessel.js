var Queue = require('../lib/queue');

exports.dual = function(test) {
    var queue1 = new Queue();
    var queue2 = new Queue();
    queue1.push('apple');
    queue2.push('banana');
    test.equals('apple', queue1.pop());
    test.equals(null, queue1.pop());
    test.equals('banana', queue2.pop());
    test.equals(null, queue2.pop());
    test.done();
};
