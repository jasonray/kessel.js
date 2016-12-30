var _ = require('underscore');
var events = require('events');
var util = require('util');
const uuid = require('uuid/v4');
var LogManager = new require('./logManager');
var Utility = require('./Utility');


function JobManager(context) {
    var self = this;

    if (!(this instanceof JobManager)) {
        return new JobManager();
    }

    events.EventEmitter.call(this);

    self.context = initializeContext(context);
    initializeLogger();
    initializeQueueAdapter();
    registerHandlers();
    self.on('next', self._checkQueueAndProcessNextJob.bind(this));

    function initializeContext(context) {
        if (_.isEmpty(context)) context = {};
        return context;
    }

    function initializeLogger() {
        if (_.isEmpty(self.context.logManager)) {
            self.context.logManager = new LogManager();
        }
        self.logger = self.context.logManager.getLogger('kessel-manager');
    }

    function registerHandlers() {
        //TODO: handlers need to come from config [https://github.com/jasonray/kessel/issues/18]
        self.logger.trace('registering handlers');
        self._handlers = {};
        registerHandler('add', require('./sample-handlers/addition-handler'));
        registerHandler('addition', require('./sample-handlers/addition-handler'));
        registerHandler('multiplication', require('./sample-handlers/multiplication-handler'));
        self.logger.trace('registered handlers, count=', Object.keys(self._handlers).length);

        function registerHandler(key, handler) {
            self.logger.trace('registering handler [key=' + key + ']');
            self._handlers[key] = handler;
        }
    }

    function initializeQueueAdapter() {
        self.logger.debug('initiating job manager');
        self.logger.trace('determining which queue adapter to use');
        if (self.context.queue) {
            self.logger.trace('using queue adapter specified by context');
            self.queue = self.context.queue;
        } else {
            self.logger.trace('using default queue adapter');
            var Queue = require('./queue/asyncQueueAdapter');
            self.queue = new Queue();
        }
    }

}
util.inherits(JobManager, events.EventEmitter);

JobManager.prototype.connect = function (callback) {
    var self = this;
    self.logger.debug('connecting..');
    //TODO: hmm, shouldn't this fail with current implementation.  I think AsyncQueueAdapter needs to support init
    self.queue.initialize(function (err) {
        if (err) {
            self.logger.warn('failed to connect', err);
        } else {
            self.logger.debug('connected');
        }
        callback(err);
    });
};

JobManager.prototype.request = function (jobRequest, callback) {
    var self = this;

    validateJobRequest(jobRequest);
    self.logger.debug('enqueue jobRequest ' + jobRequest.id);
    self.queue.enqueue(jobRequest, function (err, enqueuedJobRequest) {
        if (_.isFunction(callback))
            callback(err);
    });

    function validateJobRequest(jobRequest) {
        jobRequest.id = uuid();
        //TODO: ensure there is a type
        return jobRequest;
    }
};

JobManager.prototype.start = function () {
    var self = this;

    self.logger.debug("starting manager");

    self.connect(function (err) {
        if (err) {
            self.logger.warn('failed to start queue');
        } else {
            self.logger.debug("started manager");
            self.emit('next');
        }
    });
};

JobManager.prototype._checkQueueAndProcessNextJob = function () {
    var self = this;

    //TODO: handle stopping request
    self.logger.debug("popping queue");

    //TODO: change queue to perform callback rather than return
    var jobRequest = self.queue.dequeue(dequeueCallback);

    function dequeueCallback(jobRequest, commit, rollback) {
        if (_.isEmpty(jobRequest)) {
            self.logger.debug('no items on queue');
            self._waitThenNext();
        } else {
            self.logger.debug('received item from queue', jobRequest);
            //TODO: there may be edge cases to handle here

            self.logger.info('processing jobRequest:' + jobRequest.id);

            var result = self.processSingleJob(jobRequest);
            self.logger.trace('processed jobRequest:' + jobRequest.id + '; result:' + result);

            //check return type (success, transient, fatal)
            //either delete or requeue
            if (Utility.isSuccess(result)) {
                self.logger.trace('successfully processed message');
                commit(function (err) {
                    if (err) {
                        self.logger.warn('failed to commit job');
                    } else {
                        self.logger.trace('successfully committed job');
                    }
                    self.emit('next');
                });
            } else if (Utility.isFatal(result)) {
                //TODO: consider this to be bury?
                self.logger.trace('result is fatal, deleting message from queue');
                commit(function (err) {
                    if (err) {
                        self.logger.warn('failed to commit job');
                    } else {
                        self.logger.trace('successfully committed job off queue');
                    }
                    self.emit('next');
                });
            } else if (Utility.isTransient(result)) {
                self.logger.trace('result is transient, rolling message back to queue');
                rollback(function (err) {
                    if (err) {
                        self.logger.warn('failed to rollback job');
                    } else {
                        self.logger.trace('successfully rolled back job to queue');
                    }
                    self.emit('next');
                });
            } else {
                self.logger.warn('unexpected result: ', result);
                self.emit('next');
            }

        }
    };
};

JobManager.prototype._waitThenNext = function () {
    var self = this;

    //TODO: move this to queue adapter.  This is not a job manager responsibility as it will vary by queue
    self.logger.trace('wait, then emit next to move on to next item in queue');
    setTimeout(function () {
        self.emit('next');
    }, 1);
};

JobManager.prototype.processSingleJob = function (jobRequest) {
    var self = this;

    //find handler
    //TODO: validation that jobRequest has type [https://github.com/jasonray/kessel/issues/19]
    self.logger.trace('type: ', jobRequest.type);
    var handler = self._handlers[jobRequest.type];
    self.logger.trace('handler: ', handler);

    //TODO: validation that handler exists
    if (!handler) {
        self.logger.warn('no handler for type: ' + jobRequest.type);
        return Utility.buildFatalResult('no handler for type: ' + jobRequest.type);
    }

    //handle
    var result = handler.handle(jobRequest.payload);

    self.logger.trace('raw result = ', result);

    //TODO: this is kinda of a hack until i standardize the handlers
    //I want to return a structure along with a status
    if (resultIsValue(result)) {
        result = Utility.buildSuccessResultFromValue(result);
    }

    if (_.isFunction(jobRequest.callback)) {
        jobRequest.callback(Utility.NO_ERROR, result);
    }

    self.logger.trace('status result = ', result);
    return result;

    function resultIsValue(result) {
        if (!Utility.isTransient(result) && !Utility.isFatal(result) && !Utility.isSuccess())
            return true;
        else
            return false;
    }

};

JobManager.prototype.pause = function () {

};

module.exports = JobManager;


