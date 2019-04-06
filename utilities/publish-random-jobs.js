// this library is for parsing command line params
// this is used in this project for setting the port
// for info on minimist, see docs:
// https://github.com/substack/minimist
const pargv = require('minimist')(process.argv.splice(2));
const _ = require('underscore');
const JobManager = require('../lib/jobManager');
const LogManager = require('../lib/logManager');

const context = {};
context.logManager = new LogManager();
const logger = context.logManager.getLogger('app');

const BeanstalkQueueAdapter = require('../lib/queue/beanstalkAdapter');
const config = {
    beanstalk: {
        host: '127.0.0.1',
        port: '3000'
    }
};
context.queue = new BeanstalkQueueAdapter(config);

logger.info('starting kessel app script');
logger.trace('init job manager');
const manager = new JobManager(context);
manager.initialize(function (err) {
    if (!err) {
        setInterval(function () {
            const x = getRandomInt(0,9);
            const y = getRandomInt(0,9);

            const request = {
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