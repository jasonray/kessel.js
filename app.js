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
        port: '3000',
        timeout: 5
    }
};
context.queue = new BeanstalkQueueAdapter(config);

logger.info('starting kessel app script');
logger.trace('init job manager');
var manager = new JobManager(context);
logger.trace('starting job manager');
manager.start();
logger.trace('post start job manager');
