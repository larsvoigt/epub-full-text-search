// ext libs
var should = require('should');
var rimraf = require('rimraf');
var fs = require('fs');


var SearchEngine = require('../../');


var epub = 'node_modules/epub3-samples/accessible_epub_3';
var hitsAsJson = 'test/specs/hits.json';

describe('search', function () {

    rimraf.sync('test_search');

    it('count hits of keyword', function (done) {

        this.timeout(10000);

        var se = new SearchEngine({'indexPath': 'test_search', logLevel: 'warn'});

        se.indexing(epub, function () {

            se.search(["epub"], "Accessible EPUB 3", function (hits) {

                rimraf.sync('test_search');
                se.close(function () {
                    (hits.length).should.be.exactly(15);
                    done();
                })
            });
        });
    });

    it('should find no hits if keyword is not included', function (done) {

        this.timeout(10000);

        var se = new SearchEngine({'indexPath': 'test_search', logLevel: 'warn'});

        se.indexing(epub, function () {

            se.search(["Accessi"], "Accessible EPUB 3", function (hits) {

                rimraf.sync('test_search');
                se.close(function () {
                    (hits.length).should.be.exactly(0);

                    done();
                });
            });
        });
    });

    it('should return the right hits', function (done) {

        this.timeout(10000);

        var se = new SearchEngine({'indexPath': 'test_search', logLevel: 'warn'});

        se.indexing(epub, function () {

            se.search(["epub"], "Accessible EPUB 3", function (hits) {

                rimraf.sync('test_search');
                se.close(function () {
                    var data = JSON.parse(fs.readFileSync(hitsAsJson));
                    (hits).should.eql(data);

                    done();
                });
            });
        });
    });

    it('should return always the same hits', function (done) {

        this.timeout(10000);

        var se = new SearchEngine({'indexPath': 'test_search', logLevel: 'warn'});

        se.indexing(epub, function () {

            se.search(["epub"], "Accessible EPUB 3", function (hits) {

                var first = hits;

                se.search(["epub"], "Accessible EPUB 3", function (hits) {

                    rimraf.sync('test_search');
                    se.close(function () {

                        (first).should.eql(hits);
                        done();
                    });
                });
            });
        });
    });

    it('check hit properties are set', function (done) {

        this.timeout(10000);

        var se = new SearchEngine({'indexPath': 'test_search', logLevel: 'warn'});

        se.indexing(epub, function () {

            se.search(["epub"], "Accessible EPUB 3", function (hits) {

                rimraf.sync('test_search');
                se.close(function () {
                                        
                    for (i in hits) {

                        Object.keys(hits[i]).should.have.length(5);
                        hits[i].should.have.property('baseCfi');
                        hits[i].should.have.property('cfis');
                        hits[i].should.have.property('epubTitle');
                        hits[i].should.have.property('id');
                        hits[i].should.have.property('href');
                        
                        hits[i].should.not.have.enumerable('cfis', 0);
                        hits[i].href.should.not.be.empty;
                        hits[i].baseCfi.should.not.be.empty;
                        hits[i].epubTitle.should.not.be.empty;
                        hits[i].id.should.not.be.empty;
                    }

                    done();
                });
            });
        });
    });
});

