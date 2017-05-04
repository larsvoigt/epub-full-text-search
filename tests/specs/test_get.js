import should from 'should';
import searchEngine from '../../';
import init from '../init';
import express from 'express';
import uuidV1 from 'uuid/v1';
import rimraf from 'rimraf';


describe('get ', function () {

    var se;
    const PORT = 8089;
    const DB = 'Get-Test';
    var server;

    beforeEach(function (done) {
        this.timeout(10000);
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
                done();
            })
            .fail(done);

        if (server)
            server.close();

        rimraf.sync(DB);
    });


    it('Should get docs for passed uuid.', function (done) {

        this.timeout(10000);
        const uuid = uuidV1();
        let app = express();
        app.use(express.static('./node_modules/epub3-samples/accessible_epub_3'));
        server = app.listen(PORT, () => {
            se.indexing('http://localhost:' + PORT + '/', uuid)
                .then(() => {
                    se.get(uuid)
                        .then(docs => {
                            docs.length.should.be.exactly(20);
                            se.del(uuid).then(() => {
                                done();
                            });
                        })
                        .catch(err => {
                            console.error(err);
                        });
                });
        });
    });
});