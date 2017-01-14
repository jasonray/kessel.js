const _ = require('underscore');
const events = require('events');
const EventEmitter = events.EventEmitter;
const util = require('util');
const uuid = require('uuid/v4');
const LogManager = new require('./logManager');
const Utility = require('./Utility');
const HandlerRegistry = require('./handlerRegistry');

class JobManager extends EventEmitter {
    constructor(context) {
        super();
        const self = this;

        if (!(this instanceof JobManager)) {
            return new JobManager();
        }

        events.EventEmitter.call(this);

        self.context = initializeContext(context);
        initializeLogger();
        self.queue = self._determineQueueAdapter();
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
            self.logger.trace('initialized logger');
        }

        function registerHandlers(handlersConfig) {
            //TODO: handlers need to come from standardConfig [https://github.com/jasonray/kessel/issues/18]
            self.logger.trace('registering handlers');
            self._registry = new HandlerRegistry();

            // _.each(handlersConfig, function (singleHandlerConfig) {
            //     self.registerHandler(singleHandlerConfig);
            // });

            self._registry.registerHandler('add', require('./sample-handlers/addition-handler'));
            self._registry.registerHandler('addition', require('./sample-handlers/addition-handler'));
            self._registry.registerHandler('multiplication', require('./sample-handlers/multiplication-handler'));
            // self.logger.trace('registered handlers, count=', Object.keys(self._handlers).length);
        }
    }

    registerHandler(type, handler) {
        var self = this;

        if (!isTypeValid(type)) throw new Error('Cannot register handler with invalid type');
        if (_.isEmpty(handler)) throw new Error('Cannot register invalid handler');

        //single type, handler is function
        self.logger.trace('registering handler [type=' + type + ']');
        self._handlers[type] = handler;

        function isTypeValid(value) {
            if (_.isEmpty(type)) return false;
            if (_.isEmpty(type.trim())) return false;
            return true;
        }
    }

    getHandler(type) {
        var self = this;
        return self._handlers[type.trim()];
    }


    initialize(callback) {
        var self = this;

        if (self._isInitialized()) {
            self.logger.trace('already initialized');
            return callback();
        }

        self.logger.debug('initializing job manager, including initializing queue');

        self.queue.initialize(function (err) {
            if (err) {
                self.logger.warn('failed to initialize queue adapter', err);
                self._initialized = false;
            } else {
                self._initialized = true;
                self.logger.debug('initialized queue adapter');
            }
            callback(err);
        });
    }

    _isInitialized() {
        var self = this;
        if (self._initialized) {
            return true;
        } else {
            return false;
        }
    }

    _determineQueueAdapter() {
        var self = this;
        self.logger.trace('determining which queue adapter to use');
        if (self.context.queue) {
            self.logger.trace('using queue adapter specified by context');
            return self.context.queue;
        } else {
            self.logger.trace('using default queue adapter');
            var Queue = require('./queue/asyncQueueAdapter');
            return new Queue();
        }
    }

    request(jobRequest, callback) {
        var self = this;

        self.initialize(function (err) {
            if (err) {
                return callback(err);
            }

            validateJobRequest(jobRequest);
            self.logger.debug('enqueue jobRequest ' + jobRequest.id);
            self.queue.enqueue(jobRequest, function (err, enqueuedJobRequest) {
                self.logger.trace('enqueued jobRequest ' + jobRequest.id);
                if (_.isFunction(callback))
                    callback(err);
            });

            function validateJobRequest(jobRequest) {
                jobRequest.id = uuid();
                //TODO: ensure there is a type
                return jobRequest;
            }
        })
    }

    start() {
        var self = this;

        self.logger.debug("starting job manager");

        self.initialize(function (err) {
            if (err) {
                self.logger.warn('failed to start queue');
            } else {
                self.logger.debug("started job manager");
                self.emit('next');
            }
        })
    }

    _checkQueueAndProcessNextJob() {
        var self = this;

        //TODO: handle stopping request
        self.logger.trace("checking queue for next job");

        //TODO: change queue to perform callback rather than return
        var jobRequest = self.queue.dequeue(dequeueCallback);

        function dequeueCallback(err, jobRequest, commit, rollback) {
            if (_.isEmpty(jobRequest)) {
                self.logger.debug('no items on queue');
                self._waitThenNext();
            }
            else if (err) {
                self.logger.warn('failed to dequeue', err);
                //TODO: this may be good time to abort / restart
                self._waitThenNext();
            }
            else {
                self.logger.debug('received item from queue', jobRequest);
                //TODO: there may be edge cases to handle here

                self.logger.info('processing jobRequest:' + jobRequest.id);

                var result = self.processSingleJob(jobRequest);
                self.logger.trace('processed jobRequest:' + jobRequest.id + '; result:' + result);

                //check return type (success, transient, fatal)
                //either delete or requeue
                if (Utility.isSuccess(result)) {
                    self.logger.trace('successfully processed message:' + jobRequest.id);
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
                    self.logger.trace('result is fatal, deleting message from queue:' + jobRequest.id);
                    commit(function (err) {
                        if (err) {
                            self.logger.warn('failed to commit job');
                        } else {
                            self.logger.trace('successfully committed job off queue');
                        }
                        self.emit('next');
                    });
                } else if (Utility.isTransient(result)) {
                    self.logger.trace('result is transient, rolling message back to queue:' + jobRequest.id);
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
        }
    }

    _waitThenNext() {
        var self = this;

        //TODO: move this to queue adapter.  This is not a job manager responsibility as it will vary by queue
        self.logger.trace('wait, then emit next to move on to next item in queue');
        setTimeout(function () {
            self.emit('next');
        }, 1);
    }

    processSingleJob(jobRequest) {
        var self = this;

        //find handler
        //TODO: validation that jobRequest has type [https://github.com/jasonray/kessel/issues/19]
        self.logger.trace('type: ', jobRequest.type);
        var handler = self._registry.getHandler(jobRequest.type);
        self.logger.trace('handler: ', handler);

        //TODO: validation that handler exists
        if (!handler) {
            self.logger.warn('no handler for type: ' + jobRequest.type);
            return Utility.buildFatalResult('no handler for type: ' + jobRequest.type);
        }

        //handle
        var result = handler(jobRequest.payload);

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
            return (!Utility.isTransient(result) && !Utility.isFatal(result) && !Utility.isSuccess());
        }
    }

    pause() {
    }
}

module.exports = JobManager;


