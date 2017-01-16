var pargv = require('minimist')(process.argv.splice(2));
var _ = require('underscore');
var JobManager = require('../lib/jobManager');
var LogManager = require('../lib/logManager');

var context = {};
context.logManager = new LogManager();
logger = context.logManager.getLogger('publisher');

context.config = require('../lib/config');
logger.trace('standardConfig:', context.config.getConfig());
logger.trace('config.beanstalk', context.config.getConfig('beanstalk'));

var BeanstalkQueueAdapter = require('../lib/queue/beanstalkAdapter');
context.queue = new BeanstalkQueueAdapter(context.config.getConfig('beanstalk'));

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
        }, 1000);
    }
});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}