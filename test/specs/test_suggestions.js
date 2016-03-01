const should = require('should');
const fs = require('fs');

const searchEngine = require('../../');

const testDB = 'mocha_test_DB'; // TODO: process.env.testDB

describe('suggestions', function () {

    it('should return all suggestions for string epub', function (done) {

        searchEngine({'indexPath': testDB}, function (err, se) {
            if (err) {
                console.log(err);
            } else {

                se.match('epub', '', function (err, matches) {

                    console.log(matches);
                    matches.length.should.be.exactly(4);
                    matches[0].should.be.exactly('epub');
                    matches[1].should.be.exactly('epubs');
                    matches[2].should.be.exactly('epubcheck');
                    matches[3].should.be.exactly('epubreadingsystem');

                    se.close(function () {
                        done();
                    })
                });
            }
        });
    });

    it('should return all suggestions for string matrix', function (done) {

        searchEngine({'indexPath': testDB}, function (err, se) {
            if (err) {
                console.log(err);
            } else {

                se.match('matrix', '', function (err, matches) {

                    console.log(matches);
                    matches.length.should.be.exactly(2);
                    matches[0].should.be.exactly('matrix');
                    matches[1].should.be.exactly('matrixform');

                    se.close(function () {
                        done();
                    })
                });
            }
        });
    });

    it('suggestions should be return nothing', function (done) {

        searchEngine({'indexPath': testDB}, function (err, se) {
            if (err) {
                console.log(err);
            } else {

                se.match('matrix', 'Accessible EPUB 3', function (err, matches) {

                    console.log(matches);
                    matches.length.should.be.exactly(0);

                    se.close(function () {
                        done();
                    })
                });
            }
        });
    });

    it('suggestions should be return matches for A First Course in Linear Algebra', function (done) {

        searchEngine({'indexPath': testDB}, function (err, se) {
            if (err) {
                console.log(err);
            } else {

                se.match('matrix', 'A First Course in Linear Algebra', function (err, matches) {

                    console.log(matches);
                    matches.length.should.be.exactly(2);
                    matches[0].should.be.exactly('matrix');
                    matches[1].should.be.exactly('matrixform');

                    se.close(function () {
                        done();
                    })
                });
            }
        });
    });

    it('suggestions should be return matches for Accessible EPUB 3', function (done) {

        searchEngine({'indexPath': testDB}, function (err, se) {
            if (err) {
                console.log(err);
            } else {

                se.match('epub', 'Accessible EPUB 3', function (err, matches) {

                    console.log(matches);
                    matches.length.should.be.exactly(4);
                    matches[0].should.be.exactly('epub');
                    matches[1].should.be.exactly('epubs');
                    matches[2].should.be.exactly('epubcheck');
                    matches[3].should.be.exactly('epubreadingsystem');

                    se.close(function () {
                        done();
                    })
                });
            }
        });
    });
});