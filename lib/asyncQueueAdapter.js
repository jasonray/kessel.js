var Queue = require('./queue');
var _ = require('underscore');
const NO_ERROR = null;

function QueueAdapter(latency) {
    //note that the latency is provided to simulate that network based queues have a latency between the time you
    //request the data be added to the time that it actually arrive in queue

    this.queue = new Queue();
    this.latency = latency;
}

QueueAdapter.prototype.enqueue = function (jobRequest, callback) {
    var self = this;
    setTimeout(function () {
        self.queue.push(jobRequest);
        if (_.isFunction(callback)) {
            callback(NO_ERROR, jobRequest)
        }
    }, self.latency)
};

QueueAdapter.prototype.dequeue = function (callback) {
    var self = this;
    setTimeout(function () {
        var jobRequest = self.queue.pop();
        callback(jobRequest);
    }, self.latency);
};

QueueAdapter.prototype.isEmpty = function () {
    return (this.queue.isEmpty());
};

QueueAdapter.prototype.size = function () {
    return (this.queue.size());
};

module.exports = QueueAdapter;
