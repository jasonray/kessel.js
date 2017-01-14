const mocha = require('mocha');
const assert = require('assert');
const should = require('should');
const QueueAdapter = require('../lib/queue/basicQueueAdapter');
const config = require('../lib/config');

const standardConfig = {
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
            const value = config.nconf().get('setting1');
            value.should.equal('a');
        });
        it('read nested setting', function () {
            const value = config.nconf().get('subSystem1:setting3');
            value.should.equal('c');
        });
        it('missing setting', function () {
            const value = config.nconf().get('setting?');
            should.not.exist(value);
        });
        it('set then read basic setting', function () {
            config.nconf().set('setting1', 'a2');
            const value = config.nconf().get('setting1');
            value.should.equal('a2');
        });
        it('prove that order of tests does not matter on tests now that i am using reset, as the value will go back to the default', function () {
            const value = config.nconf().get('setting1');
            value.should.equal('a');
        });
    });
    describe('access section', function () {
        it('read simple setting', function () {
            const subSystemConfig = config.getConfig('subSystem1');
            const value = subSystemConfig.setting4;
            value.should.equal('d');
        });
        it('consumer provided', function () {
            const subSystemConfig = config.getConfig('subSystem1', {setting4: 'z', setting5: 'e'});
            const value = subSystemConfig.setting5;
            should(value).equal('e');
        });
        it('consumer overrides', function () {
            const subSystemConfig = config.getConfig('subSystem1', {setting4: 'z', setting5: 'e'});
            const value = subSystemConfig.setting4;
            should(value).equal('z');
        });
        it('consumer overrides twice', function () {
            let subSystemConfig = config.getConfig('subSystem1');
            let value = subSystemConfig.setting4;
            should(value).equal('d');

            subSystemConfig = config.getConfig('subSystem1', {setting4: 'z', setting5: 'e'});
            value = subSystemConfig.setting4;
            should(value).equal('z');

            subSystemConfig = config.getConfig('subSystem1', {setting4: 'zz', setting5: 'e'});
            value = subSystemConfig.setting4;
            should(value).equal('zz');
        });
    });
});