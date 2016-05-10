var FrequencyProducer = function(connection, frequency, content) {
    var self = this;

    var fivebeans = require('fivebeans');
    self.client = new fivebeans.client(connection.host, connection.port);

    self.client.on('connect', function() {
        periodicallyQueueJobs();
    });

    self.client.on('error', function(err) {
        console.log('error occurred in queue client [%s]', err);
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





// start script

var argv = require('yargs')
    .default('payload', 'helloworld')
    .default('host', 'localhost').alias('h', 'host')
    .default('port', '11300').alias('p', 'port')
    .default('tube', 'default').alias('t', 'tube')
    .default('frequency', 1000).alias('f', 'frequency')
    .argv;

var connection = {
    host: argv.host,
    port: argv.port,
    tube: argv.tube
};

var producer = new FrequencyProducer(connection, argv.frequency, argv.payload);
producer.connect();
