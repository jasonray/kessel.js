var _ = require('underscore');

function LogManager() {
    var self = this;

    self._bunyan = require('bunyan');
    self._loggers = {};
}

LogManager.prototype.getLogger = function (name) {
    var self = this;
    if (!self._doesLogExist(name)) createLogger(name);
    return self._loggers[name];

    function createLogger(logname) {
        console.log('creating logger: ', logname);
        var logger = self._bunyan.createLogger({
            name: logname,
            streams: [{
                level: 'trace',
                stream: process.stdout
            }]
        });
        self._loggers[logname] = logger;
    }
}

LogManager.prototype._doesLogExist = function (name) {
    return (!(_.isEmpty(this._loggers[name])));
}

module.exports = LogManager;