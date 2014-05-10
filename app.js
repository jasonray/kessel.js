// this library is for parsing command line params
// this is used in this project for setting the port
// for info on minimist, see docs:
// https://github.com/substack/minimist
var pargv = require('minimist')(process.argv.splice(2));
var httpPort = pargv.p || 8888;

var express = require('express');
var app = express();

var logger = require('bunyan').createLogger({
	name: "server"
});

var bodyParser = require('body-parser');
// app.use(bodyParser());

// parse plain text
app.use(function(req, res, next) {
	if (req.is('text/*')) {
		logger.info('parsing text into body');
		req.text = '';
		req.setEncoding('utf8');
		req.on('data', function(chunk) {
			req.text += chunk;
		});
		req.on('end', next);
	} else {
		next();
	}
});

app.bindGet = function(root, subpath, binding) {
	var path = root + '/' + subpath;
	logger.info('binding GET ' + path + ' to ' + binding);
	app.get(path, binding);
};

app.bindPost = function(root, subpath, binding) {
	var path = root + '/' + subpath;
	logger.info('binding POST ' + path + ' to ' + binding);
	app.post(path, binding);
};

// log the request to stdout
var morgan = require('morgan')('dev');
app.use(morgan);

// collect usage metrics for everything under /api and /public
var metrics = require('statman');
app.use('/api', metrics.httpFilters.metricCollectionFilter);

// this would represent an expensive resource with 2000ms latency
var queueHttpBinding = require('./queue-http-binding');
queueHttpBinding.bind(app, '/api/queue');

app.get('/', function(req, res, next) {
	res.send('hello world');
});

app.listen(httpPort, function() {
	logger.info("application now listening on %s", httpPort);
});