var should = require('should');
var fs = require('fs');


var SearchEngine = require('../../');

var testDB = 'test_DB'; // TODO: process.env.testDB

describe('suggestions', function () {

    it('Should only ', function (done) {

        var se = new SearchEngine({'indexPath': testDB, logLevel: 'warn'});

        se.match('epub', function (err, matches) {
            
            console.log(matches);
            matches.length.should.be.exactly(4);
            matches[0].should.be.exactly('epub');
            matches[1].should.be.exactly('epubs');
            matches[2].should.be.exactly('epubcheck');
            matches[3].should.be.exactly('epubreadingsystem');
            
            se.close(function () {
                done();
            })
        });
    });
});