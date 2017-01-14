const Queue = require('./queue');

function QueueAdapter() {
    this._queue = new Queue();
}

QueueAdapter.prototype.enqueue = function (jobRequest) {
    this._queue.push(jobRequest);
};

QueueAdapter.prototype.dequeue = function (callback) {
    var jobRequest = this._queue.pop();
    callback(jobRequest);
};

QueueAdapter.prototype.isEmpty = function () {
    return (this._queue.isEmpty());
};

QueueAdapter.prototype.size = function () {
    return (this._queue.size());
};

module.exports = QueueAdapter;
