//console.log(process.cwd())
var fs = require('fs');
var SearchEngine = require('./SearchEngine.js');
var se = new SearchEngine({'indexPath': 'test_search', logLevel: 'warn'});

se.indexing('../epub_content/accessible_epub_3', function (info) {

    console.log(info);

    // search(query, epubTitle, callback)
    se.search(["epub"], "Accessible EPUB 3", function (results) {

        //var s = fs.createWriteStream('hits.json');
        //s.write(JSON.stringify(results));
        //s.end();
        //
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

    se.search(["epub"], "Accessi", function (results) {

        console.log("--------------------------------------------------------------------------");
        console.log('total hits: ' + results.length + " (expected 0)");
    });
});




