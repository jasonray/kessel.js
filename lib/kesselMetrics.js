// var _ = require('underscore');
// var events = require('events');
// var util = require('util');
// const uuid = require('uuid/v4');
// var LogManager = new require('./logManager');

function KesselMetrics(context) {
    var self = this;

    if (!(this instanceof JobManager)) {
        return new JobManager();
    }


}
// util.inherits(KesselMetrics, events.EventEmitter);

KesselMetrics.prototype.registerHandler = function (type, handler) {
};


module.exports = KesselMetrics;


