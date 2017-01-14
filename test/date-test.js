const mocha = require('mocha');
const assert = require('assert');
const should = require('should');
const QueueAdapter = require('../lib/queue/basicQueueAdapter');
const moment = require('moment');

describe('date exploration', function () {
    it('same dates equal', function () {
        const d1 = new Date(2012, 1, 1);
        const d2 = new Date(2012, 1, 1);
        should(d1.getTime()).equal(d2.getTime());
    });
    it('different dates not equal', function () {
        const d1 = new Date(2012, 1, 1);
        const d2 = new Date(2011, 1, 1);
        should(d1.getTime()).not.equal(d2.getTime());
    });
    it('recent date > earlier date', function () {
        const d1 = new Date(2012, 1, 1);
        const d2 = new Date(2011, 1, 1);
        const check = d1 > d2;
        assert.equal(check, true);
    });
    it('earlier date < recent date', function () {
        const d1 = new Date(2012, 1, 1);
        const d2 = new Date(2011, 1, 1);
        const check = d2 < d1;
        assert.equal(check, true);
    });
    it('now < now+1', function () {
        const d1 = new Date();
        setTimeout(function () {
            const d2 = new Date();
            const check = d1 < d2;
            assert.equal(check, true);
        }, 100);
    });
    it('date diff', function () {
        const d1 = new Date(2012, 1, 21);
        const d2 = new Date(2012, 1, 20);

        const m1 = moment(d1);
        const m2 = moment(d2);
        should(m1.diff(m2)).equal(1 * 24 * 60 * 60 * 1000)
    });
});