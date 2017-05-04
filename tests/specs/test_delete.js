import should from 'should';
import searchEngine from '../../';
import constants from "../../src/Constants";
import init from '../init';
import express from 'express';
import uuidV1 from 'uuid/v1'
import rimraf from 'rimraf';


describe('delete ', function () {

    var se;
    const PORT = 8089;
    const DB = 'DEL-Test';
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


    it('Should delete all doc with passed uuid.', function (done) {

        this.timeout(10000);
        const uuid = uuidV1();
        let app = express();
        app.use(express.static('./node_modules/epub3-samples/accessible_epub_3'));
        server = app.listen(PORT, () => {
            se.indexing('http://localhost:' + PORT + '/', uuid)
                .then(() => {
                    se.del(uuid).then(() => {
                        done();
                    });
                });
        });
    });

    it('Delete should be fail. Id is not set.', function (done) {

        this.timeout(10000);

        se.del("")
            .then(() => {
            })
            .catch(err => {
                console.error(err);
                done();
            });
    });


    it('Should delete only docs with uuid.', function (done) {

        //TODO: Use promise all ?
        this.timeout(150000);
        const uuid1 = uuidV1();
        const uuid2 = uuidV1();
        let app = express();
        app.use(express.static('./node_modules/epub3-samples/'));
        server = app.listen(PORT, () => {
            se.indexing('http://localhost:' + PORT + '/accessible_epub_3/', uuid1)
                .then(() => {
                    se.indexing('http://localhost:' + PORT + '/linear-algebra/', uuid2)
                        .then(() => {
                            se.del(uuid2).then(() => {
                                se.get(uuid1)
                                    .then(docs => {
                                        docs.length.should.be.exactly(20);
                                        done();
                                    })
                                    .catch(err => {
                                        console.error(err);
                                    });
                            });
                        });
                });
        });
    });
});