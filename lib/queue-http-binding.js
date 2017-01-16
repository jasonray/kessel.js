module.exports = {
	bind: function(app, bindLocation) {
		app.bindGet(bindLocation, '', fetchQueue);
		app.bindPost(bindLocation, 'push', push);
		app.bindPost(bindLocation, 'pop', pop);
	}
};

var _ = require('underscore');

var logger = require('bunyan').createLogger({
	name: "queue-http-binding"
});

var queueModule = require('./queue/queue');
var queue = new queueModule.queue();
queue.push('apple');
queue.push('banana');

var fetchQueue = function(req, res, next) {
	data = queue.toString();
	console.log('raw data:' + data);
	res.format({
		html: function() {
			data = data.split(',');
			console.log('split data:' + data);
			var html = '<html><body>';
			_.each(data, function(item) {
				console.log('data item:' + item);
				console.log('data item.toString():' + item.toString());
				html = html + '<ul>' + item.toString() +
					'</ul>';
			});
			html = html + '</body></html>';
			res.send(html);
		},

		text: function() {
			res.send(data);
		},

		json: function() {
			data = data.split(',');
			res.send(data);
		}
	});

	res.send(queue.toString());
};

var push = function(req, res, next) {
	var item = req.text;
	logger.info('requested push ' + item);
	queue.push(item);
	res.send(202);
};

var pop = function(req, res, next) {
	logger.info('requested pop');
	var item = queue.pop();
	res.send(item);
};