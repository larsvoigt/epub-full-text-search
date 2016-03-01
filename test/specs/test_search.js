// ext libs
const should = require('should');
const fs = require('fs');


const searchEngine = require('../../');

const hitsAsJson = 'test/specs/hits.json';
const testDB = 'mocha_test_DB'; // TODO: process.env.testDB

describe('search', function () {

    it('count hits of keyword', function (done) {

        searchEngine({'indexPath': testDB}, function (err, se) {

            if (err) {
                console.log(err);
            } else {
                se.search(["epub"], "Accessible EPUB 3", function (hits) {

                    se.close(function () {
                        (hits.length).should.be.exactly(15);
                        done();
                    })
                });
            }
        });
    });

    it('should find no hits if keyword is not included', function (done) {

        searchEngine({'indexPath': testDB}, function (err, se) {
            if (err) {
                console.log(err);
            } else {

                se.search(["Accessi"], "Accessible EPUB 3", function (hits) {

                    se.close(function () {
                        (hits.length).should.be.exactly(0);

                        done();
                    });
                });
            }
        });
    });

    it('should return the right hits', function (done) {

        searchEngine({'indexPath': testDB}, function (err, se) {
            if (err) {
                console.log(err);
            } else {


                se.search(["epub"], "Accessible EPUB 3", function (hits) {

                    se.close(function () {
                        var data = JSON.parse(fs.readFileSync(hitsAsJson));
                        (hits).should.eql(data);

                        done();
                    });
                });
            }
        });
    });

    it('should return always the same hits', function (done) {

        searchEngine({'indexPath': testDB}, function (err, se) {
            if (err) {
                console.log(err);
            } else {

                se.search(["epub"], "Accessible EPUB 3", function (hits) {

                    var first = hits;

                    se.search(["epub"], "Accessible EPUB 3", function (hits) {

                        se.close(function () {

                            (first).should.eql(hits);
                            done();
                        });
                    });
                });
            }
        });
    });

    it('check hit properties are set', function (done) {

        searchEngine({'indexPath': testDB}, function (err, se) {
            if (err) {
                console.log(err);
            } else {

                se.search(["epub"], "Accessible EPUB 3", function (hits) {

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
            }
        });
    });
});

