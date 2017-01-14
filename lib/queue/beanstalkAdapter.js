/*jslint node: true */
"use strict";

var fivebeansClient = require('fivebeans').client;
var _ = require('underscore');
var LogManager = require('../logManager');
var moment = require('moment');
var Utility = require('../Utility');

var events = require('events');
var util = require('util');

class BeanstalkAdapter {
    constructor(specifiedConfig) {
        var self = this;

        var config = getConfig(specifiedConfig);

        var logManager = new LogManager();
        self.logger = logManager.getLogger('beanstalk-adapter');

        //TODO: I will drop this later
        console.log('requested config:');
        console.log(specifiedConfig);
        console.log('resolved config:');
        console.log(config);

        //TODO: should these be root level or a standardConfig bucket?
        self.host = config.host;
        self.port = config.port;
        self.timeout = config.timeout;

        //TODO: support other tubes


        //TODO: encapsulate this standardConfig init
        function getConfig(config) {
            //support standardConfig as either a raw javascript object or as a nconf object

            var configUtil;
            var defaultConfig = {
                beanstalk: {
                    host: '127.0.0.1', port: '3000', timeout: 0, defaultConfig: true, source: 'default'
                }
            };

            if (config && _.isFunction(config.nconf)) {
                //this is a configUtil
                configUtil = config;
            } else {
                configUtil = require('../config');
                configUtil.nconf().defaults(defaultConfig);
                var beanstalkConfig = configUtil.getConfig('beanstalk', config, defaultConfig);
                return beanstalkConfig;
            }

        }
    }

    initialize(callback) {
        var self = this;

        self.client = new fivebeansClient(self.host, self.port);
        self.logger.debug('connecting to beanstalkd at ' + self.host + ':' + self.port);

        self.client.on('connect', function () {
            self.logger.trace('connected to beanstalkd at ' + self.host + ':' + self.port);

            //TODO: this is where listening to tubes will come into play

            Utility.safeCallback(callback);
        });

        self.client.on('error', function (err) {
            self.logger.warn('error occurred, probably during connection', err);
            if (_.isFunction(callback)) {
                callback(err);
            }
        });

        self.client.on('close', self._onClose.bind(self));

        self.client.connect();
    };

    _onClose() {
        var self = this;
        self.logger.debug('client disconnected');
    };

    enqueue(jobRequest, callback) {
        var self = this;

        self.logger.debug('enqueue job request');
        var serializedJobRequest = serialize(jobRequest);

        var priority = determinePriority(jobRequest);
        var delay = calculateDelayAsSeconds(jobRequest);

        //boo!  this really should be a dequeue concept, not a choice of the producer
        var ttr = 60;

        self.client.put(priority, delay, ttr, serializedJobRequest, function (err, jobid) {
            self.logger.debug('enqueued job request', jobid);
            callback(Utility.NO_ERROR, jobRequest);
        });

        function determinePriority(jobRequest) {
            var priority;
            if (jobRequest) {
                if (_.isNumber(jobRequest.priority)) {
                    if (jobRequest.priority < 0) {
                        priority = 0;
                    } else if (jobRequest.priority > 4294967295) {
                        priority = 4294967295;
                    } else {
                        priority = jobRequest.priority;
                    }
                } else {
                    priority = 0;
                }
            }
            self.logger.trace('calculating priority', jobRequest.priority, priority);
            return priority;
        }

        function calculateDelayAsSeconds(jobRequest) {
            //will round up to 1s
            if (jobRequest) {
                var now = new Date();
                self.logger.trace('calculating delay', jobRequest.delay, now);
                if (jobRequest.delay) {
                    var mNow = moment(now);
                    var mDelay = moment(jobRequest.delay);

                    var delayAbsolute = mDelay.diff(mNow, 's');

                    if (delayAbsolute == 0) {
                        delayAbsolute = 1
                    }
                    else if (delayAbsolute < 0) {
                        delayAbsolute = 0;
                    }

                    self.logger.trace('calculated delay: ', delayAbsolute);
                    return delayAbsolute;
                }
            }
            return 0;
        }
    };


