var fs = require('fs');
var rimraf = require('rimraf');
const searchEngine = require('../');
var INDEX_DB = 'quick_test';
//
const CONTENT = '../node_modules/epub3-samples';
// const CONTENT = '/home/alan/workspace/epub-full-text-search/quick-test/test_content';

console.log(process.cwd()); 
 rimraf.sync('IndexControllerDB.json');

function indexing(callback) {

    searchEngine({'indexPath': INDEX_DB})
        .then(function (se) {

            se.indexing(CONTENT)
                .then(function () {

                    console.log('\nDONE! All is indexed.\n\n'.yellow);
                    se.close(function () {
                    });
                    return callback();

                }).fail(function (err) {
                    console.log(err);
                });
        })
        .fail(function (err) {
            console.log(err);
        });
}

function testSearch(q, booktitle) {

    searchEngine({'indexPath': INDEX_DB})
        .then(function (se) {

            // search(query, epubTitle, result_callback)
            se.search(q, booktitle)
                .then(function (results) {

                    if(results.length === 0) {
                        console.log('Find nothing!');
                        return;
                    }
                    
                    //var s = fs.createWriteStream('hits.json');
                    //s.write(JSON.stringify(results));
                    //s.end();

                    se.close(function () {
                    });

                    console.log('total hits: ' + results.length + " (expected 15)");

                    for (i in results) {
                        console.log("--------------------------------------------------------------------------");
                        console.log('*** epubTitle: ' + results[i].epubTitle + ' ***');
                        console.log("--------------------------------------------------------------------------");
                        console.log('*** baseCfi: ' + results[i].baseCfi + ' ***');
                        console.log('*** href: ' + results[i].href + ' ***');
                        console.log('*** cfis: ' + results[i].cfis.length + ' hits\n------> ' + results[i].cfis.join('\n------> ') + '\n***');
                    }
                })
                .fail(function (err) {
                    console.log(err);
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

    testSearch("someone", "Accessible EPUB 3");
    // testSearch("epub", "Accessible EPUB 3");
    //testSearch("그가 장난기", "");
    //testMatcher();

});