var mocha = require('mocha');
var assert = require('assert');
var should = require('should');
var QueueAdapter = require('../lib/queue/basicQueueAdapter');
var config = require('../config');

var standardConfig = {
    setting1: 'a',
    setting2: 'b',
    subSystem1: {
        setting3: 'c',
        setting4: 'd',
    }
};

describe.only('config', function () {
    beforeEach(function () {
        config.nconf().defaults(standardConfig);
    });
    describe('basic nconf', function () {
        it('read simple setting', function () {
            var value =config.nconf().get('setting1');
          value.should.equal('a');
        });
        it('read nested setting', function () {
            var value =config.nconf().get('subSystem1:setting3');
            value.should.equal('c');
        });
        it('missing setting', function () {
            var value =config.nconf().get('setting?');
            should.not.exist(value);
        });
    });
});