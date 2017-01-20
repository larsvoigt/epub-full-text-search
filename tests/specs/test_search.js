// ext libs
const should = require('should'),
    fs = require('fs'),
    constants = require("../../src/Constants"),
    searchEngine = require('../../'),
    init = require('../init');

describe('search', function () {

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

    it('count hits of keyword', function (done) {
        se.search("epub", "Accessible EPUB 3")
            .then(function(hits) {
                hits.length.should.be.exactly(15);
                done();
            })
            .fail(done);
    });

    it('should find no hits if keyword is not included', function (done) {

        se.search("Accessi", "Accessible EPUB 3")
            .then(function(hits) {
                hits.length.should.be.exactly(0);
                done();
            })
            .fail(done);
    });

    // it('should return the right hits', function (done) {
    //
    //     se.search("epub", "Accessible EPUB 3")
    //         .then(function(hits) {
    //             var data = JSON.parse(fs.readFileSync(constants.HITS_AS_JSON));
    //             hits.should.eql(data);
    //             done();
    //         })
    //         .fail(done);
    // });

    it('should return always the same hits', function (done) {

        var first;

        se.search("epub", "Accessible EPUB 3")
            .then(function(hits) {
                first = hits;
                return se.search("epub", "Accessible EPUB 3");
            })
            .then(function(hits) {
                first.should.eql(hits);
                done();
            })
            .fail(done);
    });

    it('check hit properties are set', function (done) {

        se.search("epub", "Accessible EPUB 3")
            .then(function(hits) {
                hits.forEach(function(hit) {
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

    it('test multiple match within one text node', function (done) {

        se.search("someone", "Accessible EPUB 3")
            .then(function(hits) {
                
                hits[0].cfis.length.should.be.exactly(5);
                hits[1].cfis.length.should.be.exactly(5);
                hits[2].cfis.length.should.be.exactly(1);
                hits[3].cfis.length.should.be.exactly(4);
                hits[4].cfis.length.should.be.exactly(2);
                done();
            })
            .fail(done);
    });

    it('Test query string match within two books,' +
        ' should return only hits form Accessible EPUB 3', function (done) {

        se.search("someone", "Accessible EPUB 3")
            .then(function(hits) {
                hits.length.should.be.exactly(5);
                done();
            })
            .fail(done);
    });
});

