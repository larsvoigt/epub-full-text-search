import express from 'express';
import searchEngine from '../../../';
import webservice from '../../../src/WebService';

const Sample = {};


webservice.use(express.static('example/as-a-service/express'));
webservice.get('/readium', function (req, res) {
    // workaround iframe cors -> with this code is possible to listen on readium trigger within iframe
    res.header("Access-Control-Allow-Origin", "*");
    res.sendFile(process.cwd() + '/example/as-a-service/express/readium.html');
});


Sample.startIndexing = function () {

    var epubs = 'node_modules/epub3-samples';

    if (process.env.DEBUG) {
        console.log("debug mode");
        epubs = '../../../node_modules/epub3-samples';
    }

    var se;
    searchEngine({})
        .then((_se) => {
            se = _se;
            return se.indexing(epubs);
        })
        .then(info => {
            console.log(info);

            return se.close();
        })
        .fail(function (err) {
            console.log(err);
        });
};

Sample.startIndexing();



