const events = require('events');
const util = require('util');
const fivebeans = require('fivebeans');

var Dequeuer = function() {
    var self = this;
    events.EventEmitter.call(self);
    util.inherits(Dequeuer, events.EventEmitter);

    this.on('next', processNextJob);

    self.fivebeans = require('fivebeans');
    self.connection = {
        host: 'localhost',
        port: 11000,
        tube: 'example'
    }


    function processNextJob() {
        self.client.reserve_with_timeout(1000, function(err, jobID, payload) {
            if (err) {
                console.log('err: %s', err);
            } else {
                console.log('reserved job %s [%s]', jobID, payload);
                self.client.destroy(jobID, function() {
                    self.emit('next');
                });
            }
        });
    }
}

Dequeuer.prototype.connect = function() {
    var self = this;

    self.client = new fivebeans.client(self.connection.host, self.connection.port);

    self.client.on('connect', function() {
        console.log('connected');
        self.client.watch(self.connection.tube, function() {
            console.log('watched tube, emitting next');
            self.emit('next');
        });
    });

    console.log('connecting..');
    self.client.connect();
}

var dequeuer = new Dequeuer();
dequeuer.connect();
