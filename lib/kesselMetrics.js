// var _ = require('underscore');
// var events = require('events');
// var util = require('util');
// const uuid = require('uuid/v4');
// var LogManager = new require('./logManager');

function KesselMetrics(context) {
    var self = this;

    if (!(this instanceof KesselMetrics)) {
        return new KesselMetrics();
    }

    self._metrics = require('statman');
    self._metrics.register(new self._metrics.Gauge('jobs-published'));
}
// util.inherits(KesselMetrics, events.EventEmitter);

KesselMetrics.prototype._jobPublished = function (type) {
    var self = this;
    self._metrics.gauges('jobs-published').increment();
};

KesselMetrics.prototype.getGauages = function () {
    return this.gauges;
}

module.exports = KesselMetrics;


