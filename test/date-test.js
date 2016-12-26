var mocha = require('mocha');
var assert = require('assert');
var should = require('should');
var QueueAdapter = require('../lib/queue/basicQueueAdapter');

describe.only('date exploration', function () {
    it('same dates equal', function () {
        var d1 = new Date(2012, 1, 1);
        var d2 = new Date(2012, 1, 1);
        should(d1.getTime()).equal(d2.getTime());
    });
    it('different dates not equal', function () {
        var d1 = new Date(2012, 1, 1);
        var d2 = new Date(2011, 1, 1);
        should(d1.getTime()).not.equal(d2.getTime());
    });
    it('recent date > earlier date', function () {
        var d1 = new Date(2012, 1, 1);
        var d2 = new Date(2011, 1, 1);
        var check = d1 > d2;
        assert.equal(check, true);
    });
    it('earlier date < recent date', function () {
        var d1 = new Date(2012, 1, 1);
        var d2 = new Date(2011, 1, 1);
        var check = d2 < d1;
        assert.equal(check, true);
    });
    it('now < now+1', function () {
        var d1 = new Date();
        setTimeout(function () {
            var d2 = new Date();
            var check = d1 < d2;
            assert.equal(check, true);
        }, 100);
    });
});