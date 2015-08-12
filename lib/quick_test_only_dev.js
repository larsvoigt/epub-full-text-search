//console.log(process.cwd())
var fs = require('fs');
var rimraf = require('rimraf');
var SearchEngine = require('../');
var se = new SearchEngine({'indexPath': 'test_search', logLevel: 'warn'});


console.log(process.cwd());
se.indexing('../node_modules/epub3-samples/accessible_epub_3', function (info) {

    console.log(info);

    // search(query, epubTitle, result_callback)
    se.search(["epub"], "Accessible EPUB 3", function (results) {

        //var s = fs.createWriteStream('hits.json');
        //s.write(JSON.stringify(results));
        //s.end();

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

//se.indexing('../node_modules/epub3-samples/linear-algebra', function (info) {
//
//    console.log(info);
//
//    //search(query, epubTitle, result_callback)
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
//
//});


rimraf.sync('test_search');
