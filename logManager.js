var _ = require('underscore');

function LogManager() {
    var self = this;

    self._bunyan = require('bunyan');
    self._loggers = {};
}

LogManager.prototype._createLogger = function (name) {
    var self = this;
    var logger = self._bunyan.createLogger({
        name: name,
        streams: [{
            level: 'trace',
            stream: process.stdout
        }]
    });
    return logger;
}

LogManager.prototype.getLogger = function (name) {
    var self = this;
    self._loggers[name] = self._createLogger(name);
    return self._loggers[name];
}

LogManager.prototype._doesLogExist = function (name) {
    return (!(_.isEmpty(this._loggers[name])));
}

module.exports = LogManager;