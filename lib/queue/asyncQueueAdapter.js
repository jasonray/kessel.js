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

QueueAdapter.prototype.dequeue = function (callbackToConsumer) {
    var self = this;
    setTimeout(function () {
        var jobRequest = self.queue.pop();

        if (_.isEmpty(jobRequest)) {
            // console.log('QA.dequeue: queue empty');
            callbackToConsumer();
        } else {
            var commitCallback = function () {
                // console.log('QA.dequeue: commit job request from queue');
            }
            var rollbackCallback = function () {
                // console.log('QA.dequeue: rollback job request to queue');
                self.enqueue(jobRequest);
            }
            // console.log('QA.dequeue: reserved job request');
            // console.log(jobRequest);
            callbackToConsumer(jobRequest, commitCallback, rollbackCallback);
        }
    }, self.latency);
};

QueueAdapter.prototype.isEmpty = function () {
    return (this.queue.isEmpty());
};

QueueAdapter.prototype.size = function () {
    return (this.queue.size());
};

module.exports = QueueAdapter;
