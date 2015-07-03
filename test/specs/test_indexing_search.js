var should = require('should');
var rimraf = require('rimraf');
var SearchEngine = require('../../lib/SearchEngine.js');
var fs = require('fs');

describe('indexing and search', function () {

    var epub = process.cwd() + '/test/epubs/accessible_epub_3/';
    var hitsAsJson = __dirname  + '/hits.json';

    describe('indexing ', function () {
        it('should index an epub', function (done) {

            this.timeout(10000);

            var se = new SearchEngine({'indexPath': 'test_search', logLevel: 'warn'});

            se.indexing(epub, function () {

                // the latest version of searchindex provide a close() function 
                // to prevent a db working folder lock situation between 
                // different searchindex instances

                // this function should call here 

                // current workaround:
                // rename test-folder for different si instances and 
                // remove this folder after test is finished   

                // remove test folder recursive
                rimraf.sync('test_search');
                done();
            });
        });
    });

    describe('search', function () {

        it('count hits of keyword', function (done) {

            this.timeout(10000);

            var se = new SearchEngine({'indexPath': 'test_search1', logLevel: 'warn'});

            se.indexing(epub, function () {

                se.search(["epub"], "Accessible EPUB 3", function (hits) {

                    (hits.length).should.be.exactly(15);

                    rimraf.sync('test_search1');
                    done();

                });
            });
        });

        it('should find no hits if keyword is not included', function (done) {

            this.timeout(10000);

            var se = new SearchEngine({'indexPath': 'test_search2', logLevel: 'warn'});

            se.indexing(epub, function () {

                se.search(["Accessi"], "Accessible EPUB 3", function (hits) {

                    (hits.length).should.be.exactly(0);

                    rimraf.sync('test_search2');
                    done();

                });
            });
        });

        it('should return the right hits', function (done) {

            this.timeout(10000);

            var se = new SearchEngine({'indexPath': 'test_search3', logLevel: 'warn'});

            se.indexing(epub, function () {

                se.search(["epub"], "Accessible EPUB 3", function (hits) {

                    rimraf.sync('test_search3');
                    var data = JSON.parse(fs.readFileSync(hitsAsJson));
                    (hits).should.eql(data);
                    done();

                });
            });
        });

        it('should return always the same hits', function (done) {

            this.timeout(10000);

            var se = new SearchEngine({'indexPath': 'test_search4', logLevel: 'warn'});

            se.indexing(epub, function () {

                se.search(["epub"], "Accessible EPUB 3", function (hits) {

                    var first = hits;

                    se.search(["epub"], "Accessible EPUB 3", function (hits) {

                        rimraf.sync('test_search4');
                        (first).should.eql(hits);
                        done();

                    });
                });
            });
        });
    });
});
