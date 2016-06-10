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

    it('filter by filename', function(done) {
    
        se.query({
            query: [
                {
                    AND: [
                        {'*': ['epub']},
                        {filename: ['accessible_epub_3']}
                    ]
                }
            ]
        }, ['epub'])
            .then(function(hits) {
                hits.length.should.be.exactly(15);
                done();
            })
            .fail(done);
    });
});

