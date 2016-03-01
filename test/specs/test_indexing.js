const should = require('should');
const rimraf = require('rimraf');
const fs = require('fs');

const searchEngine = require('../../');

const epub = 'node_modules/epub3-samples';
const testDB = 'mocha_test_DB'; // TODO: process.env.testDB

describe('indexing ', function () {

    rimraf.sync(testDB);
    
    it('check directory is empty', function (done) {

        this.timeout(10000);

        var emptyDir = 'emptyDir';
        fs.mkdirSync(emptyDir);

        searchEngine({'indexPath': testDB}, function (err, se) {

            if (err) {
                console.log(err);
            } else {
                se.indexing(emptyDir, function (info) {

                    fs.rmdirSync(emptyDir);
                    se.close(function () {
                        //console.log(info);
                        (info instanceof Error).should.be.true();
                        done();
                    });
                });
            }
        });
    });

    it('should index all epubs from passed argument path', function (done) {

        this.timeout(20000);

        searchEngine({'indexPath': testDB}, function (err, se) {

            if (err) {
                console.log(err);
            } else {

                se.indexing(epub, function () {

                    se.close(function () {
                        done();
                    });
                });
            }
        });
    });
});