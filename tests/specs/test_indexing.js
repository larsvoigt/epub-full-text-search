import should from 'should';
import fs from 'fs';
import searchEngine from '../../';
import constants from "../../src/Constants";
import init from '../init';
import express from 'express';
import uuidV1 from 'uuid/v1';
import rimraf from 'rimraf';

describe('indexing ', function () {

    var se;
    const PORT = 8089;
    var server;
    const DB = 'INDEXING-Test';

    beforeEach(function (done) {
        this.timeout(15000);
        init()
            .then(function () {
                return searchEngine({'indexPath': DB});
            })
            .then(function (_se) {
                se = _se;
                done();
            })
            .fail(done);
    });

    afterEach(function (done) {
        se.close()
            .then(function () {
                // rimraf.sync(DB);

                if (server)
                    server.close();
                rimraf(DB, function () {
                    done();
                });
            })
            .fail(done);
    });

    it('Should fail if directory is empty', function (done) {

        this.timeout(10000);

        const emptyDir = 'emptyDir';
        fs.mkdirSync(emptyDir);

        se.indexing(emptyDir)
            .then(info => {
                done('Indexing was not rejected');
            })
            .fail(function (err) {
                fs.rmdirSync(emptyDir);
                (err instanceof Error).should.be.true();
                done();
            });
    });

    it('Should index all EPUBs from path', function (done) {

        this.timeout(100000);
        se.indexing(constants.EPUB)
            .then(() => {
                done();
            });
    });


    it('Should indexing EPUB from URL without error.', function (done) {

        this.timeout(10000);
        const uuid = uuidV1();
        let app = express();
        app.use(express.static('./node_modules/epub3-samples/accessible_epub_3'));
        server = app.listen(PORT, () => {
            se.indexing('http://localhost:' + PORT + '/', uuid)
                .then(() => {
                    done();
                });
        });
    });
});