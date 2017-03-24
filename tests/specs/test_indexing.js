import should from 'should';
import fs from 'fs';
import searchEngine from '../../';
import constants from "../../src/Constants";
import init from '../init';

describe('indexing ', function () {

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

    it('check directory is empty', function (done) {

        this.timeout(10000);

        const emptyDir = 'emptyDir';
        fs.mkdirSync(emptyDir);

        se.indexing(emptyDir)
            .then((info) => {
                done('Indexing was not rejected');
            })
            .fail(function(err) {
                fs.rmdirSync(emptyDir);
                (err instanceof Error).should.be.true();
                done();
            });
    });

    it('should index all epubs from passed argument path', function (done) {

        this.timeout(100000);
        se.indexing(constants.EPUB)
            .then(() => {
                done();
            });
    });
});