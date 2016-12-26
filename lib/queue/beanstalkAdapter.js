var fivebeansClient = require('fivebeans').client;
var _ = require('underscore');
var LogManager = require('../logManager');

//TODO: these belongs with the other error checks and constants
const NO_ERROR = null;


var events = require('events');
var util = require('util');

function BeanstalkAdapter(config) {
    var self = this;

    //TODO: encapsulate this config init
    if (!config) config = {};
    if (!config.beanstalk) config.beanstalk = {};
    if (!config.beanstalk.host) config.beanstalk.host = '127.0.0.1';
    if (!config.beanstalk.port) config.beanstalk.port = '3000';
    if (!config.beanstalk.timeout) config.beanstalk.timeout = '0';

    var logManager = new LogManager();
    self.logger = logManager.getLogger('beanstalk-adapter');

    //TODO: should these be root level or a config bucket?
    self.host = config.beanstalk.host;
    self.port = config.beanstalk.port;
    self.timeout = config.beanstalk.timeout;

    //TODO: support other tubes
}
util.inherits(BeanstalkAdapter, events.EventEmitter);


BeanstalkAdapter.prototype.initialize = function (callback) {
    //callback(err)

    var self = this;

    self.logger.trace('initialize adapter');

    self.client = new fivebeansClient(self.host, self.port);
    self.logger.debug('connecting to beanstalkd at ' + self.host + ':' + self.port);

    self.client.on('connect', function () {
        self.logger.debug('connected to beanstalkd at ' + self.host + ':' + self.port);
        //TODO: this is where listening to tubes will come into play

        //TODO: add a safe callback method
        if (_.isFunction(callback))
            callback();
    });

    self.client.on('error', function (err) {
        self.logger.warn('error occurred, probably during connection', err);
        if (_.isFunction(callback))
            callback(err);
    });

    self.client.on('close', self._onClose.bind(self));

    self.client.connect();
};


BeanstalkAdapter.prototype._onClose = function () {
    var self = this;
    self.logger.debug('client disconnected');
};

BeanstalkAdapter.prototype.enqueue = function (jobRequest, callback) {
    var self = this;

    self.logger.debug('about to enqueue job request');
    var serializedJobRequest = serialize(jobRequest);
    self.client.put(0, 0, 60, serializedJobRequest, function (err, jobid) {
        self.logger.debug('enqueued job ', jobid);
        callback(NO_ERROR, jobRequest);
    });
};

function serialize(jobRequest) {
    return JSON.stringify(jobRequest);
}
function deserialize(buffer) {
    return JSON.parse(buffer);
}

BeanstalkAdapter.prototype.dequeue = function (callbackToConsumer) {
    var self = this;

    //TODO: check that we are connected before dequeue

    self.logger.debug('about to begin reserve_with_timeout ', self.timeout);
    self.client.reserve_with_timeout(self.timeout, function (err, jobID, payload) {
            if (isTimeout(err)) {
                self.logger.debug('no items on queue');
                callbackToConsumer();
            }
            else if (isTimeout(err)) {
                self.logger.error('error occurred while dq');
                self.logger.error(err);
                callbackToConsumer(err);
            } else {
                self.logger.info('reserved item: ', jobID);
                var deserializedJob = deserialize(payload);
                callbackToConsumer(deserializedJob, commitCallback, rollbackCallback);

                function commitCallback(commitComplete) {
                    self.logger.debug('commit requested on ' + jobID);

                    self.client.destroy(jobID, function (err) {
                        //TODO: check for error
                        self.logger.debug('commit complete on ' + jobID);
                        if (_.isFunction(commitComplete)) {
                            commitComplete();
                        }
                    });
                }

                function rollbackCallback(rollbackComplete) {
                    self.logger.debug('rollback requested on ' + jobID);

                    //TODO: determine how to handle priority
                    const priority = 100;
                    const delay = 0;
                    self.client.release(jobID, priority, delay, function (err) {
                        //TODO: check for error
                        self.logger.debug('rollback complete on ' + jobID);
                        if (_.isFunction(rollbackComplete)) {
                            rollbackComplete();
                        }
                    });
                }
            }
        }
    );

    //TODO: where should these checks exists?
    function isTimeout(err) {
        return (err == 'TIMED_OUT');
    }

    //TODO: where should these checks exists?
    function isError(err) {
        return !_.isEmpty(err);
    }
};

BeanstalkAdapter.prototype.truncate = function (callbackToConsumer) {
    //TODO: this is good enough, but requires big function stack.  Change to loop

    var self = this;
    self.logger.warn('preparing to delete all items from tube');
    deleteItems(callbackToConsumer);

    function deleteItems(callback) {
        self.logger.trace('peeking');
        self.client.peek_ready(function (err, jobId) {
            if (isNoItem(err)) {
                callback();
            } else if (isError(err)) {
                self.logger.warn('error occurred while peek', err);
                callback(err);
            }
            else if (jobId) {
                self.logger.trace('peeked and found ' + jobId);
                self.client.destroy(jobId, function (err) {
                    if (err) {
                        self.logger.warn('error occurred while delete', err);
                        callbackToConsumer(err);
                    }
                    self.logger.trace('deleted ', jobId);
                    deleteItems(function (err) {
                        self.logger.trace('unwind');
                        callback(err);
                    });
                });
            }
            else {
                callback();
            }
        });
    }

    //TODO: where should these checks exists?
    function isNoItem(err) {
        return (err == 'NOT_FOUND');
    }

    //TODO: where should these checks exists?
    function isError(err) {
        return !_.isEmpty(err);
    }
};

module.exports = BeanstalkAdapter;
