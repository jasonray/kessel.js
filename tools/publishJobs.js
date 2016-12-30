// this library is for parsing command line params
// this is used in this project for setting the port
// for info on minimist, see docs:
// https://github.com/substack/minimist
var pargv = require('minimist')(process.argv.splice(2));
var _ = require('underscore');
var JobManager = require('./lib/jobManager');
var LogManager = require('./lib/logManager');

var context = {};
context.logManager = new LogManager();
logger = context.logManager.getLogger('app');

var BeanstalkQueueAdapter = require('./lib/queue/beanstalkAdapter');
var config = {
    beanstalk: {
        host: '127.0.0.1',
        port: '3000'
    }
}
context.queue = new BeanstalkQueueAdapter(config);

logger.info('starting kessel app script');
logger.trace('init job manager');
var manager = new JobManager(context);
manager.initialize(function (err) {
    if (!err) {
        setInterval(function () {
            var x = getRandomInt(0,9);
            var y = getRandomInt(0,9);

            var request = {
                type: 'add',
                payload: {
                    operands: [x, y]
                }
            };

            logger.debug('requesting job');
            manager.request(request);
        }, 10000);
    }
});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}