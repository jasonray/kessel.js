"use strict";

//TODO: split this into submodule
const config = require('./config');
const metrics = require('statman');

const express = require('express');
const app = express();

app.get('/', function (req, res) {
    res.send('welcome to kessel');
});

app.get('/stats', function (req, res) {
    const metricEvent = metrics.meter('kessel.httpBinding.stats').startEvent();

    var self = this;
    let output = '';
    output = output + metrics.gauge('kessel.jobsProcessed').toString() + '\n';
    output = output + metrics.meter('kessel.job-timing').toString() + '\n';
    output = output + metrics.meter('kessel.job-timing.add').toString() + '\n';
    output = output + metrics.meter('kessel.job-timing.multiplication').toString() + '\n';
    output = output + metrics.meter('kessel.httpBinding.randomAdd').toString() + '\n';
    output = output + metrics.meter('kessel.httpBinding.randomMultiplication').toString() + '\n';
    output = output + metrics.meter('kessel.httpBinding.stats').toString() + '\n';
    output = output + metrics.gauge('kessel.asyncQueue.size').toString() + '\n';

    metricEvent.stop();
    res.send(output);
});

app.post('/jobRequest/randomAdd', function (req, res) {
    const metricEvent = metrics.meter('kessel.httpBinding.randomAdd').startEvent();

    let x = getRandomInt(0, 9);
    let y = getRandomInt(0, 9);
    let priority = getRandomInt(10, 1000);

    let request = {
        type: 'add',
        priority: priority,
        payload: {
            operands: [x, y]
        }
    };

    logger.debug('requesting job ' + request.type);
    manager.request(request, requestComplete);

    function requestComplete(err) {
        metricEvent.stop();
        if (err) {
            res.status(500).send('error occurred', err);
        } else {
            res.status(202).send('job requested');
        }
    }
});

app.post('/jobRequest/randomMultiplication', function (req, res) {
    const metricEvent = metrics.meter('kessel.httpBinding.randomMultiplication').startEvent();

    let x = getRandomInt(0, 9);
    let y = getRandomInt(0, 9);
    let priority = getRandomInt(10, 1000);

    let request = {
        type: 'multiplication',
        priority: priority,
        payload: {
            operands: [x, y]
        }
    };

    logger.debug('requesting job ' + request.type);
    manager.request(request, requestComplete);

    function requestComplete(err) {
        metricEvent.stop();
        if (err) {
            res.status(500).send('error occurred', err);
        } else {
            res.status(202).send('job requested');
        }
    }
});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

var manager;
module.exports.start = function (myManager) {
    var self = this;

    manager = myManager;

    console.log('starting http binding');

    const port = config.getConfig('jobManager').httpBinding.port;
    app.listen(port, function (e) {
        if (e) {
            console.log('error starting http listener', e);
        } else {
            console.log('listening on port', port);
        }
    });
};