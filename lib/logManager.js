var _ = require('underscore');

function LogManager() {
    var self = this;

    self._bunyan = require('bunyan');
    self._rootLogName = 'root';
    self._loggers = {};
}

LogManager.prototype._createLogger = function (name) {
    var self = this;
    var logger = self._bunyan.createLogger({
        name: name,
        streams: [{
            level: 'warn',
            stream: process.stdout
        }]
    });
    self._loggers[name] = logger;
};

LogManager.prototype.getLogger = function (name) {
    var self = this;
    if (!self._doesLogExist(name)) self._createLogger(name);
    return self._loggers[name];

    function createLogger(name) {

    }
};

LogManager.prototype._doesLogExist = function (name) {
    return (!(_.isEmpty(this._loggers[name])));
};

module.exports = LogManager;