    dequeue(callbackToConsumer) {
        var self = this;

        //TODO: check that we are connected before dequeue

        self.logger.trace('about to begin reserve_with_timeout; timeout=' + self.timeout);
        self.client.reserve_with_timeout(self.timeout, function (err, jobID, payload) {
                if (isTimeout(err)) {
                    self.logger.trace('no items on queue');
                    callbackToConsumer();
                }
                else if (isDeadlineSoon(err)) {
                    self.logger.trace('deadline soon');
                    callbackToConsumer();
                }
                else if (isBadFormat(err)) {
                    self.logger.error('error occurred while dq, note that bad format can occur with poor reserve request, such as timeout setting', err);
                    callbackToConsumer(err);
                } else if (err) {
                    self.logger.error('error occurred while dq', err);
                    callbackToConsumer(err);
                } else {
                    self.logger.trace('reserved item: ' + jobID);
                    var deserializedJob = deserialize(payload);

                    if (isExpired(deserializedJob)) {
                        //TODO: this is very inefficient
                        //what we are doing is basically just leaving it in reserved state (while we move on to the next item) until its TTR kicks and puts it
                        //back.  Probably should bury these at this point
                        self.logger.trace('found expired item, leaving it and moving to next.  Need better solution, please');
                        return self.dequeue(callbackToConsumer);
                    }

                    callbackToConsumer(Utility.NO_ERROR, deserializedJob, commitCallback, rollbackCallback);

                    //TODO: this probably pulls in too much closure, consider moving these to prototype https://github.com/jasonray/kessel/issues/46
                    function commitCallback(commitComplete) {
                        self.logger.trace('commit requested on ' + jobID);

                        self.client.destroy(jobID, function (err) {
                            //TODO: check for error
                            self.logger.trace('commit complete on ' + jobID);
                            if (_.isFunction(commitComplete)) {
                                commitComplete();
                            }
                        });
                    }

                    //TODO: this probably pulls in too much closure, consider moving these to prototype https://github.com/jasonray/kessel/issues/46
                    function rollbackCallback(rollbackComplete) {
                        self.logger.trace('rollback requested on ' + jobID);

                        //TODO: determine how to handle priority
                        const priority = 100;
                        const delay = 0;
                        self.client.release(jobID, priority, delay, function (err) {
                            //TODO: check for error
                            self.logger.trace('rollback complete on ' + jobID);
                            if (_.isFunction(rollbackComplete)) {
                                rollbackComplete();
                            }
                        });
                    }
                }
            }
        );

        //TODO: odd spot for this and it is redundant with beanstalk adapter
        function isExpired(jobRequest) {
            if (jobRequest.expiration) {
                //TODO: guard against failed parse
                var expiration = Date.parse(jobRequest.expiration);
                var now = new Date();

                if (now > expiration) {
                    return true;
                }
            }
            return false;
        }

        //TODO: where should these checks exists?
        function isTimeout(err) {
            return (err == 'TIMED_OUT');
        }

        function isDeadlineSoon(err) {
            return (err == 'DEADLINE_SOON');
        }

        function isBadFormat(err) {
            return (err == 'BAD_FORMAT');
        }

        //TODO: where should these checks exists?
        function isError(err) {
            return !_.isEmpty(err);
        }
    };
}


BeanstalkAdapter.prototype.truncate = function (callbackToConsumer) {
    //TODO: this is good enough, but requires big function stack.  Change to loop

    var self = this;
    self.logger.warn('preparing to delete all items from tube.  This likely should not be allowed in production');
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
util.inherits(BeanstalkAdapter, events.EventEmitter);

function serialize(jobRequest) {
    return JSON.stringify(jobRequest);
}
function deserialize(buffer) {
    return JSON.parse(buffer);
}


module.exports = BeanstalkAdapter;
