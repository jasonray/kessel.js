var Queue = require('./queue');
var _ = require('underscore');

function QueueAdapter() {
    this.queue = new Queue();
}

QueueAdapter.prototype.enqueue = function (jobRequest, callback) {
    this.queue.push(jobRequest);
    if (   _.isFunction(callback) ) {
        
    }
};

QueueAdapter.prototype.dequeue = function (callback) {
    var jobRequest = this.queue.pop();
    callback(jobRequest);
};

QueueAdapter.prototype.isEmpty = function () {
    return (this.queue.isEmpty());
};

QueueAdapter.prototype.size = function () {
    return (this.queue.size());
};

module.exports = QueueAdapter;
