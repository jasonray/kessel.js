var fivebeansClient = require('fivebeans').client;
var _ = require('underscore');
var LogManager = require('../logManager');
const NO_ERROR = null;
var events = require('events');
var util = require('util');


function BeanstalkAdapter(config) {
    var self = this;

    if (!config) config = {};
    if (!config.beanstalk) config.beanstalk = {};
    if (!config.beanstalk.host) config.beanstalk.host = '127.0.0.1';
    if (!config.beanstalk.port) config.beanstalk.port = '3000';
    if (!config.beanstalk.timeout) config.beanstalk.timeout = '0';

    var logManager = new LogManager();
    self.logger = logManager.getLogger('beanstalk-adapter');

    self.host = config.beanstalk.host;
    self.port = config.beanstalk.port;
    self.timeout = config.beanstalk.timeout;
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

    setTimeout(function () {
        self.logger.debug('trigger timeout');
    }, 1000);
};


BeanstalkAdapter.prototype._onClose = function () {
    var self = this;
    self.logger.debug('client disconnected');
};

// BeanstalkAdapter.prototype.enqueue = function (jobRequest, callback) {
//     var self = this;
//     setTimeout(function () {
//         self.queue.push(jobRequest);
//         if (_.isFunction(callback)) {
//             callback(NO_ERROR, jobRequest)
//         }
//     }, self.latency)
// };
//
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
                self.logger.debug(payload);
                callbackToConsumer(payload, commitCallback, rollbackCallback);

                function commitCallback(commitComplete) {
                    if (_.isFunction(commitComplete)) {
                        commitComplete();
                    }
                }

                function rollbackCallback(rollbackComplete) {
                    self.enqueue(payload);
                    if (_.isFunction(rollbackComplete)) {
                        rollbackComplete();
                    }
                }
            }
        }
    );

    function isTimeout(err) {
        return (err == 'TIMED_OUT');
    }

    function isError(err) {
        return !_.isEmpty(err);
    }

};

module.exports = BeanstalkAdapter;
