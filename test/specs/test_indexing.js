var should = require('should');
var rimraf = require('rimraf');
var fs = require('fs');


var SearchEngine = require('../../');

var epub = 'node_modules/epub3-samples';
var testDB = 'mocha_test_DB'; // TODO: process.env.testDB

describe('indexing ', function () {

    rimraf.sync(testDB);
    
    it('check directory is empty', function (done) {

        this.timeout(10000);

        var emptyDir = 'emptyDir';
        fs.mkdirSync(emptyDir);

        var se = new SearchEngine({'indexPath': 'test_search', logLevel: 'warn'});

        se.indexing(emptyDir, function (info) {

            fs.rmdirSync(emptyDir);
            se.close(function() {
                //console.log(info);
                (info instanceof Error).should.be.true();
                done();
            });
        });
    });

    it('should index an epub', function (done) {

        this.timeout(15000);

        var se = new SearchEngine({'indexPath': testDB, logLevel: 'warn'});

        se.indexing(epub, function () {
            
            se.close(function() {
                done();
            });
        });
    });
});