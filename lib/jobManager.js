var Queue = require('../lib/queue');
var _ = require('underscore');


function JobManager(context) {
    var self = this;

    self.context = ensureContext(context);
    ensureLogManager(self.context);

    self.queue = new Queue();

    self.logger = self.context.logManager.getLogger('kessel-manager');

    self.logger.trace("initiated manager");

    function ensureContext(context) {
        if (_.isEmpty(context)) context = {};
        return context;
    }

    function ensureLogManager(context) {
        if (_.isEmpty(context.logManager)) {
            var LogManager = new require('./logManager');
            context.logManager = new LogManager();
        }
    }
}

JobManager.prototype.request = function (jobRequest) {
    var self = this;

    validateJobRequest(jobRequest);
    self.logger.debug('enqueue jobRequest ' + jobRequest.id);
    self.queue.push(jobRequest);

    function validateJobRequest(jobRequest) {
        jobRequest.id = ++self.i;
        return jobRequest;
    }
};

JobManager.prototype.start = function () {
    this.logger.info("start manager");
    this._processOneJob();
};

JobManager.prototype._processOneJob = function () {
    var self = this;

    self.logger.debug("popping queue");
    var jobRequest = self.queue.pop();

    if (jobRequest) {
        self.logger.info('processing jobRequest ' + jobRequest.id);

        var handler = require('../lib/handlers/add-handler');
        var result = handler.handle(jobRequest.payload);
        console.log('result = ', result);

        if (_.isFunction(jobRequest.callback)) {
            jobRequest.callback(result);
        }
    } else {
        self.logger.trace("no items on queue");
    }
};

JobManager.prototype.pause = function () {

};

module.exports = JobManager;
