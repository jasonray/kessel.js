var _ = require('underscore');
var LogManager = new require('./logManager');

function HandlerRegistry(context) {
    var self = this;

    var logManager = new LogManager();
    self.logger = logManager.getLogger('handler-registry');

    self._handlers = {};
}

HandlerRegistry.prototype.registerHandler = function (type, handler) {
    var self = this;

    if (!isTypeValid(type)) throw new Error('Cannot register handler with invalid type');
    if (_.isUndefined(handler)) throw new Error('Cannot register invalid handler');
    if (self._handlers[type])throw new Error('Cannot register two handlers for same type');

    //single type, handler is function
    self.logger.trace('registering handler [type=' + type + ']');
    self._handlers[type] = handler;

    function isTypeValid(value) {
        if (_.isEmpty(type)) return false;
        if (_.isEmpty(type.trim())) return false;
        return true;
    }
};

HandlerRegistry.prototype.getHandler = function (type) {
    var self = this;
    return self._handlers[type.trim()];
}

module.exports = HandlerRegistry;