"use strict";

//TODO: split this into submodule

const express = require('express');
const app = express();

app.get('/', function (req, res) {
    res.send('welcome to kessel');
});

app.get('/stats', function (req, res) {
    let output = '';
    output = output + self.context.metrics.gauge('kessel.jobsProcessed').toString();
    output = output + self.context.metrics.meter('kessel.job-timing').toString();
    output = output + self.context.metrics.meter('kessel.job-timing.add').toString();
    output = output + self.context.metrics.meter('kessel.job-timing.multiplication').toString();
    res.send(output);
});

app.post('/jobRequest/randomAdd', function (req, res) {
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
        if (err) {
            res.status(500).send('error occurred', err);
        } else {
            res.status(202).send('job requested');
        }
    }
});

app.post('/jobRequest/randomMultiplication', function (req, res) {
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
        if (err) {
            res.status(500).send('error occurred', err);
        } else {
            res.status(202).send('job requested');
        }
    }
});