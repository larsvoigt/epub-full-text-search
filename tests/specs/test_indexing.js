const should = require('should'),
    rimraf = require('rimraf'),
    fs = require('fs'),
    searchEngine = require('../../'),
    constants = require("../../src/Constants"),
    init = require('../init');

describe('indexing ', function () {

    var se;

    beforeEach(function(done) {
        init()
            .then(function() {
                return searchEngine({'indexPath': constants.TEST_DB});
            })
            .then(function(_se) {
                se = _se;
                done();
            })
            .fail(done);
    });

    afterEach(function(done) {
        se.close()
            .then(function() {
                done();
            })
            .fail(done);
    });

    it('check directory is empty', function (done) {

        this.timeout(10000);

        var emptyDir = 'emptyDir';
        fs.mkdirSync(emptyDir);

        se.indexing(emptyDir)
            .then(function (info) {
                done('Indexing was not rejected');
            })
            .fail(function(err) {
                fs.rmdirSync(emptyDir);
                (err instanceof Error).should.be.true();
                done();
            });
    });

    it('should index all epubs from passed argument path', function (done) {

        this.timeout(20000);
        se.indexing(constants.EPUB)
            .then(function () {
                done();
            });
    });
});