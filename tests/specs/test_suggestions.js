import should from 'should';
import constants from "../../src/Constants";
import searchEngine from '../../';
import rimraf from 'rimraf';
import winston from './../../src/Logger';

describe('suggestions', () => {

    var se;
    const DB = 'SUGGESTIONS-Test';
    rimraf.sync(DB);

    beforeEach(function(done) {
        this.timeout(25000);
        searchEngine({'indexPath': DB})
            .then(function (_se) {
                se = _se;
                se.indexing(constants.EPUB)
                    .then(() => {
                        done();
                    });
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

    it('should return all suggestions for term epub', done => {
        se.match('epub', '')
            .then(matches => {
                winston.log('info', matches);
                matches.length.should.be.exactly(4);
                matches[0].should.be.exactly('epub');
                matches[1].should.be.exactly('epubs');
                matches[2].should.be.exactly('epubcheck');
                matches[3].should.be.exactly('epubreadingsystem');


                done();
            })
            .fail(done);
    });

    it('Test suggestions threshold', done => {
        se.match('ep', '')
            .then(matches => {
                matches.length.should.be.exactly(0);
                done();
            })
            .fail(done);
    });
    
    it('should return all suggestions for term matrix', done => {

        se.match('matrix', '')
            .then(matches => {
                winston.log('info', matches);
                matches.length.should.be.exactly(2);
                matches[0].should.be.exactly('matrix');
                matches[1].should.be.exactly('matrixform');

                done();
            })
            .fail(done);
    });

    it('No suggestions, should return nothing.', done => {

        se.match('matrix', 'Accessible EPUB 3')
            .then(matches => {
                winston.log('info', matches);
                matches.length.should.be.exactly(0);

                done();
            })
            .fail(done);
    });

    it('should get suggestions for book "A First Course in Linear Algebra"', done => {

        se.match('matrix', 'A First Course in Linear Algebra')
            .then(matches => {
                winston.log('info', matches);
                matches.length.should.be.exactly(2);
                matches[0].should.be.exactly('matrix');
                matches[1].should.be.exactly('matrixform');

                done();
            })
            .fail(done);
    });

    it('should get suggestions for book "Accessible EPUB 3"', done => {

        se.match('epub', 'Accessible EPUB 3')
            .then(matches => {
                winston.log('info', matches);
                matches.length.should.be.exactly(4);
                matches[0].should.be.exactly('epub');
                matches[1].should.be.exactly('epubs');
                matches[2].should.be.exactly('epubcheck');
                matches[3].should.be.exactly('epubreadingsystem');
                rimraf.sync(DB); // Hacky to clean up
                done();
            })
            .fail(done);
    });
});