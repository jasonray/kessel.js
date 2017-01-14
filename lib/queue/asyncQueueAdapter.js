/*jslint node: true */
"use strict";

const Queue = require('./queue');
const _ = require('underscore');
const Utility = require('../Utility');

class QueueAdapter {
    constructor(simulatedLatency) {
        const self = this;

        if (!(this instanceof QueueAdapter)) {
            return new QueueAdapter();
        }

        self.queue = new Queue();

        //note that the simulatedLatency is provided to simulate that network based queues have a simulatedLatency between the time you
        //request the data be added to the time that it actually arrive in queue
        self.simulatedLatency = simulatedLatency;
    }

    initialize(callback) {
        const self = this;
        setTimeout(function () {
            self.state = "connected";
            callback();
        }, self.simulatedLatency);
    }

    _isConnected() {
        const self = this;
        return (self.state == "connected");
    }

    enqueue(jobRequest, callback) {
        const self = this;

        setTimeout(function () {
            if (!self._isConnected()) {
                return callback("Not connected.  Be sure to initialize queue adapter prior to using");
            }

            self.queue.push(jobRequest, jobRequest.priority);
            if (_.isFunction(callback)) {
                callback(Utility.NO_ERROR, jobRequest)
            }
        }, self.simulatedLatency)
    };

    dequeue(callbackToConsumer) {
        const self = this;

        setTimeout(function () {
            const jobRequest = self.queue.pop();

            if (!self._isConnected()) {
                return callbackToConsumer("Not connected.  Be sure to initialize queue adapter prior to using");
            }

            if (_.isEmpty(jobRequest)) {
                callbackToConsumer();
            } else if (Utility.isExpired(jobRequest)) {
                // this item is expired, so skip on to the next item in queue
                self.dequeue(callbackToConsumer);
            } else if (Utility.isDelayed(jobRequest)) {
                // this item is delayed, we will do the following:
                // return the next item to dequeue to the consumer
                // rollback this delay items
                self.dequeue(callbackToConsumer);
                self._rollbackCallback(jobRequest).bind(self)();
            } else {
                callbackToConsumer(Utility.NO_ERROR, jobRequest, self._commitCallback(jobRequest).bind(self), self._rollbackCallback(jobRequest).bind(self));
            }
        }, self.simulatedLatency);
    };

    _commitCallback(jobRequest) {
        //this method creates a commitCallback which will be used by queue consumer to request commit
        return function (commitComplete) {
            Utility.safeCallback(commitComplete);
        };
    }

    _rollbackCallback(jobRequest) {
        const self = this;

        //this method creates a rollbackCallback which will be used by queue consumer to request rollback
        return function (rollbackComplete) {
            self.enqueue(jobRequest);
            Utility.safeCallback(rollbackComplete);
        };
    }

    isEmpty() {
        return (this.queue.isEmpty());
    }

    size() {
        return (this.queue.size());
    }
}

module.exports = QueueAdapter;
