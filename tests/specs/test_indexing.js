const should = require('should');
const rimraf = require('rimraf');
const fs = require('fs');

const searchEngine = require('../../');
const constants = require("../../src/Constants");

describe('indexing ', function () {

    rimraf.sync(constants.TEST_DB);
    rimraf.sync(constants.INDEXING_CONTROLLER_DB);

    it('check directory is empty', function (done) {

        this.timeout(10000);

        var emptyDir = 'emptyDir';
        fs.mkdirSync(emptyDir);

        searchEngine({'indexPath': constants.TEST_DB}, function (err, se) {

            if (err)
                return console.log(err);

            se.indexing(emptyDir, function (info) {

                fs.rmdirSync(emptyDir);
                se.close(function () {
                    //console.log(info);
                    (info instanceof Error).should.be.true();
                    done();
                });
            });
        });
    });

    it('should index all epubs from passed argument path', function (done) {

        this.timeout(20000);

        searchEngine({'indexPath': constants.TEST_DB}, function (err, se) {

            if (err)
                return console.log(err);

            se.indexing(constants.EPUB, function () {

                se.close(function () {
                    done();
                });
            });
        });
    });
});