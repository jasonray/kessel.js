var fivebeans = require('fivebeans');

var connection = {
    host: 'localhost',
    port: 11300,
    tube: 'example'
}

var job = {
    type: 'echo',
    payload: 'hello world'
};

var client = new fivebeans.client(connection.host, connection.port);
client.on('connect', function() {
    client.put(0, 0, 60, JSON.stringify(['testtube', job]), function(err, jobid) {
        console.log('queued job ' + jobid);
    });
});

client.connect();