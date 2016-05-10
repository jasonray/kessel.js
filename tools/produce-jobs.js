var FrequencyProducer = function(connection, frequency, max, content) {
    var self = this;

    var count = 0;
    var intervalHandle;

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
        if (intervalHandle) {
            clearInterval(intervalHandle);
        }
    });

    function periodicallyQueueJobs() {
        intervalHandle = setInterval(queueJob, frequency);
    }

    const priority = 0;
    const delay = 0;
    const ttr = 0;

    function queueJob() {
        var job = JSON.stringify(content);
        self.client.put(priority, delay, ttr, job, function(err, jobid) {
            console.log('queued job ' + jobid);
            checkMax();
        });
    }

    function checkMax() {
        if (max > 0) {
            count = count + 1;
            if (count >= max) {
                console.log('reached max number of messages [%s], shutting down', max);
                self.client.quit();
            }
        }

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
    .default('max', 0).alias('m', 'max')
    .argv;

var connection = {
    host: argv.host,
    port: argv.port,
    tube: argv.tube
};

var producer = new FrequencyProducer(connection, argv.frequency, argv.max, argv.payload);
producer.connect();
