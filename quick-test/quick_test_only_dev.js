import rimraf from 'rimraf';
import searchEngine from '../';

const INDEX_DB = 'quick_test';
//
//const CONTENT = '../node_modules/epub3-samples';
// const CONTENT = '/home/alan/workspace/epub-full-text-search/quick-test/test_content';
const CONTENT = 'http://localhost:8089/';

console.log(process.cwd());
rimraf.sync('IndexControllerDB.json');

function indexing(callback) {

    searchEngine({'indexPath': INDEX_DB})
        .then(se => {

            se.indexing(CONTENT, "a539122c-68c3-43c7-b08b-147942313680")
                .then(() => {
                    console.log('\nDONE! All is indexed.\n\n'.yellow);
                    se.close(() => {
                    });
                    return callback();

                }).catch(err => {
                console.log(err);
            });
        })
        .catch(err => {
            console.log(err);
        });
}

function testSearch(q, booktitle) {

    searchEngine({'indexPath': INDEX_DB})
        .then(se => {

            // search(query, epubTitle, result_callback)
            se.search(q, booktitle)
                .then(results => {

                    if (results.length === 0) {
                        console.log('Find nothing!');
                        return;
                    }

                    //const s = fs.createWriteStream('hits.json');
                    //s.write(JSON.stringify(results));
                    //s.end();

                    se.close(() => {
                    });

                    console.log('total hits: ' + results.length + " (expected 15)");

                    for (var i in results) {
                        console.log("--------------------------------------------------------------------------");
                        console.log('*** epubTitle: ' + results[i].epubTitle + ' ***');
                        console.log("--------------------------------------------------------------------------");
                        console.log('*** baseCfi: ' + results[i].baseCfi + ' ***');
                        console.log('*** href: ' + results[i].href + ' ***');
                        console.log('*** cfis: ' + results[i].cfis.length + ' hits\n------> ' + results[i].cfis.join('\n------> ') + '\n***');
                    }
                })
                .fail(err => {
                    console.log(err);
                });
        });

    //se.search(["epub"], "Accessi", results => {
//
//    console.log("--------------------------------------------------------------------------");
//    console.log('total hits: ' + results.length + " (expected 0)");
//});

    //    se.search(["matrix"], "", results => {
//
//        //const s = fs.createWriteStream('hits.json');
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

    searchEngine({'indexPath': INDEX_DB}, (err, se) => {

        if (err)
            return console.log(err);

        se.match("epu", "", (err, results) => {

            if (err)
                console.error(err);

            console.log('total hits: ' + results.length + " (expected 4)");
            console.log('suggestions: ' + results + "");
            se.close(() => {
            });
        });
    });
}

indexing(() => {

    //testSearch("someone", "Accessible EPUB 3");
    testSearch("epub", "");
    //testSearch("그가 장난기", "");
    //testMatcher();

});