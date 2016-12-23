var Queue = require('./../queue');

function QueueAdapter() {
    this.queue = new Queue();
}

QueueAdapter.prototype.enqueue = function (jobRequest) {
    this.queue.push(jobRequest);
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
