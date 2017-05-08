const chai = require('chai');
import should from 'should';
import chaiHttp from 'chai-http';
import webservice from './../../src/WebService';
import uuidV1 from 'uuid/v1';
import express from 'express';
chai.use(chaiHttp);
const uuid1 = uuidV1();


// TODO: test cases with wrong parameters oder none paramters

describe('rest api', function () {

    var server;
    const EPUB = './node_modules/epub3-samples/accessible_epub_3';
    const PORT = 8089;

    beforeEach(function (done) {

        let app = express();
        app.use(express.static(EPUB));
        server = app.listen(PORT, () => {
            done();
        });
    });

    afterEach(function (done) {
        if (server)
            server.close();
        done();
    });

    describe('/deleteFromIndex', () => {

        it('It should delete document from index.', function (done) {

            this.timeout(10000);
            chai.request(webservice)
                .get('/addToIndex')
                .query({url: 'http://localhost:8089/', uuid: uuid1}) // /search?name=foo&limit=10
                .end((err, res) => {
                    chai.request(webservice)
                        .get('/deleteFromIndex')
                        .query({uuid: uuid1}) // /deleteFromIndex?uuid=uuid
                        .end((err, res) => {
                            res.status.should.be.equal(200);
                            res.text.should.be.type('string');
                            res.text.should.containEql('deleted');
                            done();
                        });
                });
        });
    });

    describe('/search', () => {

        it('It should indexing document and test search for term.', function (done) {

            this.timeout(10000);
            chai.request(webservice)
                .get('/addToIndex')
                .query({url: 'http://localhost:8089/', uuid: uuid1})
                .end((err, res) => {
                    chai.request(webservice)
                        .get('/search')
                        .query({q: 'epub', uuid: uuid1})
                        .end((err, res) => {
                            res.status.should.be.equal(200);
                            const hits = JSON.parse(res.text);
                            hits.length.should.be.exactly(15);
                            done();
                        });
                });
        });
    });

    describe('/addToIndex', () => {

        it('It should add document to index (normalize epub content)', function (done) {

            this.timeout(10000);
            chai.request(webservice)
                .get('/addToIndex')
                .query({url: 'http://localhost:8089/', uuid: uuid1}) // /search?name=foo&limit=10
                .end((err, res) => {
                    res.status.should.be.equal(200);
                    res.text.should.be.type('string');
                    res.text.should.be.equal('DONE! EPUB is indexed.');
                    done();
                });
        });

        it('It should indexing document from remote resource. The resource is fetched over https.' +
            'So this test checks the request support for secure communication over https and ' +
            'will fail if the remote resource could not be found.', function (done) {

            this.timeout(40000);
            chai.request(webservice)
                .get('/addToIndex')
                .query({url: 'https://readium.firebaseapp.com/epub_content/accessible_epub_3/', uuid: uuid1})
                .end((err, res) => {
                    res.status.should.be.equal(200);
                    res.text.should.be.type('string');
                    res.text.should.be.equal('DONE! EPUB is indexed.');
                    done();
                });
        });
    });

});
