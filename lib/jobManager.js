var _ = require('underscore');
var events = require('events');
var util = require('util');
const uuid = require('uuid/v4');

function JobManager(context) {
    var self = this;

    if (!(this instanceof JobManager)) {
        return new JobManager();
    }

    events.EventEmitter.call(this);

    self.context = ensureContext(context);
    ensureLogManager(self.context);

    self.logger = self.context.logManager.getLogger('kessel-manager');
    self.on('next', self._checkQueueAndProcessNextJob.bind(this));

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

    registerHandlers();

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

    function registerHandlers() {
        //TODO: handlers need to come from config [https://github.com/jasonray/kessel/issues/18]
        self.logger.trace('registering handlers');
        self._handlers = {};
        registerHandler('add', require('./sample-handlers/addition-handler'));
        registerHandler('addition', require('./sample-handlers/addition-handler'));
        registerHandler('multiplication', require('./sample-handlers/multiplication-handler'));
        self.logger.trace('registered handlers, count=', Object.keys(self._handlers).length);
    }

    function registerHandler(key, handler) {
        self._handlers[key] = handler;
    }
}
util.inherits(JobManager, events.EventEmitter);

JobManager.prototype.connect = function (callback) {
    var self = this;
    self.logger.debug('connecting..');
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
            if (isSuccess(result)) {
                self.logger.trace('successfully processed message');
                commit(function (err) {
                    if (err) {
                        self.logger.warn('failed to commit job');
                    } else {
                        self.logger.trace('successfully committed job');
                    }
                    self.emit('next');
                });
            } else if (isFatal(result)) {
                //TODO: consider this to be bury?
                self.logger.trace('result is fatal, deleting message from queue');
                commit(function (err) {
                    if (err) {
                        self.logger.warn('failed to commit job');
                    } else {
                        self.logger.trace('successfully committed job');
                    }
                    self.emit('next');
                });
            } else if (isTransient(result)) {
                self.logger.trace('result is transient, rolling message back to queue');
                rollback(function (err) {
                    if (err) {
                        self.logger.warn('failed to rollback job');
                    } else {
                        self.logger.trace('successfully rolled back job');
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
        return buildFatalResult('no handler for type: ' + jobRequest.type);
    }

    //handle
    var result = handler.handle(jobRequest.payload);

    self.logger.trace('raw result = ', result);
    if (_.isFunction(jobRequest.callback)) {
        jobRequest.callback(result);
    }

    //TODO: this is kinda of a hack until i standardize the handlers
    //I want to return a structure along with a status
    if (resultIsValue(result)) {
        result = buildSuccessResultFromValue(result);
    }

    self.logger.trace('status result = ', result);
    return result;
};

JobManager.prototype.pause = function () {

};

module.exports = JobManager;

//TODO: find better home for these methods
function resultIsValue(result) {
    if (!isTransient(result) && !isFatal(result) && !isSuccess())
        return true;
    else
        return false;
}

function isTransient(result) {
    if (!result) return false;
    if (result == 'transient') return true;
    if (result.status == 'transient')return true;
    return false;
}

function isFatal(result) {
    if (!result) return false;
    if (result == 'fatal') return true;
    if (result.status == 'fatal')return true;
    return false;
}

function isSuccess(result) {
    if (!result) return false;
    if (result == 'success') return true;
    if (result.status == 'success')return true;
    return false;
}

function buildTransientResult(message, envelope) {
    return buildResult("transient", message, envelope);
}

function buildFatalResult(message, envelope) {
    return buildResult("fatal", message, envelope);
}

function buildSuccessResult(message, envelope) {
    return buildResult("success", message, envelope);
}

function buildResult(status, message, envelope) {
    if (!envelope) envelope = {};
    if (message) envelope.message = message;
    envelope.status = status;
    return envelope;
}

function buildSuccessResultFromValue(value) {
    var envelope = {value: value};
    return buildResult("success", null, envelope);
}