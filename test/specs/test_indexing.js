const should = require('should');
const rimraf = require('rimraf');
const fs = require('fs');

const searchEngine = require('../../');

const EPUB = 'node_modules/epub3-samples';
const TEST_DB = 'mocha_test_DB'; // TODO: process.env.TEST_DB

describe('indexing ', function () {

    rimraf.sync(TEST_DB);

    it('check directory is empty', function (done) {

        this.timeout(10000);

        var emptyDir = 'emptyDir';
        fs.mkdirSync(emptyDir);

        searchEngine({'indexPath': TEST_DB}, function (err, se) {

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

        searchEngine({'indexPath': TEST_DB}, function (err, se) {

            if (err)
                return console.log(err);

            se.indexing(EPUB, function () {

                se.close(function () {
                    done();
                });
            });
        });
    });
});