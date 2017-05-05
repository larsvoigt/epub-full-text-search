// ext libs
import should from 'should';
import constants from "../../src/Constants";
import searchEngine from '../../';
import rimraf from 'rimraf';

describe('query', () => {

    var se;
    const DB = 'QUERY-Test';
    rimraf.sync(DB);

    beforeEach(function (done) {
        this.timeout(10000);
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

    afterEach(function (done) {
        se.close()
            .then(function () {
                done();
            })
            .fail(done);
    });

    it('without filename query', function (done) {
        this.timeout(10000);
        const search = 'test';
        se.query({query: [{AND: [{'*': [search]}]}]}, search)
            .then(function (hits) {
                hits.length.should.be.exactly(11);
                done();
            })
            .fail(done);
    });

    it('filter by filename', function (done) {
        const search = 'test';
        se.query({query: [{AND: [{'*': [search]}, {filename: ['accessible_epub_3']}]}]}, search)
            .then(function (hits) {
                hits.length.should.be.exactly(3);
                rimraf.sync(DB); // Hacky to clean up
                done();
            })
            .fail(done);
    });
});

