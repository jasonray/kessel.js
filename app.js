// this library is for parsing command line params
// this is used in this project for setting the port
// for info on minimist, see docs:
// https://github.com/substack/minimist
var pargv = require('minimist')(process.argv.splice(2));
var _ = require('underscore');



logger.info('starting kessel');
var JobManager = require('./lib/jobManager');
logger.debug('init job manager');
var manager = new JobManager();
logger.debug('starting job manager');
manager.start();
logger.debug('post start job manager');
