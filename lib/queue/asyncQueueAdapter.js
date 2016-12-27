/*jslint node: true */
"use strict";

var Queue = require('./queue');
var _ = require('underscore');
var Utility = require('../Utility');

//TODO: add safe callback function

function QueueAdapter(simulatedLatency) {
    var self = this;

    self.queue = new Queue();

    //note that the simulatedLatency is provided to simulate that network based queues have a simulatedLatency between the time you
    //request the data be added to the time that it actually arrive in queue
    self.simulatedLatency = simulatedLatency;
}

QueueAdapter.prototype.enqueue = function (jobRequest, callback) {
    var self = this;

    setTimeout(function () {
        self.queue.push(jobRequest);
        if (_.isFunction(callback)) {
            callback(Utility.NO_ERROR, jobRequest)
        }
    }, self.simulatedLatency)
};

QueueAdapter.prototype.dequeue = function (callbackToConsumer) {
    var self = this;

    setTimeout(function () {
        var jobRequest = self.queue.pop();

        if (_.isEmpty(jobRequest)) {
            callbackToConsumer();
        } else if (Utility.isExpired(jobRequest)) {
            // this item is expired, so skip on to the next item in queue
            self.dequeue(callbackToConsumer);
        } else if (Utility.isDelayed(jobRequest)) {
            // this item is delayed, so skip on to the next item in queue
            self.dequeue(callbackToConsumer);
        } else {
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

    }, self.simulatedLatency);

};

QueueAdapter.prototype.isEmpty = function () {
    return (this.queue.isEmpty());
};

QueueAdapter.prototype.size = function () {
    return (this.queue.size());
};

module.exports = QueueAdapter;
