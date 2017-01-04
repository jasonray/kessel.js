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
    if (self._handlers[type])throw new Error('Cannot register two handlers for same type');

    var normalizedHandler;
    if (isFunctionBasedHandler(handler)) {
        //single type, handler is function
        normalizedHandler = handler;
    } else if (isObjectBasedHandler(handler)) {
        //single type, handler is object (with handler method)
        normalizedHandler = handler.handle;
    }
    if (_.isUndefined(normalizedHandler)) throw new Error('Cannot register invalid handler');

    self.logger.trace('registering handler [type=' + type + ']');
    self._handlers[type] = normalizedHandler;


    function isTypeValid(value) {
        if (_.isEmpty(type)) return false;
        if (_.isEmpty(type.trim())) return false;
        return true;
    }

    function isFunctionBasedHandler(handler) {
        return ( _.isFunction(handler));
    }

    function isObjectBasedHandler(handler) {
        return ( _.isObject(handler) && _.isFunction(handler.handle)  );
    }
};

HandlerRegistry.prototype.getHandler = function (type) {
    var self = this;
    if (type) {
        type = type.trim();
    }
    return self._handlers[type];
};

module.exports = HandlerRegistry;