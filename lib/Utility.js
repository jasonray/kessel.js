const _ = require('underscore');

const NO_ERROR = null;
module.exports.NO_ERROR = NO_ERROR;

function isExpired(jobRequest) {
    if (jobRequest.expiration) {
        if (jobRequest.expiration < new Date()) {
            return true;
        }
    }
    return false;
}

module.exports.isExpired = isExpired;

function isDelayed(jobRequest) {
    if (jobRequest.delay) {
        if (jobRequest.delay > new Date()) {
            return true;
        }
    }
    return false;
}

module.exports.isDelayed = isDelayed;

function safeCallback(callback, args) {
    if (_.isFunction(callback)) {
        callback(null, args);
    }
}

module.exports.safeCallback = safeCallback;

function isTransient(result) {
    if (!result) return false;
    if (result === 'transient') return true;
    if (result.status === 'transient') return true;
    return false;
}

module.exports.isTransient = isTransient;

function isFatal(result) {
    if (!result) {
        return false;
    }
    if (result === 'fatal') {
        return true;
    }
    if (result.status === 'fatal') {
        return true;
    }
    return false;
}

module.exports.isFatal = isFatal;

function isSuccess(result) {
    if (!result) {
        return false;
    }
    if (result === 'success') {
        return true;
    }
    if (result.status === 'success') {
        return true;
    }
    return false;
}

module.exports.isSuccess = isSuccess;

function buildResult(status, message, envelope) {
    if (!envelope) {
        envelope = {};
    }
    if (message) {
        envelope.message = message;
    }
    envelope.status = status;
    return envelope;
}

module.exports.buildResult = buildResult;

function buildTransientResult(message, envelope) {
    return buildResult("transient", message, envelope);
}

module.exports.buildTransientResult = buildTransientResult;

function buildFatalResult(message, envelope) {
    return buildResult("fatal", message, envelope);
}

module.exports.buildFatalResult = buildFatalResult;

function buildSuccessResult(message, envelope) {
    return buildResult("success", message, envelope);
}

module.exports.buildSuccessResult = buildSuccessResult;

function buildSuccessResultFromValue(value) {
    var envelope = {value: value};
    return buildResult('success', null, envelope);
}

module.exports.buildSuccessResultFromValue = buildSuccessResultFromValue;

function isTypeValid(type) {
    if (_.isEmpty(type)) {
        return false;
    }
    if (_.isEmpty(type.trim())) {
        return false;
    }
    return true;
}

module.exports.isTypeValid = isTypeValid;