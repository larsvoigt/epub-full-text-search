const should = require('should'),
    searchEngine = require('../../'),
    constants = require("../../src/Constants"),
    init = require('../init');

describe('suggestions', function () {

    var se;

    beforeEach(function(done) {
        this.timeout(10000);
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

    it('should return all suggestions for string epub', function (done) {
        se.match('epub', '')
            .then(function (matches) {
                console.log(matches);
                matches.length.should.be.exactly(4);
                matches[0].should.be.exactly('epub');
                matches[1].should.be.exactly('epubs');
                matches[2].should.be.exactly('epubcheck');
                matches[3].should.be.exactly('epubreadingsystem');


                done();
            })
            .fail(done);
    });

    it('should return empty list because match string must be longer than threshold (3)', function (done) {
        se.match('ep', '')
            .then(function (matches) {
                matches.length.should.be.exactly(0);
                done();
            })
            .fail(done);
    });
    
    it('should return all suggestions for string matrix', function (done) {

        se.match('matrix', '')
            .then(function (matches) {
                console.log(matches);
                matches.length.should.be.exactly(2);
                matches[0].should.be.exactly('matrix');
                matches[1].should.be.exactly('matrixform');

                done();
            })
            .fail(done);
    });

    it('suggestions should be return nothing', function (done) {

        se.match('matrix', 'Accessible EPUB 3')
            .then(function (matches) {
                console.log(matches);
                matches.length.should.be.exactly(0);

                done();
            })
            .fail(done);
    });

    it('suggestions should be return matches for A First Course in Linear Algebra', function (done) {

        se.match('matrix', 'A First Course in Linear Algebra')
            .then(function (matches) {
                console.log(matches);
                matches.length.should.be.exactly(2);
                matches[0].should.be.exactly('matrix');
                matches[1].should.be.exactly('matrixform');

                done();
            })
            .fail(done);
    });

    it('suggestions should be return matches for Accessible EPUB 3', function (done) {

        se.match('epub', 'Accessible EPUB 3')
            .then(function (matches) {
                console.log(matches);
                matches.length.should.be.exactly(4);
                matches[0].should.be.exactly('epub');
                matches[1].should.be.exactly('epubs');
                matches[2].should.be.exactly('epubcheck');
                matches[3].should.be.exactly('epubreadingsystem');

                done();
            })
            .fail(done);
    });
});