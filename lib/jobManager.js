var Queue = require('../lib/queue');
var _ = require('underscore');

function JobManager(queueadapter) {
    if (!queueadapter) queueadapter = new Queue();
    this.queue = queueadapter;

    this.i = 0;
}

JobManager.prototype.request = function (jobRequest) {
    var self = this;

    validateJobRequest(jobRequest);
    console.log('enqueue jobRequest ' + jobRequest.id);
    this.queue.push(jobRequest);

    function validateJobRequest(jobRequest) {
        jobRequest.id = ++self.i;
        return jobRequest;
    }
};

JobManager.prototype.start = function () {
    this._processOneJob();
};

JobManager.prototype._processOneJob = function () {
    var jobRequest = this.queue.pop();
    console.log('processing jobRequest ' + jobRequest.id);

    var handler = require('../lib/handlers/add-handler');
    var result = handler.handle(jobRequest.payload);
    console.log('result = ', result);

    if (_.isFunction(jobRequest.callback)) {
        jobRequest.callback(result);
    }
    return result;
}

JobManager.prototype.pause = function () {

};

module.exports = JobManager;
