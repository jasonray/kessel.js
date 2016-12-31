var mocha = require('mocha');
var assert = require('assert');
var should = require('should');
var QueueAdapter = require('../lib/queue/basicQueueAdapter');
var config = require('../lib/config');

var standardConfig = {
    setting1: 'a',
    setting2: 'b',
    subSystem1: {
        setting3: 'c',
        setting4: 'd',
    }
};

describe('config', function () {
    beforeEach(function () {
        config.reset();
        config.nconf().defaults(standardConfig);
    });
    describe('basic nconf', function () {
        it('read simple setting', function () {
            var value = config.nconf().get('setting1');
            value.should.equal('a');
        });
        it('read nested setting', function () {
            var value = config.nconf().get('subSystem1:setting3');
            value.should.equal('c');
        });
        it('missing setting', function () {
            var value = config.nconf().get('setting?');
            should.not.exist(value);
        });
        it('set then read basic setting', function () {
            config.nconf().set('setting1', 'a2');
            var value = config.nconf().get('setting1');
            value.should.equal('a2');
        });
        it('prove that order of tests does not matter on tests now that i am using reset, as the value will go back to the default', function () {
            var value = config.nconf().get('setting1');
            value.should.equal('a');
        });
    });
    describe('access section', function () {
        it('read simple setting', function () {
            var subSystemConfig = config.getConfig('subSystem1');
            var value = subSystemConfig.setting4;
            value.should.equal('d');
        });
        it('consumer provided', function () {
            var subSystemConfig = config.getConfig('subSystem1', {setting4: 'z', setting5: 'e'});
            var value = subSystemConfig.setting5;
            should(value).equal('e');
        });
        it('consumer overrides', function () {
            var subSystemConfig = config.getConfig('subSystem1', {setting4: 'z', setting5: 'e'});
            var value = subSystemConfig.setting4;
            should(value).equal('z');
        });
    });
});