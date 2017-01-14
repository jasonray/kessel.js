const Queue = require('./queue');

class QueueAdapter {
    constructor() {
        this._queue = new Queue();
    }

    enqueue(jobRequest) {
        this._queue.push(jobRequest);
    }

    dequeue(callback) {
        const jobRequest = this._queue.pop();
        callback(jobRequest);
    }

    isEmpty() {
        return (this._queue.isEmpty());
    }

    size() {
        return (this._queue.size());
    }
}

module.exports = QueueAdapter;
