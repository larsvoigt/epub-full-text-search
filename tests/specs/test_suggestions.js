import should from 'should';
import constants from "../../src/Constants";
import searchEngine from '../../';
import init from '../init';

describe('suggestions', () => {

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

    it('should return all suggestions for string epub', done => {
        se.match('epub', '')
            .then(matches => {
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

    it('should return empty list because match string must be longer than threshold (3)', done => {
        se.match('ep', '')
            .then(matches => {
                matches.length.should.be.exactly(0);
                done();
            })
            .fail(done);
    });
    
    it('should return all suggestions for string matrix', done => {

        se.match('matrix', '')
            .then(matches => {
                console.log(matches);
                matches.length.should.be.exactly(2);
                matches[0].should.be.exactly('matrix');
                matches[1].should.be.exactly('matrixform');

                done();
            })
            .fail(done);
    });

    it('suggestions should be return nothing', done => {

        se.match('matrix', 'Accessible EPUB 3')
            .then(matches => {
                console.log(matches);
                matches.length.should.be.exactly(0);

                done();
            })
            .fail(done);
    });

    it('suggestions should be return matches for A First Course in Linear Algebra', done => {

        se.match('matrix', 'A First Course in Linear Algebra')
            .then(matches => {
                console.log(matches);
                matches.length.should.be.exactly(2);
                matches[0].should.be.exactly('matrix');
                matches[1].should.be.exactly('matrixform');

                done();
            })
            .fail(done);
    });

    it('suggestions should be return matches for Accessible EPUB 3', done => {

        se.match('epub', 'Accessible EPUB 3')
            .then(matches => {
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