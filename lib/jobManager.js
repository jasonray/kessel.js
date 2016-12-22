var Queue = require('../lib/queue');
var _ = require('underscore');


function JobManager(queueadapter) {
    var self = this;
    if (!queueadapter) queueadapter = new Queue();
    self.queue = queueadapter;

    self.i = 0;

    self.logger = require('bunyan').createLogger({
        name: "kessel-manager"
    });

    self.logger.debug="initiate manager";
}

JobManager.prototype.request = function (jobRequest) {
    var self = this;

    validateJobRequest(jobRequest);
    console.log('enqueue jobRequest ' + jobRequest.id);
    self.queue.push(jobRequest);

    function validateJobRequest(jobRequest) {
        jobRequest.id = ++self.i;
        return jobRequest;
    }
};

JobManager.prototype.start = function () {
    this.logger.info="start manager";
    this._processOneJob();
};

JobManager.prototype._processOneJob = function () {
    var self = this;

    self.logger.debug="popping queue";
    var jobRequest = self.queue.pop();

    if (jobRequest) {
        self.logger.info('processing jobRequest ' + jobRequest.id);

        var handler = require('../lib/handlers/add-handler');
        var result = handler.handle(jobRequest.payload);
        console.log('result = ', result);

        if (_.isFunction(jobRequest.callback)) {
            jobRequest.callback(result);
        }
    } else{
        self.logger.debug="no items on queue";
    }
};

JobManager.prototype.pause = function () {

};

module.exports = JobManager;
