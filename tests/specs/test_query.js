// ext libs
import should from 'should';
import constants from "../../src/Constants";
import searchEngine from '../../';
import init from '../init';

describe('search', () => {

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

    it('without filename query', function(done) {
        this.timeout(10000);
        const search = 'test';
        se.query({
            query: [
                {
                    AND: [
                        {'*': [search]}
                    ]
                }
            ]
        }, search)
            .then(function(hits) {
                hits.length.should.be.exactly(11);
                done();
            })
            .fail(done);
    });

    it('filter by filename', function(done) {
        const search = 'test';
        se.query({
            query: [
                {
                    AND: [
                        {'*': [search]},
                        {filename: ['accessible_epub_3']}
                    ]
                }
            ]
        }, search)
            .then(function(hits) {
                hits.length.should.be.exactly(3);
                done();
            })
            .fail(done);
    });
});

