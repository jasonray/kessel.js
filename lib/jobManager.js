var Queue = require('../lib/queue');
var _ = require('underscore');
var events = require('events');
var util = require('util');

function JobManager(context) {
    var self = this;

    events.EventEmitter.call(this);

    self.context = ensureContext(context);
    ensureLogManager(self.context);

    self.queue = new Queue();

    self.logger = self.context.logManager.getLogger('kessel-manager');
    self.on('next', self._checkQueueAndProcessNextJob.bind(this));

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
util.inherits(JobManager, events.EventEmitter);


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
    var self = this;
    self.logger.info("start manager");
    self.emit('next');
};

JobManager.prototype._checkQueueAndProcessNextJob = function () {
    var self = this;

    //TOOD: handle stopping request
    self.logger.debug("popping queue");

    //TODO: change queue to perform callback rather than return
    var jobRequest = self.queue.pop();

    if (_.isEmpty(jobRequest)) {
        self.logger.debug('no items on queue');
        self._waitThenNext();
    } else {
        self.logger.debug('received item from queue', jobRequest);
        //TODO: there may be edge cases to handle here
        self._handleJob(jobRequest);
    }
}

JobManager.prototype._waitThenNext = function () {
    var self = this;

    //TODO: move this to queue adapter.  This is not a job manager responsibility as it will vary by queue
    self.logger.trace('wait then emit next to move on to next item in queue');
    setTimeout(function () {
        self.emit('next');
    }, 1000);
}

JobManager.prototype._handleJob = function (jobRequest) {
    var self = this;

    self.logger.info('processing jobRequest ' + jobRequest.id);

    var result = self.processSingleJob(jobRequest)
    //check return type (success, transient, fatal)
    //either delete or requeue

    //move on to next
    self.emit('next');
}

JobManager.prototype.processSingleJob = function (jobRequest) {
    //find handler
    var handler = require('./sample-handlers/addition-handler');

    //handle
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
