/*jslint node: true */
"use strict";

var Queue = require('./queue');
var _ = require('underscore');
const NO_ERROR = null;

//TODO: add safe callback function

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
            callbackToConsumer();
        } else {
            if (isExpired(jobRequest)) {
                return self.dequeue(callbackToConsumer);
            }

            if (isDelayed(jobRequest)) {
                return self.dequeue(callbackToConsumer);
            }

            var commitCallback = function (commitComplete) {
                if (_.isFunction(commitComplete)) {
                    commitComplete();
                }
            };
            var rollbackCallback = function (rollbackComplete) {
                self.enqueue(jobRequest);
                if (_.isFunction(rollbackComplete)) {
                    rollbackComplete();
                }
            };

            callbackToConsumer(jobRequest, commitCallback, rollbackCallback);
        }
    }, self.latency);

    //TODO: odd spot for this and it is redundant with beanstalk adapter
    function isExpired(jobRequest) {
        if (jobRequest.expiration) {
            if (jobRequest.expiration < new Date()) {
                return true;
            }
        }
        return false;
    }

    function isDelayed(jobRequest) {
        if (jobRequest.delay) {
            if (jobRequest.delay > new Date()) {
                return true;
            }
        }
        return false;
    }
};

QueueAdapter.prototype.isEmpty = function () {
    return (this.queue.isEmpty());
};

QueueAdapter.prototype.size = function () {
    return (this.queue.size());
};

module.exports = QueueAdapter;
