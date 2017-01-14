var _ = require('underscore');

class LogManager {
    constructor() {

        var self = this;

        self._bunyan = require('bunyan');
        self._rootLogName = 'root';
        self._loggers = {};
    }

    _createLogger(name) {
        var self = this;
        var logger = self._bunyan.createLogger({
            name: name,
            streams: [{
                level: 'trace',
                stream: process.stdout
            }]
        });
        self._loggers[name] = logger;
    };

    getLogger(name) {
        var self = this;
        if (!self._doesLogExist(name)) self._createLogger(name);
        return self._loggers[name];
    };

    _doesLogExist(name) {
        return (!(_.isEmpty(this._loggers[name])));
    };
}

module.exports = LogManager;