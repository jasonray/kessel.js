var _ = require('underscore');
// var events = require('events');
// var util = require('util');
// const uuid = require('uuid/v4');
// var LogManager = new require('./logManager');

function KesselMetrics(context) {
    var self = this;

    if (!(this instanceof KesselMetrics)) {
        return new KesselMetrics();
    }

    self.metrics = require('statman');
    self.metrics.register(new self.metrics.Gauge('jobs-published'));
}
// util.inherits(KesselMetrics, events.EventEmitter);

KesselMetrics.prototype._jobPublished = function (type) {
    var self = this;
    self.metrics.gauges('jobs-published').increment();
};

KesselMetrics.prototype.reset = function () {
    var self = this;
    _.each(self.metrics.registry(), function (gauge) {
        gauge.set(0);
    });
};

module.exports = KesselMetrics;


