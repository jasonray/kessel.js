var _ = require('underscore');
var LogManager = new require('./logManager');

class HandlerRegistry {
    constructor(context) {
        var self = this;

        var logManager = new LogManager();
        self.logger = logManager.getLogger('handler-registry');

        self._handlers = {};
    }

 registerHandlers  (handlersInfo) {
    var self = this;
    // Support two formats of handler info:
    // 1) [{type: '+', handler: additionHandler},{type: '*', handler: multiplicationHandler}]
    // 2) {'+': additionHandler, '*': multiplicationHandler}

    if (_.isArray(handlersInfo)) {
        //format #1
        _.each(handlersInfo, function (singleHandlerInfo, key) {
            self.registerHandler(singleHandlerInfo.type, singleHandlerInfo.handler);
        });
    } else {
        //format #2
        _.each(handlersInfo, function (singleHandlerInfo, key) {
            self.registerHandler(key, singleHandlerInfo);
        });

    }
};
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
        var handleFunction = handler.handle;
        return self.registerHandler(type, handleFunction);
    } else if (isModuleIdentifier(handler)) {
        var handlerModule = require(handler);
        return self.registerHandler(type, handlerModule);
    }
    if (_.isUndefined(normalizedHandler)) throw new Error('Cannot register invalid handler');

    self.logger.trace('registering handler [type=' + type + ']');
    self._handlers[type] = normalizedHandler;


    function isTypeValid(value) {
        if (_.isEmpty(type)) return false;
        if (_.isEmpty(type.trim())) return false;
        return true;
    }

    function isModuleIdentifier(handler) {
        return ( _.isString(handler));
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