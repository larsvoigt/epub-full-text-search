var fs = require('fs');
var rimraf = require('rimraf');
var SearchEngine = require('../');
var indexDB = 'quick_test';
//
var content = '../node_modules/epub3-samples';
//var content = 'epub_content';
//var content = '/home/albert/workspace/test-content'

console.log(process.cwd());

function indexing(callback) {
    
        var se = new SearchEngine({'indexPath': indexDB, logLevel: 'warn'});
        se.indexing(content, function (info) {
            console.log(info);
            se.close(function () {});
            return callback();
        });
}

function testSearch() {

    var se = new SearchEngine({'indexPath': indexDB, logLevel: 'warn'});
    // search(query, epubTitle, result_callback)
    se.search(["epub"], "Accessible EPUB 3", function (results) {

        //var s = fs.createWriteStream('hits.json');
        //s.write(JSON.stringify(results));
        //s.end();

        se.close(function () {});

        console.log('total hits: ' + results.length + " (expected 15)");

        console.log("--------------------------------------------------------------------------");
        console.log("--------------------------------------------------------------------------");
        console.log('*** epubTitle: ' + results[0].epubTitle + ' ***');

        for (i in results) {
            console.log("--------------------------------------------------------------------------");
            console.log('*** baseCfi: ' + results[i].baseCfi + ' ***');
            console.log('*** href: ' + results[i].href + ' ***');
            console.log('*** cfis: ' + results[i].cfis.length + ' hits\n------> ' + results[i].cfis.join('\n------> ') + '\n***');
        }

    });

    //se.search(["epub"], "Accessi", function (results) {
//
//    console.log("--------------------------------------------------------------------------");
//    console.log('total hits: ' + results.length + " (expected 0)");
//});

    //    se.search(["matrix"], "", function (results) {
//
//        //var s = fs.createWriteStream('hits.json');
//        //s.write(JSON.stringify(results));
//        //s.end();
//        //
//        console.log('total hits: ' + results.length + " (expected 71)");
//
//        console.log("--------------------------------------------------------------------------");
//        console.log("--------------------------------------------------------------------------");
//        console.log('*** epubTitle: ' + results[0].epubTitle + ' ***');
//
//        for (i in results) {
//            console.log("--------------------------------------------------------------------------");
//            console.log('*** baseCfi: ' + results[i].baseCfi + ' ***');
//            console.log('*** href: ' + results[i].href + ' ***');
//            console.log('*** cfis: ' + results[i].cfis.length + ' hits\n------> ' + results[i].cfis.join('\n------> ') + '\n***');
//        }
//
//    });
}

function testMatcher() {

    var se = new SearchEngine({'indexPath': indexDB, logLevel: 'warn'});
    se.match("epu", "", function (err, results) {
        
        if(err)
            console.error(err);
        
        console.log('total hits: ' + results.length + " (expected 4)");
        console.log('suggestions: ' + results + "");
        se.close(function () {});
    });
}

indexing(function () {

    //testSearch();
    testMatcher();

});