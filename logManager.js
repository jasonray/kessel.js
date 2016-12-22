var _ = require('underscore');

function LogManager() {
    var self = this;

    self._bunyan = require('bunyan');
    self._loggers = {};
}

LogManager.prototype.createLogger = function (name) {
    var self = this;
    var logger = self._bunyan.createLogger({
        name: name,
        streams: [{
            level: 'trace',
            stream: process.stdout
        }]
    });
}

LogManager.prototype.getLogger = function (name) {

}

LogManager.prototype._doesLogExist = function (name) {
    var key = _.findKey(this._loggers);
    return (!(_.isEmpty(key)));
}

module.exports = LogManager;