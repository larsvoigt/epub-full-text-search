// ext libs
import should from 'should';
import constants from "../../src/Constants";
import searchEngine from '../../';
import uuidV1 from 'uuid/v1';
import rimraf from 'rimraf';
import express from 'express';

describe('search', () => {

    var se;
    const PORT = 8089;
    const DB = 'SEARCH-Test';
    rimraf.sync(DB);
    var server;

    beforeEach(function (done) {
        this.timeout(30000);

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

        if (server)
            server.close();

    });

    it('count hits of search term', done => {
        se.search("epub", "Accessible EPUB 3")
            .then(function (hits) {
                hits.length.should.be.exactly(15);
                done();
            })
            .fail(done);
    });

    it('should find no hits if search term is not included', done => {

        se.search("Accessi", "Accessible EPUB 3")
            .then(function (hits) {
                hits.length.should.be.exactly(0);
                done();
            })
            .fail(done);
    });

    // it('should return the right hits', done => {
    //
    //     se.search("epub", "Accessible EPUB 3")
    //         .then(function(hits) {
    //             const data = JSON.parse(fs.readFileSync(constants.HITS_AS_JSON));
    //             hits.should.eql(data);
    //             done();
    //         })
    //         .fail(done);
    // });

    it('Test the same search twice; it should return always the same hits', done => {

        var first;

        se.search("epub", "Accessible EPUB 3")
            .then(function (hits) {
                first = hits;
                return se.search("epub", "Accessible EPUB 3");
            })
            .then(function (hits) {
                first.should.eql(hits);
                done();
            })
            .fail(done);
    });

    it('check all result properties are set', done => {

        se.search("epub", "Accessible EPUB 3")
            .then(function (hits) {
                hits.forEach(function (hit) {
                    Object.keys(hit).should.have.length(6);
                    hit.should.have.property('baseCfi');
                    hit.should.have.property('cfis');
                    hit.should.have.property('epubTitle');
                    hit.should.have.property('id');
                    hit.should.have.property('href');
                    hit.should.have.property('filename');

                    hit.should.not.have.enumerable('cfis', 0);
                    hit.href.should.not.be.empty;
                    hit.baseCfi.should.not.be.empty;
                    hit.epubTitle.should.not.be.empty;
                    hit.id.should.not.be.empty;
                });
                done();
            })
            .fail(done);
    });

    it('test multiple matches within one text node', done => {

        se.search("someone", "Accessible EPUB 3")
            .then(function (hits) {

                hits[0].cfis.length.should.be.exactly(5);
                hits[1].cfis.length.should.be.exactly(4);
                hits[2].cfis.length.should.be.exactly(2);
                hits[3].cfis.length.should.be.exactly(5);
                hits[4].cfis.length.should.be.exactly(1);
                done();
            })
            .fail(done);
    });

    it('Test multiple books are index, but it should get only hits from specific book', done => {

        se.search("someone", "Accessible EPUB 3")
            .then(function (hits) {
                hits.length.should.be.exactly(5);
                done();
            })
            .fail(done);
    });

    it('Test multiple books are index, but it should get only hits from specific book', done => {

        se.search("someone", "A First Course in Linear Algebra")
            .then(function (hits) {
                hits.length.should.be.exactly(1);
                done();
            })
            .fail(done);
    });

    it('Test search over all book: Should get all hits form all books', done => {

        se.search("someone", "*")
            .then(function (hits) {
                hits.length.should.be.exactly(6);
                done();
            })
            .fail(done);
    });

    it('Test with empty paramters', done => {

        se.search("", "")
            .then(function (hits) {
                hits.length.should.be.exactly(0);
                done();
            })
            .fail(done);
    });

    it('Search with uuid.', function (done) {

        //TODO: Use promise all ?
        this.timeout(30000);
        const uuid1 = uuidV1();
        const uuid2 = uuidV1();
        let app = express();
        app.use(express.static('./node_modules/epub3-samples/'));
        server = app.listen(PORT, () => {
            se.flush().then(() => {
                se.indexing('http://localhost:' + PORT + '/accessible_epub_3/', uuid1)
                    .then(() => {
                        se.indexing('http://localhost:' + PORT + '/linear-algebra/', uuid2)
                            .then(() => {
                                se.search("epub", "", uuid1)
                                    .then(function (hits) {
                                        hits.length.should.be.exactly(15);
                                        done();
                                        rimraf.sync(DB); // Hacky to clean up
                                    })
                                    .fail(done);
                            });
                    });
            });
        });
    });
});

