var FrequencyProducer = function(connection, frequency, content) {
    var self = this;

    var fivebeans = require('fivebeans');
    self.client = new fivebeans.client(connection.host, connection.port);

    self.client.on('connect', function() {
        periodicallyQueueJobs();
    });

    self.client.on('error', function(err) {
        console.log('error occurred in queue client');
    });

    self.client.on('close', function(err) {
        console.log('client closed connection');
    });

    function periodicallyQueueJobs() {
        setInterval(queueJob, frequency);
    }

    const priority = 0;
    const delay = 0;
    const ttr = 0;

    function queueJob() {
        var job = JSON.stringify(content);
        self.client.put(priority, delay, ttr, job, function(err, jobid) {
            console.log('queued job ' + jobid);
        });
    }
}

FrequencyProducer.prototype.connect = function() {
    var self = this;
    self.client.connect();
}

var samplejob = 'helloworld';

var connection = {
    host: 'localhost',
    port: 11300,
    tube: 'example'
};

const frequencyInMilliseconds = 1000;

var producer = new FrequencyProducer(connection, frequencyInMilliseconds, samplejob);
producer.connect();
