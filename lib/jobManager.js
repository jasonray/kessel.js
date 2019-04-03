const _ = require('underscore');
const EventEmitter = require('events').EventEmitter;
const uuid = require('uuid/v4');
const LogManager = new require('./logManager');
const Utility = require('./Utility');
const HandlerRegistry = require('./handlerRegistry');

class JobManager extends EventEmitter {
    constructor(context) {
        super();
        const self = this;

        function initializeLogger() {
            if (_.isEmpty(self.context.logManager)) {
                self.context.logManager = new LogManager();
            }
            self.logger = self.context.logManager.getLogger('kessel-manager');
            self.logger.trace('initialized logger');
        }

        function initializeContext(context) {
            if (_.isEmpty(context)) context = {};
            return context;
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
        }

        if (!(this instanceof JobManager)) {
            return new JobManager();
        }

        self.context = initializeContext(context);
        initializeLogger();
        self.queue = self._determineQueueAdapter();
        registerHandlers();
        self.on('next', self._checkQueueAndProcessNextJob.bind(this));
    }

    initialize(callback) {
        const self = this;

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
        const self = this;
        return this._initialized;
    }

    _determineQueueAdapter() {
        const self = this;
        self.logger.trace('determining which queue adapter to use');
        if (self.context.queue) {
            self.logger.trace('using queue adapter specified by context');
            return self.context.queue;
        } else {
            self.logger.trace('using default queue adapter');
            const Queue = require('./queue/asyncQueueAdapter');
            return new Queue();
        }
    }

    request(jobRequest, callback) {
        const self = this;

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
        });
    }

    start() {
        const self = this;

        self.logger.debug('starting job manager');

        self.initialize(function (err) {
            if (err) {
                self.logger.warn('failed to start queue');
            } else {
                self.logger.debug('started job manager');
                self.emit('next');
            }
        });
    }

    _checkQueueAndProcessNextJob() {
        const self = this;

        function dequeueCallback(err, jobRequest, commit, rollback) {
            if (_.isEmpty(jobRequest)) {
                self.logger.debug('no items on queue');
                self._waitThenNext();
            } else if (err) {
                self.logger.warn('failed to dequeue', err);
                //TODO: this may be good time to abort / restart
                self._waitThenNext();
            } else {
                self.logger.debug('received item from queue', jobRequest);
                //TODO: there may be edge cases to handle here

                self.logger.info('processing jobRequest:' + jobRequest.id);

                const result = self.processSingleJob(jobRequest);
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

        //TODO: handle stopping request
        self.logger.trace('checking queue for next job');

        //TODO: change queue to perform callback rather than return
        const jobRequest = self.queue.dequeue(dequeueCallback);
    }

    _waitThenNext() {
        const self = this;

        //TODO: move this to queue adapter.  This is not a job manager responsibility as it will vary by queue
        self.logger.trace('wait, then emit next to move on to next item in queue');
        setTimeout(function () {
            self.emit('next');
        }, 1);
    }

    processSingleJob(jobRequest) {
        const self = this;

        //find handler
        //TODO: validation that jobRequest has type [https://github.com/jasonray/kessel/issues/19]
        self.logger.trace('type: ', jobRequest.type);
        const handler = self._registry.getHandler(jobRequest.type);
        self.logger.trace('handler: ', handler);

        //TODO: validation that handler exists
        if (!handler) {
            self.logger.warn('no handler for type: ' + jobRequest.type);
            return Utility.buildFatalResult('no handler for type: ' + jobRequest.type);
        }

        //handle
        let result = handler(jobRequest.payload);

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


