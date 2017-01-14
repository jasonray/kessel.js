const Queue = require('./queue');

class QueueAdapter {
    constructor() {
        this._queue = new Queue();
    }
}

QueueAdapter.prototype.enqueue = function (jobRequest) {
    this._queue.push(jobRequest);
};

QueueAdapter.prototype.dequeue = function (callback) {
    const jobRequest = this._queue.pop();
    callback(jobRequest);
};

QueueAdapter.prototype.isEmpty = function () {
    return (this._queue.isEmpty());
};

QueueAdapter.prototype.size = function () {
    return (this._queue.size());
};

module.exports = QueueAdapter;
