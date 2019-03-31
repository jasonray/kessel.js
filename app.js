const _ = require('underscore');
const JobManager = require('./lib/jobManager');
const LogManager = require('./lib/logManager');

var context = {};
context.logManager = new LogManager();
const logger = context.logManager.getLogger('app');


context.config = require('./lib/config');
logger.trace('standardConfig:', context.config.getConfig());
logger.trace('config.beanstalk', context.config.getConfig('beanstalk'));

var BeanstalkQueueAdapter = require('./lib/queue/beanstalkAdapter');
context.queue = new BeanstalkQueueAdapter(context.config.getConfig('beanstalk'));

logger.info('starting kessel app script');
var manager = new JobManager(context);
logger.trace('starting job manager');
manager.start();

