var fs = require('fs');
var rimraf = require('rimraf');
const searchEngine = require('../');
var INDEX_DB = 'quick_test';
//
var content = '../node_modules/epub3-samples';
//var content = 'epub_content';
//var content = '/home/albert/workspace/test-content'
//var content = '/home/alan/Sprachpraxis_UT';

console.log(process.cwd());

function indexing(callback) {

    searchEngine({'indexPath': INDEX_DB}, function (err, se) {

        if (err) 
            return console.log(err);

        se.indexing(content, function (info) {
            console.log(info);
            se.close(function () {
            });
            return callback();
        });
    });
}

function testSearch() {

    searchEngine({'indexPath': INDEX_DB}, function (err, se) {

        if (err) 
            return console.log(err);

        // search(query, epubTitle, result_callback)
        se.search(["epub"], "Accessible EPUB 3", function (results) {

            //var s = fs.createWriteStream('hits.json');
            //s.write(JSON.stringify(results));
            //s.end();

            se.close(function () {
            });

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

    searchEngine({'indexPath': INDEX_DB}, function (err, se) {

        if (err) 
            return console.log(err);

        se.match("epu", "", function (err, results) {

            if (err)
                console.error(err);

            console.log('total hits: ' + results.length + " (expected 4)");
            console.log('suggestions: ' + results + "");
            se.close(function () {
            });
        });
    });
}

indexing(function () {

    testSearch();
    //testMatcher();

});